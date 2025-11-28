import React, { useState, useEffect } from 'react';
import { GameType, GameConfig } from './types';
import { GameCard, IconButton } from './components/Components';
import { ColoringGame, PatternGame, PuzzleGame, DifferenceGame } from './games/SimpleGames';
import { DrawingGame } from './games/DrawingGame';
import { DiceGame } from './games/DiceGame';
import { gemini } from './services/geminiService';

const GAMES: GameConfig[] = [
  { id: GameType.COLORING, color: 'bg-kid-red', icon: 'Palette', description: 'Boyama zamanı' },
  { id: GameType.DRAWING, color: 'bg-kid-orange', icon: 'Pencil', description: 'Resim çizme' },
  { id: GameType.PATTERN, color: 'bg-kid-blue', icon: 'Shapes', description: 'Şekil örüntüsü' },
  { id: GameType.PUZZLE, color: 'bg-kid-green', icon: 'Puzzle', description: 'Puzzle' },
  { id: GameType.DICE_STORY, color: 'bg-kid-purple', icon: 'Dices', description: 'Hikaye anlat' },
  { id: GameType.DIFFERENCE, color: 'bg-kid-yellow', icon: 'Search', description: 'Farklı olanı bul' },
];

const COMMON_PHRASES = [
    "Merhaba! Oynamak istediğin oyunu seç!",
    "Başka bir oyun seçelim!",
    "Süper oldu!",
    "Tebrikler! Bir sonraki seviyeye geçiyoruz!",
    "Harikasın! Hepsini bitirdin!",
    "Doğru! Bir sonraki seviyeye geçiyoruz!",
    "Tekrar dene!",
    "Harikasın! Doğru!",
    "Aferin!",
    "Bravo!",
    "Şampiyonsun! Hepsini bildin!",
    "Resimleri hikayeleştir, butona bas ve anlat!",
    "Harika anlattın!", 
    "İstediğini seç ve boyamaya başla",
    "İstediğin resmi çizebilirsin. Alttaki kalemleri kullan!",
    "Parçalar karışmış! Onları yerine koyup resmi düzelt.",
    "Zarları at! Çıkan resimlerle bana güzel bir masal anlat. Seni dinliyorum!",
    "Resimlere bak. Farklı olanı bul ve ona dokun!",
    "Sıradaki şekil hangisi? Aşağıdan doğru olanı seç. Kırmızı, Mavi... Sırada ne var?",
    "Elma, Muz... Ne gelecek?",
    "Kedi, Köpek... Sırada ne var?"
];

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType | GameType.MENU>(GameType.MENU);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
      gemini.preload(COMMON_PHRASES);
  }, []);

  const handleStart = () => {
    gemini.playClickSound();
    setShowSplash(false);
    gemini.speak("Merhaba! Oynamak istediğin oyunu seç!", true);
  };

  const handleGameSelect = (gameId: GameType) => {
    gemini.playClickSound();
    setActiveGame(gameId);
  };

  const handleBack = () => {
    gemini.playClickSound();
    setActiveGame(GameType.MENU);
    gemini.speak("Başka bir oyun seçelim!", true);
  };

  if (showSplash) {
      return (
          <div className="h-screen w-screen bg-sky-100 flex flex-col items-center justify-center gap-8 p-4 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-10 left-10 text-9xl opacity-20 animate-float">☁️</div>
             <div className="absolute bottom-10 right-10 text-9xl opacity-20 animate-bounce-slow">🎨</div>
             
             <div className="text-9xl animate-bounce-slow z-10 drop-shadow-2xl">🧸</div>
             <h1 className="text-6xl font-black text-kid-blue text-center drop-shadow-white stroke-text tracking-wider">
                BİLSEM<br/><span className="text-kid-orange">KIDS</span>
             </h1>
             
             <button 
                onClick={handleStart}
                className="mt-8 bg-kid-green text-white text-4xl px-16 py-8 rounded-[3rem] shadow-[0_10px_0_#2b8a82] font-black hover:scale-105 active:scale-95 active:shadow-none active:translate-y-2 transition-all border-4 border-white"
             >
                OYNA ▶️
             </button>
          </div>
      )
  }

  const renderGame = () => {
    switch (activeGame) {
      case GameType.COLORING: return <ColoringGame />;
      case GameType.DRAWING: return <DrawingGame />;
      case GameType.PATTERN: return <PatternGame />;
      case GameType.PUZZLE: return <PuzzleGame />;
      case GameType.DICE_STORY: return <DiceGame />;
      case GameType.DIFFERENCE: return <DifferenceGame />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* Background Floating Elements (visible across app) */}
      <div className="absolute top-20 left-[10%] text-6xl opacity-20 animate-float pointer-events-none -z-10">☁️</div>
      <div className="absolute bottom-20 right-[15%] text-6xl opacity-20 animate-wiggle pointer-events-none -z-10">⭐</div>
      <div className="absolute top-1/2 left-[5%] text-4xl opacity-20 pointer-events-none -z-10 rotate-12">✏️</div>

      {activeGame === GameType.MENU ? (
        // --- MENU VIEW ---
        <div className="flex-1 flex flex-col items-center">
            {/* Wavy Header for Menu */}
            <div className="w-full bg-white pt-8 pb-12 rounded-b-[50%] shadow-xl mb-6 z-10 border-b-8 border-kid-blue/20">
                <h1 className="text-4xl md:text-5xl font-black text-center text-kid-blue drop-shadow-sm">
                    OYUN SEÇ!
                </h1>
            </div>

            <div className="flex-1 w-full overflow-y-auto px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto pb-10">
                    {GAMES.map((game) => (
                        <GameCard 
                            key={game.id} 
                            icon={game.icon as any} 
                            color={game.color} 
                            onClick={() => handleGameSelect(game.id as GameType)} 
                        />
                    ))}
                </div>
            </div>
        </div>
      ) : (
        // --- GAME VIEW ---
        <div className="flex-1 flex flex-col h-full relative z-0">
            {/* Playful Header for Games */}
            <div className="h-24 pt-2 pb-6 px-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="pointer-events-auto filter drop-shadow-lg">
                    <IconButton icon="ArrowLeft" onClick={handleBack} color="bg-white" size="lg" />
                </div>
                
                {/* Visual Title based on active game - Optional or just Logo */}
                <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-3xl shadow-lg border-b-4 border-gray-200 transform -rotate-1">
                    <span className="text-2xl font-black text-kid-orange tracking-widest">BİLSEM</span>
                </div>
                
                <div className="w-16"></div> {/* Spacer */}
            </div>
            
            {/* Game Content Container - with extra padding/radius if needed */}
            <div className="flex-1 overflow-hidden relative px-2 pb-2 md:px-4 md:pb-4">
                <div className="w-full h-full bg-white/60 backdrop-blur-sm rounded-[3rem] shadow-2xl border-4 border-white/50 overflow-hidden relative">
                    {renderGame()}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;