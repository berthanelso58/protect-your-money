
import React, { useState, useEffect } from 'react';
import { CollectorAgent } from './components/CollectorAgent';
import { SimulatorGame } from './components/SimulatorGame';
import { ImageStudio } from './components/ImageStudio';
import { FraudNews, GameRound, IntelligenceRecord } from './types';
import { generateGameRounds } from './services/geminiService';
import { Shield, BrainCircuit, Image as ImageIcon, Menu, X, Globe, Zap, Database } from 'lucide-react';

type Tab = 'agent' | 'simulator' | 'studio' | 'vault';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('agent');
  const [news, setNews] = useState<FraudNews[]>([]);
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [intelligenceVault, setIntelligenceVault] = useState<IntelligenceRecord[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize vault from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('fraud_intelligence_vault');
    if (saved) {
      try {
        setIntelligenceVault(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load vault", e);
      }
    }
  }, []);

  const saveToVault = (records: IntelligenceRecord[]) => {
    setIntelligenceVault(records);
    localStorage.setItem('fraud_intelligence_vault', JSON.stringify(records));
  };

  const handleNewsCollected = async (collectedNews: FraudNews[]) => {
    setNews(collectedNews);
    setIsGenerating(true);
    
    try {
      const generatedRounds = await generateGameRounds(collectedNews);
      setRounds(generatedRounds);

      // Create records by matching rounds back to news items
      const newRecords: IntelligenceRecord[] = collectedNews.map(n => ({
        id: Math.random().toString(36).substr(2, 9),
        news: n,
        mockups: generatedRounds.filter(r => r.newsContext === n.title),
        timestamp: Date.now()
      }));

      saveToVault([...newRecords, ...intelligenceVault]);
      
      setTimeout(() => {
        setActiveTab('simulator');
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing news:", error);
      setIsGenerating(false);
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMenuOpen(false); }}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 font-black tracking-wide text-sm ${
        activeTab === id 
        ? 'bg-white text-black shadow-2xl scale-105' 
        : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Premium Navigation Header */}
      <header className="glass-morphism sticky top-0 z-[100] border-b border-white/5 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('agent')}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
              <Shield className="text-black w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                防诈<span className="text-indigo-500">卫士</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">AI 情报系统已就绪</span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-3 bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
            <NavItem id="agent" icon={BrainCircuit} label="情报特工" />
            <NavItem id="simulator" icon={Zap} label="实战演练" />
            <NavItem id="vault" icon={Database} label="情报库" />
            <NavItem id="studio" icon={ImageIcon} label="素材工坊" />
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">系统状态</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" /> 已联网
              </span>
            </div>
            <button className="lg:hidden p-3 bg-white/5 rounded-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl p-8 flex flex-col gap-6 pt-32 animate-slide-in">
          <NavItem id="agent" icon={BrainCircuit} label="情报特工" />
          <NavItem id="simulator" icon={Zap} label="实战演练" />
          <NavItem id="vault" icon={Database} label="情报库" />
          <NavItem id="studio" icon={ImageIcon} label="素材工坊" />
        </div>
      )}

      {/* Main Experience Area */}
      <main className="flex-1 py-16 px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 blur-[150px] -z-10 rounded-full"></div>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'agent' && (
            <CollectorAgent onNewsCollected={handleNewsCollected} isGenerating={isGenerating} />
          )}
          {activeTab === 'simulator' && (
            <div className="space-y-12">
              {rounds.length === 0 ? (
                <div className="text-center py-32 glass-morphism rounded-[4rem] border-2 border-dashed border-white/10 animate-slide-in">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                    <BrainCircuit className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">尚未搜集实战数据</h3>
                  <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg">请先部署情报特工搜寻最新诈骗案例，我们将为您生成演练关卡。</p>
                  <button 
                    onClick={() => setActiveTab('agent')}
                    className="px-10 py-5 bg-white text-black rounded-3xl font-black hover:scale-105 transition-transform shadow-xl"
                  >
                    立即搜集情报
                  </button>
                </div>
              ) : (
                <SimulatorGame news={news} rounds={rounds} onRestart={() => setActiveTab('agent')} />
              )}
            </div>
          )}
          {activeTab === 'vault' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-slide-in">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black tracking-tighter">情报保管库</h2>
                <p className="text-slate-400 text-lg">在此查看所有搜集的原始情报及其生成的 AI 模拟样本。</p>
              </div>
              {intelligenceVault.length === 0 ? (
                <div className="text-center py-20 opacity-30 italic">保管库目前为空...</div>
              ) : (
                <div className="space-y-8">
                  {intelligenceVault.map((record) => (
                    <div key={record.id} className="glass-morphism rounded-[3rem] p-8 border border-white/5 space-y-8">
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* News Part */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase">原始情报</span>
                            <span className="text-[10px] text-slate-500">{new Date(record.timestamp).toLocaleString()}</span>
                          </div>
                          <h3 className="text-2xl font-bold">{record.news.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{record.news.summary}</p>
                          <a href={record.news.sourceUrl} target="_blank" className="inline-block text-xs text-indigo-400 hover:underline">查看来源 →</a>
                        </div>
                        {/* Mockups Part */}
                        <div className="flex-1 space-y-4">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase">AI 模拟样本</span>
                          <div className="space-y-4">
                            {record.mockups.map(m => (
                              <div key={m.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{m.type === 'sms' ? '短信样本' : '通话脚本'}</div>
                                <p className="text-sm italic text-slate-300">"{m.content}"</p>
                                <div className={`mt-3 text-[10px] font-bold ${m.isFraud ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {m.isFraud ? '诈骗手段' : '正常通讯'}
                                </div>
                              </div>
                            ))}
                            {record.mockups.length === 0 && <p className="text-xs text-slate-600 italic">正在生成中或未匹配到样本...</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'studio' && (
            <ImageStudio />
          )}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="py-12 border-t border-white/5 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-600 text-xs font-bold tracking-widest uppercase">
            © 2025 防诈卫士 AI • 管理员/用户参考手册
          </p>
          <div className="flex gap-8 text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
            <span className="hover:text-white cursor-help">隐私协议</span>
            <span className="hover:text-white cursor-help">全球网络</span>
            <span className="hover:text-white cursor-help">情报版本: V2.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
