
import React, { useState, useEffect, useRef } from 'react';
import { PhoneFrame } from './PhoneFrame';
import { Button } from './Button';
import { UIRecorder } from './UIRecorder';
import { GameRound, FraudNews } from '../types';
import { ShieldCheck, ShieldAlert, Trophy, RotateCcw, User, Info, AlertTriangle, TrendingDown, HelpCircle, ChevronLeft, Video, Phone, Play, Sparkles, Camera, Loader2 } from 'lucide-react';

interface Props {
  news: FraudNews[];
  rounds: GameRound[];
  onRestart: () => void;
}

export const SimulatorGame: React.FC<Props> = ({ news, rounds, onRestart }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalStolen, setTotalStolen] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; loss?: number } | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const playErrorSound = () => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
      osc2.connect(gain);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    if (currentIndex < rounds.length && !feedback) {
      setIsTyping(true);
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        setIsAnimatingIn(true);
        playNotificationSound();
        setTimeout(() => setIsAnimatingIn(false), 500);
      }, 1500);
      return () => clearTimeout(typingTimer);
    }
  }, [currentIndex, rounds.length, feedback]);

  const handleGuess = (guess: boolean) => {
    if (isAnimatingOut || isAnimatingIn) return;
    const current = rounds[currentIndex];
    const correct = guess === current.isFraud;
    
    if (correct) {
      setScore(s => s + 1);
    } else {
      playErrorSound();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      if (current.isFraud && !guess) {
        setTotalStolen(prev => prev + (current.estimatedLoss || 0));
      }
    }

    setFeedback({ 
      correct, 
      message: current.explanation, 
      loss: (!correct && current.isFraud) ? current.estimatedLoss : undefined 
    });
  };

  const nextRound = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex(i => i + 1);
      setIsAnimatingOut(false);
    }, 800);
  };

  const runAutoDemo = async () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
    setScore(0);
    setTotalStolen(0);
    setCurrentIndex(0);
    setFeedback(null);

    for (let i = 0; i < rounds.length; i++) {
      // Wait for typing and message in
      await new Promise(r => setTimeout(r, 3000));
      
      // Randomly pick an answer
      const guess = Math.random() > 0.5;
      handleGuess(guess);
      
      // Wait for feedback alert to show
      await new Promise(r => setTimeout(r, 2500));
      
      // Click "Next" (simulate nextRound)
      nextRound();
      
      // Small buffer between rounds
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setIsAutoPlaying(false);
  };

  const formatMessageContent = (text: string) => {
    const urlPattern = /((https?:\/\/|www\.)[^\s]+|[\w-]+\.[a-z]{2,3}\/[^\s]+)/gi;
    const parts = text.split(urlPattern);
    return parts.map((part, i) => part && part.match(urlPattern) ? <span key={part + i} className="message-link font-bold">{part}</span> : part);
  };

  const getFeedbackTitle = (correct: boolean, isFraud: boolean) => {
    if (isFraud) {
      // Scenario 1 & 2
      return correct ? "成功识破！" : "不幸中招！";
    } else {
      // Scenario 3 & 4: Real message
      return "可能为真，需核实";
    }
  };

  if (currentIndex >= rounds.length && rounds.length > 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-slide-in">
        <div className="relative p-1">
            <div className={`absolute inset-0 blur-xl opacity-20 ${totalStolen > 0 ? 'bg-rose-600' : 'bg-emerald-600'}`}></div>
            <div className="relative glass-morphism p-12 rounded-[3rem] border-2 border-white/10">
              <Trophy className={`w-20 h-20 mx-auto mb-6 ${totalStolen > 0 ? 'text-rose-500' : 'text-yellow-500'}`} />
              <h2 className="text-4xl font-black mb-2">演练总结</h2>
              <div className="flex flex-col gap-4 my-8">
                <div>
                  <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-1">识破率</div>
                  <div className="text-6xl font-black text-indigo-400">{Math.round((score/rounds.length)*100)}%</div>
                </div>
                {totalStolen > 0 && (
                  <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20">
                    <div className="text-rose-400 text-xs font-black uppercase tracking-[0.2em] mb-1">累计财产损失</div>
                    <div className="text-4xl font-black text-rose-500">¥{totalStolen.toLocaleString()}</div>
                    <p className="text-rose-300/60 text-xs mt-2 italic">注：以上为模拟金额，请在现实中保持警惕</p>
                  </div>
                )}
              </div>
              <Button onClick={onRestart} className="w-full py-6 text-xl">
                <RotateCcw className="w-6 h-6" /> 重新开始训练
              </Button>
            </div>
        </div>
      </div>
    );
  }

  const currentRound = rounds[currentIndex];

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-center gap-12 p-4 transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
      {/* Sidebar Info */}
      <div className="flex-1 max-w-lg space-y-6 hidden lg:block">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
           模拟演练进行中 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white">
          反诈<span className="text-indigo-500">模拟室</span>
        </h2>
        
        <div className="glass-morphism p-8 rounded-[2.5rem] space-y-6 border-white/5">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                   <ShieldAlert className="text-indigo-400" />
                </div>
                <div>
                   <div className="text-slate-500 text-[10px] font-black uppercase">本场目标</div>
                   <div className="text-lg font-bold">识破伪装，保卫财产</div>
                </div>
              </div>
              <button 
                onClick={runAutoDemo}
                disabled={isAutoPlaying}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isAutoPlaying ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white text-black hover:scale-105'}`}
              >
                {isAutoPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isAutoPlaying ? '演示运行中...' : '自动演示 (Marketing)'}
              </button>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="text-slate-500 text-[10px] font-black uppercase mb-1">正确数量</div>
                <div className="text-2xl font-black">{score}</div>
             </div>
             <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                <div className="text-rose-400/50 text-[10px] font-black uppercase mb-1">虚拟损失</div>
                <div className="text-2xl font-black text-rose-500">¥{totalStolen}</div>
             </div>
           </div>
        </div>

        {currentIndex >= rounds.length - 1 && !isAutoPlaying && (
          <div className="space-y-4">
             <UIRecorder 
               targetRef={phoneRef} 
               onStartDemo={runAutoDemo} 
               isDemoRunning={isAutoPlaying} 
             />
          </div>
        )}
      </div>

      {/* Main Simulation Phone */}
      <div className="relative" ref={phoneRef}>
        <PhoneFrame>
          <div className={`flex flex-col h-full transition-colors duration-500 ${feedback && !feedback.correct ? 'bg-rose-50' : 'bg-[#f2f2f7]'}`}>
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl sticky top-0 px-4 pt-10 pb-2 flex flex-col items-center border-b border-black/5 z-10">
              <div className="w-full flex items-center justify-between mb-1 px-2">
                <div className="flex items-center gap-1 text-[#007aff] cursor-pointer">
                  <ChevronLeft className="w-6 h-6" />
                  <span className="text-[17px]">99+</span>
                </div>
                <div className="flex items-center gap-4 text-[#007aff]">
                  <Video className="w-5 h-5" />
                  <Phone className="w-4 h-4" />
                </div>
              </div>
              <div className="w-11 h-11 bg-[#8e8e93] rounded-full flex items-center justify-center mb-1 shadow-sm">
                <User className="text-white w-7 h-7" />
              </div>
              <div className="flex items-center gap-1">
                <div className="text-[12px] font-semibold text-gray-900 tracking-tight">
                  {currentRound?.sender || '未知号码'}
                </div>
                <ChevronLeft className="w-3 h-3 text-gray-400 rotate-180" />
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-2 flex flex-col gap-4 overflow-x-hidden bg-white">
              <div className="text-center mt-2">
                <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-tight">
                  iMessage
                </span>
                <div className="text-[11px] font-semibold text-[#8e8e93] mt-0.5">
                  今天 {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className={`flex flex-col gap-1 transition-all duration-700 ${isAnimatingOut ? 'animate-car-zoom' : ''} ${isAnimatingIn ? 'animate-message-in' : ''}`}>
                {isTyping ? (
                  <div className="imessage-bubble imessage-received flex gap-1 items-center py-3 px-4 w-16">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <div className="imessage-bubble imessage-received text-[17px] leading-[1.3] tracking-tight">
                    {currentRound && formatMessageContent(currentRound.content)}
                  </div>
                )}
              </div>

              {feedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                  <div className="bg-white/90 backdrop-blur-2xl rounded-[1.2rem] w-full max-w-[300px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 flex flex-col items-center text-center">
                      <div className="mb-4">
                        {feedback.correct ? (
                          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                            <ShieldCheck className="text-emerald-600 w-8 h-8" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                            <ShieldAlert className="text-rose-600 w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-[22px] font-bold text-black mb-2 leading-tight">
                        {getFeedbackTitle(feedback.correct, currentRound.isFraud)}
                      </h3>
                      <p className="text-[18px] text-black leading-snug font-medium">
                        {feedback.message}
                      </p>
                      {!feedback.correct && feedback.loss && (
                        <div className="mt-3 text-[16px] font-bold text-rose-600">
                          虚拟损失: ¥{feedback.loss.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={nextRound}
                      className="w-full py-4 border-t border-black/10 text-[20px] font-bold text-[#007aff] active:bg-black/5 transition-colors"
                    >
                      好
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Interaction - Refined iOS style */}
            {!feedback && (
              <div className="px-6 pb-12 pt-4 bg-white flex flex-col gap-3">
                <button 
                  onClick={() => handleGuess(true)}
                  className="w-full py-4 bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white rounded-2xl font-bold text-[17px] transition-all active:scale-[0.98] shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-5 h-5" />
                  这是诈骗信息
                </button>
                <button 
                  onClick={() => handleGuess(false)}
                  className="w-full py-4 bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#007aff] rounded-2xl font-bold text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  这是真实的
                </button>
                <p className="text-center text-[11px] text-gray-400 font-medium px-4">
                  识破诈骗信息，保护您的财产安全。
                </p>
              </div>
            )}
          </div>
        </PhoneFrame>
        {/* Shadow floor */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/40 blur-3xl rounded-full -z-10"></div>
      </div>
    </div>
  );
};
