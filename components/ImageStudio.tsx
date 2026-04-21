
import React, { useState } from 'react';
import { Button } from './Button';
import { generateHighQualityImage, editImage } from '../services/geminiService';
import { ImageIcon, Wand2, Download, Layers, Monitor, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

export const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;

    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsKey(true);
      return;
    }

    setIsGenerating(true);
    try {
      const url = await generateHighQualityImage(prompt, size);
      setGeneratedImageUrl(url);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImageUrl || !editPrompt) return;
    setIsEditing(true);
    try {
      const url = await editImage(generatedImageUrl, editPrompt);
      setGeneratedImageUrl(url);
      setEditPrompt('');
    } finally {
      setIsEditing(false);
    }
  };

  const openKeyDialog = async () => {
    await (window as any).aistudio?.openSelectKey();
    setNeedsKey(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-in p-6">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Controls Sidebar */}
        <div className="w-full lg:w-1/3 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">AI 反诈素材工坊</h2>
            <p className="text-slate-400">基于 Gemini 3 Pro，生成高精度宣传素材与反诈海报。</p>
          </div>

          <div className="glass-morphism p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                <Sparkles className="w-3 h-3" /> 生成提示词
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：赛博朋克风格的反诈宣传海报，充满科技感，带有‘全民反诈’字样..."
                className="w-full h-32 p-5 bg-black/40 border border-white/10 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                <Monitor className="w-3 h-3" /> 输出分辨率
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["1K", "2K", "4K"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3 rounded-2xl text-xs font-black border transition-all ${
                      size === s 
                      ? 'bg-white text-black border-white shadow-xl scale-105' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {needsKey && (
              <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs text-amber-200 leading-relaxed">生成 2K/4K 超清图像需要您在控制台选择个人付费 API Key。</p>
                  <button 
                    onClick={openKeyDialog}
                    className="text-xs font-black text-amber-500 underline"
                  >
                    立即选择 Key
                  </button>
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerate} 
              isLoading={isGenerating} 
              className="w-full py-5 text-lg rounded-3xl shadow-indigo-500/20"
            >
              生成视觉素材
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 space-y-8">
          <div className="aspect-square w-full max-w-[600px] mx-auto relative glass-morphism rounded-[3rem] overflow-hidden group border-4 border-white/5 shadow-2xl">
            {generatedImageUrl ? (
              <>
                <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <a 
                    href={generatedImageUrl} 
                    download="anti-fraud-asset.png"
                    className="p-5 bg-white text-black hover:bg-slate-200 rounded-full transition-all transform hover:scale-110 shadow-2xl"
                  >
                    <Download className="w-8 h-8" />
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-16 text-center">
                <ImageIcon className="w-32 h-32 mb-8 opacity-10" />
                <h3 className="text-2xl font-black text-slate-300 mb-3">灵感画布</h3>
                <p className="text-sm max-w-xs text-slate-500 font-medium">输入你的构想，AI 将为你绘制高清宣传素材。</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6"></div>
                <span className="text-sm font-black tracking-[0.3em] text-white">正在合成艺术品...</span>
              </div>
            )}
          </div>

          {generatedImageUrl && (
            <div className="glass-morphism p-8 rounded-[3rem] animate-slide-in border-white/10 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                    <Layers className="w-3 h-3" /> 智能局部重绘 (Gemini 2.5)
                  </label>
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="例如：‘加入更多霓虹灯光效’、‘把色调调冷一点’..."
                    className="w-full px-8 py-5 bg-black/40 border border-white/10 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:outline-none font-medium"
                  />
                </div>
                <Button 
                  onClick={handleEdit} 
                  isLoading={isEditing} 
                  className="md:w-56 self-end py-5 rounded-3xl"
                >
                  应用修改
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
