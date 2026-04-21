
import React, { useState, useRef, useEffect } from 'react';
import { Video, Download, StopCircle, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onStartDemo: () => Promise<void>;
  isDemoRunning: boolean;
}

export const UIRecorder: React.FC<Props> = ({ targetRef, onStartDemo, isDemoRunning }) => {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'recording' | 'processing' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setStatus('processing');
  };

  const startRecording = async () => {
    try {
      setStatus('preparing');
      setError(null);
      chunksRef.current = [];

      // 1. Capture the screen/tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'browser',
          frameRate: 30
        },
        audio: false
      });

      // 2. Setup hidden video element to process the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      videoElementRef.current = video;

      // 3. Setup canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !targetRef.current) throw new Error("Could not initialize recording context");
      
      // Get target dimensions
      const rect = targetRef.current.getBoundingClientRect();
      canvas.width = rect.width * 2; // Higher resolution
      canvas.height = rect.height * 2;
      canvasRef.current = canvas;

      // 4. Start the cropping loop
      const drawFrame = () => {
        if (!targetRef.current || !video || !ctx) return;
        
        const targetRect = targetRef.current.getBoundingClientRect();
        
        // We need to find where the target is relative to the whole window 
        // because getDisplayMedia captures the whole tab.
        // Note: This works best if the user selects "This Tab"
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the video frame to canvas, cropped to targetRect
        // We assume the video frame matches the window size
        ctx.drawImage(
          video,
          targetRect.left * (video.videoWidth / window.innerWidth),
          targetRect.top * (video.videoHeight / window.innerHeight),
          targetRect.width * (video.videoWidth / window.innerWidth),
          targetRect.height * (video.videoHeight / window.innerHeight),
          0, 0, canvas.width, canvas.height
        );
        
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };
      
      drawFrame();

      // 5. Record the canvas stream
      const canvasStream = canvas.captureStream(30);
      const recorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('done');
        
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      // 6. Run the demo
      await onStartDemo();
      
      // 7. Stop recording after demo finishes
      stopRecording();

    } catch (err: any) {
      console.error(err);
      setError(err.name === 'NotAllowedError' ? "需要屏幕录制权限才能导出视频。请在弹出窗口中选择“此标签页”。" : err.message);
      setStatus('error');
    }
  };

  return (
    <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/10 space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Video className="text-indigo-400 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">视频导出工具</h3>
            <p className="text-xs text-slate-500">录制演练过程并导出为视频文件</p>
          </div>
        </div>
        {status === 'done' && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4" /> 录制完成
          </div>
        )}
      </div>

      {status === 'idle' && (
        <div className="space-y-4">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400" /> 使用说明
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>点击下方按钮后，浏览器会请求共享屏幕。</li>
              <li>请务必选择 <strong>“此标签页” (This Tab)</strong> 以获得最佳录制效果。</li>
              <li>系统将自动运行演示并实时录制手机画面。</li>
            </ul>
          </div>
          <button
            onClick={startRecording}
            className="w-full py-4 bg-white text-black rounded-2xl font-black hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> 开始录制并运行演示
          </button>
        </div>
      )}

      {status === 'recording' && (
        <div className="flex flex-col items-center py-8 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-6 h-6 bg-rose-500 rounded-sm"></div>
            </div>
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-md animate-bounce">
              REC
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold">正在录制中...</h4>
            <p className="text-sm text-slate-500">演示正在自动运行，请勿切换标签页</p>
          </div>
          <button 
            onClick={stopRecording}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <StopCircle className="w-5 h-5" /> 停止录制
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center py-12 space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">正在处理视频文件...</p>
        </div>
      )}

      {status === 'done' && videoUrl && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-[9/16] max-h-[400px] mx-auto">
            <video src={videoUrl} controls className="h-full mx-auto" />
          </div>
          <div className="flex gap-3">
            <a 
              href={videoUrl} 
              download="fraudguard-demo.webm"
              className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" /> 下载录屏视频
            </a>
            <button 
              onClick={() => setStatus('idle')}
              className="px-6 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-colors"
            >
              重新录制
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-rose-500">
            <AlertCircle className="w-6 h-6" />
            <h4 className="font-bold">录制出错</h4>
          </div>
          <p className="text-sm text-rose-300/80">{error}</p>
          <button 
            onClick={() => setStatus('idle')}
            className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
};
