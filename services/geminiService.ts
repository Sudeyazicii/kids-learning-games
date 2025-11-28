import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// --- Audio Utilities ---
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeToPCM(bytes: Float32Array) {
    const l = bytes.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = bytes[i] * 32768;
    }
    const u8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary);
  }

// --- Service Class ---

class GeminiService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private activeLiveSessionCloser: (() => void) | null = null;
  
  // Audio Cache to make repeated phrases INSTANT
  private audioCache = new Map<string, AudioBuffer>();

  // Abort controller to kill pending fetches
  private currentAbortController: AbortController | null = null;
  private currentPlayId: number = 0;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioContext;
  }

  // Preload common phrases in PARALLEL to ensure they are ready ASAP
  async preload(texts: string[]) {
      const ctx = this.getAudioContext();
      
      // Use Promise.all to fetch concurrently instead of serially
      const promises = texts.map(async (text) => {
          if (this.audioCache.has(text)) return;
          
          try {
              // Creating a separate lightweight client call for preload
              // Note: We don't use this.speak logic here to avoid interrupting current audio
              const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
              });

              const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                  const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
                  this.audioCache.set(text, audioBuffer);
                  console.log(`Preloaded: "${text.substring(0, 20)}..."`);
              }
          } catch (e) {
              console.warn("Preload failed for:", text);
          }
      });

      await Promise.all(promises);
  }

  // Instant mechanical feedback
  playClickSound() {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
  }

  // GLOBAL AUDIO KILL SWITCH
  stopAllAudio() {
    this.currentPlayId++; 
    
    // 1. Abort any pending network request
    if (this.currentAbortController) {
        this.currentAbortController.abort();
        this.currentAbortController = null;
    }

    // 2. Hard stop current source node
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) { /* ignore */ }
      this.currentSource = null;
    }

    // 3. Stop Live Session if active
    if (this.activeLiveSessionCloser) {
        try {
            this.activeLiveSessionCloser();
        } catch (e) { console.error(e); }
        this.activeLiveSessionCloser = null;
    }
  }

  private async playBuffer(buffer: AudioBuffer, playId: number) {
    if (this.currentPlayId !== playId) return;

    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    
    // Double check after resume await
    if (this.currentPlayId !== playId) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
        if (this.currentSource === source) {
            this.currentSource = null;
        }
    };
    source.start();
    this.currentSource = source;
  }

  // 1. Text-to-Speech with CACHING
  async speak(text: string, interrupt = true) {
    if (interrupt) {
      this.stopAllAudio();
    }
    
    const myPlayId = this.currentPlayId;
    const ctx = this.getAudioContext();

    // CRITICAL: Resume context immediately to ensure browser allows audio
    if (ctx.state === 'suspended') {
        try {
             await ctx.resume(); 
        } catch(e) { console.error("Audio Context Resume Error", e); }
    }

    // A. Check Cache First (Instant Playback)
    if (this.audioCache.has(text)) {
        console.log(`Cache hit for: "${text.substring(0, 20)}..."`);
        const buffer = this.audioCache.get(text)!;
        await this.playBuffer(buffer, myPlayId);
        return;
    } else {
        console.log(`Cache miss for: "${text.substring(0, 20)}..."`);
    }

    // B. Network Fetch
    this.currentAbortController = new AbortController(); 

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, 
            },
          },
        },
      });

      if (this.currentPlayId !== myPlayId) return;

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
            decodeBase64(base64Audio),
            ctx,
            24000,
            1
        );

        if (this.currentPlayId !== myPlayId) return;

        // Save to cache for next time
        this.audioCache.set(text, audioBuffer);

        // Play
        await this.playBuffer(audioBuffer, myPlayId);
      }
    } catch (error) {
       // If aborted, it's fine. If real error, log it.
       if (this.currentPlayId === myPlayId) {
           console.error("TTS Error:", error);
       }
    }
  }

  // 2. Image Editing
  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Edit Error:", error);
      return null;
    }
  }

  // 3. Live Audio
  async startLiveSession(
      onAudioData: (buffer: AudioBuffer) => void, 
      onClose: () => void,
      onTranscription?: (text: string) => void
    ) {
    
    this.stopAllAudio();
    const myPlayId = this.currentPlayId;

    const ctx = this.getAudioContext();
    if(ctx.state === 'suspended') await ctx.resume();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    if (this.currentPlayId !== myPlayId) {
        stream.getTracks().forEach(t => t.stop());
        return { close: () => {} };
    }

    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputCtx.createMediaStreamSource(stream);
    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

    const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" }, 
            systemInstruction: "You are a playful listener for a 5-year-old child. Only use short encouraging words like 'Hımm', 'Harika', 'Sonra?', 'Vay canına'. Do not tell the story.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            }
        },
        callbacks: {
            onopen: () => {
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const base64PCM = encodeToPCM(inputData);
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({
                            media: {
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64PCM
                            }
                        });
                    });
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                const trans = msg.serverContent?.inputTranscription?.text;
                if (trans && onTranscription) {
                    onTranscription(trans);
                }
                const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    if (this.currentPlayId !== myPlayId) return;
                    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
                    if (this.currentPlayId !== myPlayId) return;
                    onAudioData(audioBuffer);
                }
            },
            onclose: () => {
                scriptProcessor.disconnect();
                source.disconnect();
                stream.getTracks().forEach(t => t.stop());
                onClose();
            },
            onerror: (err) => {
                console.error("Live Error", err);
            }
        }
    });

    const closeFn = () => {
        sessionPromise.then(s => s.close());
        try {
            scriptProcessor.disconnect();
            source.disconnect();
            stream.getTracks().forEach(t => t.stop());
        } catch(e) {}
        this.activeLiveSessionCloser = null;
    };

    this.activeLiveSessionCloser = closeFn;

    return { close: closeFn };
  }
}

export const gemini = new GeminiService();