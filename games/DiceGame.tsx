import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { Sparkles, Music } from 'lucide-react';

const EMOJIS = ['🚗', '🏠', '🐱', '🌳', '☀️', '⚽', '👶', '🐕', '✈️', '🚢', '🌸', '🐦', '🍎', '🌙', '🚲', '🍕', '🎸', '🐢', '🦋', '🎈', '🍦', '🎁'];

// Pastel background colors for dice to make them look like candy/toys
const DICE_COLORS = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-purple-100'];

export const DiceGame: React.FC = () => {
  const [dice, setDice] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  const liveSessionCloser = useRef<(() => void) | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // UPDATED TEXT: Friendlier and simpler
    gemini.speak("Zarları at! Çıkan resimlerle bana güzel bir masal anlat. Seni dinliyorum!", true);
    rollDice();
    return () => {
        gemini.stopAllAudio(); 
    };
  }, []);

  const rollDice = () => {
    gemini.playClickSound();
    setIsRolling(true);
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    
    // Simulate rolling time
    setTimeout(() => {
        setDice(shuffled.slice(0, 6));
        setIsRolling(false);
        // NEW PHRASE as requested
        gemini.speak("Resimleri hikayeleştir, butona bas ve anlat!", true);
    }, 800);
  };

  const toggleLiveStory = async () => {
    gemini.playClickSound();
    if (isLive) {
        // Stop
        gemini.stopAllAudio();
        setIsLive(false);
        gemini.speak("Harika anlattın!", true);
    } else {
        // Start
        setIsLive(true);
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        
        const handleAudio = (buffer: AudioBuffer) => {
             const source = ctx.createBufferSource();
             source.buffer = buffer;
             source.connect(ctx.destination);
             source.start();
        };

        const session = await gemini.startLiveSession(
            handleAudio, 
            () => setIsLive(false)
        );
        liveSessionCloser.current = session.close;
    }
  };

  return (
    <div className="flex h-full flex-col items-center p-4 bg-orange-50 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-wiggle">☁️</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-bounce-slow">🎈</div>
      <div className="absolute top-1/2 left-5 text-4xl opacity-10 rotate-12">✨</div>

      {/* Main Game Container */}
      <div className="z-10 flex flex-col items-center gap-6 w-full max-w-lg mt-4">
        
        {/* Dice Board */}
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-4 border-kid-purple/30 w-full relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-kid-purple text-white px-6 py-2 rounded-full font-bold shadow-lg border-2 border-white whitespace-nowrap">
                HİKAYE KUTUSU
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
                {dice.map((emoji, idx) => (
                    <div 
                        key={idx} 
                        className={`
                            aspect-square rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] border-2 border-white 
                            flex items-center justify-center text-5xl md:text-6xl select-none 
                            transform transition-all duration-500
                            ${DICE_COLORS[idx % DICE_COLORS.length]}
                            ${isRolling ? 'animate-spin scale-75 opacity-50' : 'scale-100 hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(0,0,0,0.15)]'}
                            ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'}
                        `}
                    >
                        {isRolling ? '🎲' : emoji}
                    </div>
                ))}
            </div>
        </div>

        {/* Visual Feedback for Live Mode */}
        <div className={`h-16 flex items-center justify-center transition-all ${isLive ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur px-8 py-3 rounded-full shadow-lg border-2 border-green-400 flex items-center gap-3 animate-pulse">
                <Music className="text-green-500 animate-bounce" />
                <span className="text-green-600 font-bold text-lg">Seni Dinliyorum...</span>
                <Sparkles className="text-yellow-400 animate-spin" />
            </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex gap-8 items-end justify-center pb-8">
            {/* ROLL BUTTON */}
            <div className="flex flex-col items-center gap-2 group">
                <button 
                    onClick={rollDice}
                    className="w-24 h-24 bg-kid-blue rounded-full shadow-[0_8px_0_#2b8a82] active:shadow-none active:translate-y-2 border-4 border-white transition-all flex items-center justify-center group-hover:scale-105"
                >
                    <span className="text-5xl drop-shadow-md">🎲</span>
                </button>
                <span className="font-bold text-gray-500 bg-white/50 px-3 py-1 rounded-full text-sm">Zar At</span>
            </div>

            {/* SPEAK BUTTON */}
            <div className="flex flex-col items-center gap-2 group">
                <button 
                    onClick={toggleLiveStory}
                    className={`
                        w-28 h-28 rounded-full shadow-[0_8px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2 border-8 border-white transition-all flex items-center justify-center group-hover:scale-105
                        ${isLive ? 'bg-red-500 shadow-[0_8px_0_#991b1b]' : 'bg-kid-green shadow-[0_8px_0_#2d7a6e]'}
                    `}
                >
                    <span className="text-6xl drop-shadow-md">{isLive ? '⏹️' : '🎙️'}</span>
                </button>
                <span className="font-bold text-gray-500 bg-white/50 px-3 py-1 rounded-full text-sm">
                    {isLive ? "Durdur" : "Anlat"}
                </span>
            </div>
        </div>
        
      </div>
    </div>
  );
};