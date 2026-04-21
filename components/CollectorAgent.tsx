
import React, { useState } from 'react';
import { Button } from './Button';
import { fetchFraudNews } from '../services/geminiService';
import { FraudNews } from '../types';
import { Search, Globe, ShieldAlert, CheckCircle2, Radar, Smartphone, ListFilter } from 'lucide-react';

interface Props {
  onNewsCollected: (news: FraudNews[]) => void;
  isGenerating?: boolean;
}

export const CollectorAgent: React.FC<Props> = ({ onNewsCollected, isGenerating: isGeneratingProp }) => {
  const [keywords, setKeywords] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FraudNews[]>([]);

  const handleSearch = async () => {
    if (!keywords.trim()) return;
    setIsSearching(true);
    const keywordArray = keywords.split(',').map(k => k.trim());
    const news = await fetchFraudNews(keywordArray);
    setResults(news);
    onNewsCollected(news);
    setIsSearching(false);
  };

  const isLoading = isSearching || isGeneratingProp;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-slide-in">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <Radar className="w-3 h-3 animate-pulse" /> 实时情报搜集引擎
        </div>
        <h2 className="text-5xl font-black bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
          全球反诈情报中心
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
          输入关键词，AI 将深度检索并过滤出 **20条** 最具代表性的最新诈骗案例，即刻为您生成对应的实战模拟案例。
        </p>
      </div>

      <div className="glass-morphism p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full"></div>
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isLoading}
              placeholder="例如：刷单、退款、冒充公检法..."
              className="w-full pl-16 pr-6 py-6 bg-black/40 border border-white/10 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all text-lg font-medium disabled:opacity-50"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            isLoading={isLoading} 
            className="md:w-64 py-6 text-lg rounded-3xl"
          >
            部署情报特工
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 font-bold px-2">
           <ListFilter className="w-3 h-3" /> 智能去重开启：系统将自动过滤相似诈骗手法以确保样本多样性
        </div>
      </div>

      {isLoading && isGeneratingProp && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-bold text-xl animate-pulse">情报已送达，正在构建演练环境...</p>
            <p className="text-slate-500 text-sm">正在将 20 条多元化新闻转化为 hyperrealistic 模拟案例</p>
          </div>
        </div>
      )}

      {results.length > 0 && !isGeneratingProp && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ListFilter className="w-4 h-4" /> 已搜集情报清单 ({results.length}/20)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.map((item, idx) => (
              <div key={idx} className="glass-morphism p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all duration-500 group">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black border border-indigo-500/20">
                    情报编号 #{idx + 1}
                  </span>
                  <span className="text-slate-500 text-xs font-bold">{item.date}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">{item.summary}</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 font-bold"
                  >
                    <Globe className="w-4 h-4" /> 原始情报来源
                  </a>
                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && keywords && (
        <div className="text-center p-20 glass-morphism rounded-[3rem] opacity-30 border-dashed border-2 border-white/10">
          <ShieldAlert className="w-16 h-16 mx-auto text-slate-500 mb-6" />
          <p className="text-xl font-medium">输入关键词并点击启动，特工将即刻出发...</p>
        </div>
      )}
    </div>
  );
};
