import React, { useRef, useState, useEffect } from 'react';
import { IconButton } from '../components/Components';
import { gemini } from '../services/geminiService';
import { Image as ImageIcon, Save, X, PlusCircle } from 'lucide-react';

const COLORS = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE', '#000000', '#FFFFFF'];

export const DrawingGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState<string>('');
  const [showMagicInput, setShowMagicInput] = useState(false);
  
  const [savedDrawings, setSavedDrawings] = useState<string[]>([]);
  const [showGallerySidebar, setShowGallerySidebar] = useState(true);

  useEffect(() => {
    gemini.speak("İstediğin resmi çizebilirsin. Alttaki kalemleri kullan!", true);
    const saved = localStorage.getItem('bilsem_drawings');
    if (saved) {
        setSavedDrawings(JSON.parse(saved));
    }
    initCanvas();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
        const mx = ('touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX) - rect.left;
        const my = ('touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY) - rect.top;
        ctx.lineTo(mx, my);
        ctx.stroke();
    };

    const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('touchend', upHandler);
  };

  const saveDrawing = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL();
      
      const newSaved = [dataUrl, ...savedDrawings].slice(0, 10); // Keep last 10
      setSavedDrawings(newSaved);
      localStorage.setItem('bilsem_drawings', JSON.stringify(newSaved));
      gemini.speak("Resmini kaydettim!", true);
  };

  const loadDrawing = (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
          ctx.drawImage(img, 0, 0);
          gemini.speak("Resmini geri getirdim!", true);
      };
      img.src = dataUrl;
  };

  const newDrawing = () => {
      initCanvas();
      gemini.speak("Yeni kağıt açtım!", true);
  };

  const handleMagicEdit = async () => {
    if (!magicPrompt) return;
    setIsProcessing(true);
    gemini.speak("Sihir yapıyorum, bekle...", true);
    
    const canvas = canvasRef.current;
    if (canvas) {
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        const newImageBase64 = await gemini.editImage(base64, magicPrompt);
        
        if (newImageBase64) {
            const img = new Image();
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                setIsProcessing(false);
                setShowMagicInput(false);
                gemini.speak("Ta daa! Nasıl olmuş?", true);
            };
            img.src = newImageBase64;
        } else {
            setIsProcessing(false);
            gemini.speak("Üzgünüm, yapamadım.", true);
        }
    }
  };

  return (
    <div className="flex h-full p-2 gap-2 relative">
      
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-2">
          {/* Top Bar for New/Save */}
          <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
             <button onClick={newDrawing} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-200">
                 <PlusCircle size={24}/> YENİ
             </button>
             <button onClick={saveDrawing} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-200">
                 <Save size={24}/> KAYDET
             </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-inner relative overflow-hidden border-4 border-kid-blue">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                    <div className="animate-spin text-6xl">🪄</div>
                </div>
            )}
            <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair"
            onMouseDown={startDraw}
            onTouchStart={startDraw}
            />
          </div>

          {/* Tools */}
          <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl">
            <div className="flex gap-2 overflow-x-auto pb-1 px-1 no-scrollbar max-w-[60%]">
            {COLORS.map((c) => (
                <button
                key={c}
                onClick={() => { setColor(c); setLineWidth(5); }}
                className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 transition-transform ${color === c ? 'scale-125 ring-2 ring-black' : ''}`}
                style={{ backgroundColor: c }}
                />
            ))}
            </div>
            
            <div className="flex gap-1">
                <IconButton icon="Wand2" onClick={() => setShowMagicInput(true)} color="bg-purple-100" size="sm"/>
                <IconButton icon="Eraser" onClick={() => { setColor('#FFFFFF'); setLineWidth(20); }} active={color === '#FFFFFF'} size="sm"/>
            </div>
          </div>
      </div>

      {/* Sidebar Gallery */}
      <div className={`w-24 bg-gray-50 rounded-2xl p-2 flex flex-col gap-2 overflow-y-auto border-2 border-gray-200 ${showGallerySidebar ? '' : 'hidden'}`}>
          <div className="text-center font-bold text-gray-400 text-xs mb-2">GALERİ</div>
          {savedDrawings.map((img, i) => (
               <button key={i} onClick={() => loadDrawing(img)} className="bg-white p-1 rounded-lg border-2 border-gray-200 hover:border-kid-orange shadow-sm aspect-square overflow-hidden">
                  <img src={img} className="w-full h-full object-contain" />
               </button>
          ))}
          {savedDrawings.length === 0 && <div className="text-center text-xs text-gray-300 mt-10">Boş</div>}
      </div>

      {/* Magic Input Prompt Overlay */}
      {showMagicInput && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white p-4 rounded-2xl shadow-2xl border-4 border-purple-400 z-20 w-80">
            <p className="text-center mb-2 font-bold text-gray-600">Ne ekleyelim?</p>
            <div className="flex gap-2 mb-2 flex-wrap justify-center">
                {["Güneş ekle", "Kedi ekle", "Rengi değiştir", "Yağmur yağdır"].map(p => (
                    <button key={p} onClick={() => setMagicPrompt(p)} className={`px-3 py-1 rounded-full text-sm ${magicPrompt === p ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>
                        {p === "Güneş ekle" ? "☀️" : p === "Kedi ekle" ? "🐱" : p === "Yağmur yağdır" ? "🌧️" : "🎨"}
                    </button>
                ))}
            </div>
            <button onClick={handleMagicEdit} className="w-full bg-purple-500 text-white py-2 rounded-xl font-bold">
                Büyü Yap! ✨
            </button>
            <button onClick={() => setShowMagicInput(false)} className="w-full mt-2 text-gray-400 text-sm">İptal</button>
        </div>
      )}
    </div>
  );
};