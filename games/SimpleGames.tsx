import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { IconButton } from '../components/Components';
import { Trophy } from 'lucide-react';

// --- COLORING GAME ---
const SVG_TEMPLATES = [
    { id: 'HOUSE', name: 'Ev', icon: '🏠', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,40 L50,10 L80,40" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><rect x="25" y="40" width="50" height="40" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><rect x="40" y="55" width="20" height="25" fill={c[2]} stroke="black" strokeWidth="2" onClick={()=>onClick(2)}/></svg>
    )},
    { id: 'CAR', name: 'Araba', icon: '🚗', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M10,60 L90,60 L80,40 L20,40 Z" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><circle cx="25" cy="60" r="8" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><circle cx="75" cy="60" r="8" fill={c[2]} stroke="black" strokeWidth="2" onClick={()=>onClick(2)}/></svg>
    )},
    { id: 'FLOWER', name: 'Çiçek', icon: '🌸', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="40" r="10" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><circle cx="50" cy="25" r="8" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><circle cx="65" cy="40" r="8" fill={c[2]} stroke="black" strokeWidth="2" onClick={()=>onClick(2)}/><circle cx="50" cy="55" r="8" fill={c[3]} stroke="black" strokeWidth="2" onClick={()=>onClick(3)}/><circle cx="35" cy="40" r="8" fill={c[4]} stroke="black" strokeWidth="2" onClick={()=>onClick(4)}/><rect x="48" y="50" width="4" height="40" fill="green" onClick={()=>onClick(5)}/></svg>
    )},
    { id: 'SUN', name: 'Güneş', icon: '☀️', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="20" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><path d="M50,20 L50,10" stroke="black" strokeWidth="4" /><path d="M50,80 L50,90" stroke="black" strokeWidth="4" /><path d="M80,50 L90,50" stroke="black" strokeWidth="4" /><path d="M20,50 L10,50" stroke="black" strokeWidth="4" /></svg>
    )},
    { id: 'TREE', name: 'Ağaç', icon: '🌳', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="40" y="60" width="20" height="40" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><circle cx="50" cy="40" r="30" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/></svg>
    )},
    { id: 'CAT', name: 'Kedi', icon: '🐱', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="30" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><path d="M30,30 L40,10 L50,30" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><path d="M70,30 L60,10 L50,30" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><circle cx="40" cy="45" r="3" fill="black"/><circle cx="60" cy="45" r="3" fill="black"/></svg>
    )},
    { id: 'FISH', name: 'Balık', icon: '🐠', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><ellipse cx="50" cy="50" rx="30" ry="20" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><path d="M80,50 L95,35 L95,65 Z" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/></svg>
    )},
    { id: 'BALL', name: 'Top', icon: '⚽', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="35" fill="white" stroke="black" strokeWidth="2"/><circle cx="50" cy="50" r="10" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/></svg>
    )},
    { id: 'ROBOT', name: 'Robot', icon: '🤖', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="30" y="20" width="40" height="40" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><rect x="35" y="60" width="30" height="30" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><circle cx="40" cy="35" r="3" fill="red"/><circle cx="60" cy="35" r="3" fill="red"/></svg>
    )},
    { id: 'ROCKET', name: 'Roket', icon: '🚀', render: (c:string[], onClick:(i:number)=>void) => (
        <svg viewBox="0 0 100 100" className="w-full h-full"><ellipse cx="50" cy="50" rx="15" ry="40" fill={c[0]} stroke="black" strokeWidth="2" onClick={()=>onClick(0)}/><path d="M35,70 L20,90 L35,80" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/><path d="M65,70 L80,90 L65,80" fill={c[1]} stroke="black" strokeWidth="2" onClick={()=>onClick(1)}/></svg>
    )}
];

export const ColoringGame: React.FC = () => {
    const [templateIdx, setTemplateIdx] = useState<number>(0);
    const [colors, setColors] = useState<string[]>(Array(10).fill('#fff'));
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const PALETTE = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080', '#A52A2A', '#00FFFF', '#FFFFFF'];

    useEffect(() => { 
        gemini.speak("İstediğini seç ve boyamaya başla", true); 
    }, []);

    const handlePartClick = (idx: number) => {
        gemini.playClickSound();
        const newColors = [...colors];
        newColors[idx] = selectedColor;
        setColors(newColors);
        gemini.speak("Süper oldu!", true);
    };

    const handleTemplateChange = (idx: number) => {
        gemini.playClickSound();
        setTemplateIdx(idx);
        setColors(Array(10).fill('#fff')); 
        gemini.speak("Yeni resim açıldı!", true);
    };

    const handleColorSelect = (c: string) => {
        gemini.playClickSound();
        setSelectedColor(c);
    };

    const CurrentTemplate = SVG_TEMPLATES[templateIdx];

    return (
        <div className="h-full flex flex-col p-2 md:p-4 gap-2 relative">
            <div className="flex-1 min-h-0 bg-white rounded-[2rem] p-4 flex items-center justify-center border-4 border-kid-red shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]">
                <div className="w-full h-full max-w-md animate-float">
                    {CurrentTemplate.render(colors, handlePartClick)}
                </div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex gap-3 overflow-x-auto p-3 bg-white/90 rounded-3xl justify-center items-center shadow-lg border-4 border-kid-yellow no-scrollbar">
                    {PALETTE.map(c => (
                        <button key={c} onClick={() => handleColorSelect(c)} style={{backgroundColor: c}} 
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white shadow-md transition-transform ${selectedColor === c ? 'scale-125 ring-4 ring-black/20 z-10' : 'hover:scale-110'}`} />
                    ))}
                </div>
                
                <div className="flex gap-3 overflow-x-auto p-3 bg-kid-blue/20 rounded-3xl items-center no-scrollbar border-4 border-white">
                     {SVG_TEMPLATES.map((t, i) => (
                         <button key={t.id} onClick={() => handleTemplateChange(i)} 
                         className={`shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-[0_4px_0_rgba(0,0,0,0.1)] border-2 ${templateIdx === i ? 'border-kid-orange scale-110 ring-2 ring-kid-orange' : 'border-transparent hover:scale-105'} transition-all`}>
                             {t.icon}
                         </button>
                     ))}
                </div>
            </div>
        </div>
    );
};

// --- PUZZLE GAME ---
const PUZZLE_IMAGES = [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400", // Cat (L1)
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400", // Car (L2)
    "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400", // Cat 2 (L3)
    "https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?w=400", // Hamster (L4)
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400", // Pineapple (L5)
    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400", // Monkey (L6)
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", // Dessert (L7)
    "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400", // Bear (L8)
    "https://images.unsplash.com/photo-1555169062-013468b47731?w=400", // Parrot (L9)
    "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400", // Cute Cat (L10)
];

export const PuzzleGame: React.FC = () => {
    const [level, setLevel] = useState(1);
    const [pieces, setPieces] = useState([3, 0, 1, 2]); 
    const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => { loadLevel(1); }, []);

    const loadLevel = (lvl: number) => {
        gemini.stopAllAudio();
        setLevel(lvl);
        // Shuffle pieces
        const shuffled = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        if (shuffled.every((v,i) => v===i)) {
            const temp = shuffled[0]; shuffled[0] = shuffled[1]; shuffled[1] = temp;
        }
        setPieces(shuffled);
        setIsComplete(false);
        setGameOver(false);
        
        if (lvl === 1) {
            gemini.speak("Parçalar karışmış! Onları yerine koyup resmi düzelt.", true);
        } else {
             gemini.speak(`Seviye ${lvl}. Başlayalım!`, true);
        }
    };

    const handleDrop = (e: React.DragEvent, targetSlot: number) => {
        e.preventDefault();
        if (draggedSlot === null || isComplete) return;

        gemini.playClickSound();
        const newPieces = [...pieces];
        const temp = newPieces[draggedSlot];
        newPieces[draggedSlot] = newPieces[targetSlot];
        newPieces[targetSlot] = temp;
        
        setPieces(newPieces);
        setDraggedSlot(null);

        if (newPieces.every((val, i) => val === i)) {
            setIsComplete(true);
            
            if (level < 10) {
                 gemini.speak("Tebrikler! Bir sonraki seviyeye geçiyoruz!", true);
                 setTimeout(() => {
                    loadLevel(level + 1);
                 }, 3500); 
            } else {
                setGameOver(true);
                gemini.speak("Harikasın! Hepsini bitirdin!", true);
            }
        }
    };

    const getBgPos = (pieceValue: number) => {
        const x = (pieceValue % 2) * 100;
        const y = Math.floor(pieceValue / 2) * 100;
        return `${x}% ${y}%`;
    };

    if (gameOver) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-bounce-slow">
                <Trophy size={140} className="text-yellow-400 drop-shadow-xl rotate-12"/>
                <h1 className="text-5xl font-black text-kid-blue mt-4 stroke-text">PUZZLE BİTTİ!</h1>
                <button onClick={() => loadLevel(1)} className="mt-8 bg-kid-green px-8 py-4 rounded-full text-white font-bold text-2xl shadow-[0_8px_0_#2d7a6e] hover:scale-105 active:shadow-none active:translate-y-2 transition-all">Başa Dön ↺</button>
            </div>
        )
    }

    return (
        <div className="h-full flex items-center justify-center flex-col gap-6">
             <div className="flex items-center gap-2 bg-yellow-100 px-6 py-2 rounded-full mb-2 shadow-inner border-2 border-yellow-200">
                <span className="font-black text-2xl text-yellow-600">Seviye {level} / 10</span>
             </div>

            <div className={`grid grid-cols-2 gap-2 p-3 bg-kid-green rounded-[2rem] shadow-[0_10px_0_#2d7a6e] w-80 h-80 transition-all ${isComplete ? 'scale-110 rotate-3 ring-8 ring-yellow-400' : 'rotate-1'}`}>
                {pieces.map((pieceVal, slotIdx) => (
                    <div 
                        key={slotIdx}
                        draggable={!isComplete}
                        onDragStart={() => setDraggedSlot(slotIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, slotIdx)}
                        className={`w-full h-full ${!isComplete ? 'cursor-grab active:cursor-grabbing hover:scale-[1.02]' : ''} border-4 border-white rounded-xl overflow-hidden relative bg-gray-200 shadow-sm transition-transform`}
                        style={{
                            backgroundImage: `url(${PUZZLE_IMAGES[level-1]})`,
                            backgroundSize: '200% 200%',
                            backgroundPosition: getBgPos(pieceVal)
                        }}
                    />
                ))}
            </div>
            
            <div className="bg-white/90 px-8 py-3 rounded-full text-center shadow-lg border-2 border-gray-100">
                <p className="text-gray-500 font-bold text-lg">{isComplete ? "Süper! 🎉" : "Parçaları sürükle! 🧩"}</p>
            </div>
        </div>
    );
};

// --- PATTERN GAME (10 LEVELS) ---
const LEVEL_CONFIGS = [
    { seq: ['🔴','🔵','🔴','🔵'], miss: 3, opts: ['🔵','🔴','🟩'], txt: "Kırmızı, Mavi... Sırada ne var?" }, 
    { seq: ['🍎','🍌','🍎','🍌'], miss: 3, opts: ['🍌','🍎','🍇'], txt: "Elma, Muz... Ne gelecek?" }, 
    { seq: ['🐱','🐶','🐱','🐶'], miss: 3, opts: ['🐶','🐱','🐮'], txt: "Kedi, Köpek... Sırada ne var?" }, 
    { seq: ['🔺','🔺','⚫','🔺','🔺','⚫'], miss: 5, opts: ['⚫','🔺','🟩'], txt: "Üçgen, Üçgen, Daire... Sırada?" }, 
    { seq: ['🚗','🚗','🚌','🚗','🚗','🚌'], miss: 2, opts: ['🚌','🚗','🚲'], txt: "Araba, Araba, Otobüs... Eksik olan ne?" }, 
    { seq: ['🟢','🟣','🟢','🟣','🟢','🟣'], miss: 4, opts: ['🟢','🟣','🟡'], txt: "Yeşil, Mor, Yeşil... Ortadaki ne?" }, 
    { seq: ['🌞','🌙','⭐','🌞','🌙','⭐'], miss: 5, opts: ['⭐','🌞','🌙'], txt: "Güneş, Ay, Yıldız... Sırada ne var?" }, 
    { seq: ['1️⃣','2️⃣','3️⃣','1️⃣','2️⃣','3️⃣'], miss: 4, opts: ['2️⃣','1️⃣','3️⃣'], txt: "Bir, İki, Üç... Ortada ne olmalı?" }, 
    { seq: ['🟥','🟥','🟦','🟦','🟥','🟥','🟦','🟦'], miss: 7, opts: ['🟦','🟥','🟩'], txt: "İki Kırmızı, İki Mavi... Sonda ne var?" }, 
    { seq: ['👦','👧','🐶','👦','👧','🐶'], miss: 1, opts: ['👧','👦','🐶'], txt: "Oğlan, Kız, Köpek... İkinci sırada kim var?" }, 
];

export const PatternGame: React.FC = () => {
    const [level, setLevel] = useState(1);
    const [sequence, setSequence] = useState<(string|null)[]>([]);
    const [options, setOptions] = useState<string[]>([]);
    const [answer, setAnswer] = useState('');
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => { loadLevel(1); }, []);

    const loadLevel = (lvl: number) => {
        gemini.stopAllAudio();
        setLevel(lvl);
        setGameOver(false);

        const config = LEVEL_CONFIGS[lvl-1];
        setAnswer(config.seq[config.miss]);
        
        if (lvl === 1) {
             gemini.speak(`Sıradaki şekil hangisi? Aşağıdan doğru olanı seç. ${config.txt}`, true);
        } else {
             gemini.speak(config.txt, true);
        }

        const display = [...config.seq];
        display[config.miss] = null;
        setSequence(display);
        setOptions(config.opts);
    };

    const checkAnswer = (opt: string) => {
        gemini.stopAllAudio();
        gemini.playClickSound();
        if (opt === answer) {
            
            if (level < 10) {
                gemini.speak("Doğru! Bir sonraki seviyeye geçiyoruz!", true);
                setTimeout(() => loadLevel(level + 1), 3500); 
            } else {
                setGameOver(true);
                gemini.speak("Şampiyonsun! Hepsini bildin!", true);
            }
        } else {
            gemini.speak("Tekrar dene!", true);
        }
    };

    if (gameOver) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-bounce-slow">
                <Trophy size={140} className="text-yellow-400 drop-shadow-xl"/>
                <h1 className="text-5xl font-black text-kid-blue mt-4">ŞAMPİYON!</h1>
                <button onClick={() => loadLevel(1)} className="mt-8 bg-kid-green px-8 py-4 rounded-full text-white font-bold text-2xl shadow-[0_8px_0_#2d7a6e] hover:scale-105 active:translate-y-2 active:shadow-none transition-all">Başa Dön ↺</button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center gap-6 p-2 md:gap-10 md:p-4">
             <div className="flex items-center gap-2 bg-blue-100 px-6 py-2 rounded-full border-2 border-blue-200">
                <span className="font-black text-2xl text-blue-600">Seviye {level} / 10</span>
             </div>

             <div className="flex gap-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_0_rgba(0,0,0,0.1)] items-center justify-center min-h-[120px] flex-wrap max-w-2xl border-4 border-gray-100">
                {sequence.map((item, i) => (
                    item === null ? (
                        <div key={i} className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-dashed border-kid-blue animate-pulse text-gray-300">?</div>
                    ) : (
                        <div key={i} className="text-5xl md:text-7xl animate-float" style={{animationDelay: `${i*0.1}s`}}>{item}</div>
                    )
                ))}
             </div>

             <div className="flex gap-4 md:gap-8 mt-4">
                {options.map((opt, i) => (
                    <button key={i} onClick={() => checkAnswer(opt)} className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.15)] text-6xl flex items-center justify-center hover:scale-110 hover:-rotate-3 transition-transform active:bg-green-100 active:shadow-none active:translate-y-2 border-4 border-white">
                        {opt}
                    </button>
                ))}
             </div>
        </div>
    );
};

// --- DIFFERENCE GAME (10 LEVELS) ---
export const DifferenceGame: React.FC = () => {
    const [level, setLevel] = useState(1);
    const [items, setItems] = useState<{id:number, char:string, isDiff:boolean}[]>([]);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => { generateLevel(1); }, []);

    const generateLevel = (lvl: number) => {
        gemini.stopAllAudio();
        setLevel(lvl);
        setGameOver(false);
        
        if(lvl === 1) {
            gemini.speak("Resimlere bak. Farklı olanı bul ve ona dokun!", true);
        }
        else gemini.speak(`Seviye ${lvl}. Farklı olan hangisi?`, true);

        // Sets
        const pairs = [
            ['🍎', '🍏'], // 1
            ['🚗', '🚙'], // 2
            ['🐱', '🐶'], // 3
            ['⭐', '🌟'], // 4
            ['⬛', '◼️'], // 5
            ['➡️', '⬅️'], // 6
            ['🕛', '🕕'], // 7
            ['🌕', '🌑'], // 8
            ['🔒', '🔓'], // 9
            ['🙂', '🙃']  // 10
        ];

        const pair = pairs[Math.min(lvl-1, pairs.length-1)];
        const main = pair[0];
        const diff = pair[1];

        const count = lvl <= 3 ? 4 : lvl <= 7 ? 6 : 9;
        
        const arr = Array(count).fill(null).map((_, i) => ({
            id: i,
            char: main,
            isDiff: false
        }));

        const diffIdx = Math.floor(Math.random() * count);
        arr[diffIdx].char = diff;
        arr[diffIdx].isDiff = true;

        setItems(arr);
    };

    const handleClick = (isDiff: boolean) => {
        gemini.stopAllAudio();
        gemini.playClickSound();
        if (isDiff) {
            
            if (level < 10) {
                gemini.speak("Doğru! Bir sonraki seviyeye geçiyoruz!", true);
                setTimeout(() => generateLevel(level + 1), 3500); 
            } else {
                setGameOver(true);
                gemini.speak("Harikasın! Hepsini bitirdin!", true);
            }
        } else {
            gemini.speak("Tekrar dene.", true);
        }
    };

    if (gameOver) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-bounce-slow">
                <Trophy size={140} className="text-yellow-400 drop-shadow-xl"/>
                <h1 className="text-5xl font-black text-kid-blue mt-4">BİTTİ!</h1>
                <button onClick={() => generateLevel(1)} className="mt-8 bg-kid-green px-8 py-4 rounded-full text-white font-bold text-2xl shadow-[0_8px_0_#2d7a6e] hover:scale-105 active:shadow-none active:translate-y-2 transition-all">Başa Dön ↺</button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
             <div className="flex items-center gap-2 bg-purple-100 px-6 py-2 rounded-full mb-8 border-2 border-purple-200">
                <span className="font-black text-2xl text-purple-600">Seviye {level} / 10</span>
             </div>

             <div className={`grid gap-4 md:gap-6 ${items.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {items.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => handleClick(item.isDiff)}
                        className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[2rem] shadow-[0_8px_0_rgba(0,0,0,0.15)] flex items-center justify-center text-6xl md:text-8xl hover:scale-110 hover:rotate-3 transition-transform active:bg-yellow-100 active:shadow-none active:translate-y-2 border-4 border-white"
                    >
                        {item.char}
                    </button>
                ))}
             </div>
        </div>
    );
};