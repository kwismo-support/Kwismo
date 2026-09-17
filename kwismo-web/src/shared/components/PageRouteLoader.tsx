import { useEffect, useState } from 'react';
import Icon from '@/assets/logo/icon.png';

interface PageRouteLoaderProps {
  onFinished?: () => void;
}

export function PageRouteLoader({ onFinished }: PageRouteLoaderProps) {
  const [progress, setProgress] = useState(15);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const step = Math.floor(Math.random() * 8 + 5);
        return Math.min(prev + step, 92);
      });
    }, 90);

    const checkComplete = () => {
      if (document.readyState === 'complete') {
        if (isMounted) setProgress(100);
      }
    };

    window.addEventListener('load', checkComplete);

    const finishTimer = setTimeout(() => {
      if (isMounted) setProgress(100);
    }, 320);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(finishTimer);
      window.removeEventListener('load', checkComplete);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        if (onFinished) onFinished();
      }, 180);

      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-brand-navy via-[#0A0F1D] to-brand-navy text-white font-body transition-opacity duration-300 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.12); }
          28% { transform: scale(1.02); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-brand-green/25 blur-xl animate-heartbeat" />
          <div className="bg-white dark:bg-brand-darkBg w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-4 shadow-2xl border-2 border-brand-navy dark:border-white/20 flex items-center justify-center animate-heartbeat relative z-10">
            <img src={Icon} alt="KWISMO Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="w-52 sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden relative border border-white/10 shadow-inner mt-6">
          <div
            className="h-full bg-gradient-to-r from-brand-green via-emerald-400 to-brand-orange rounded-full transition-all duration-150 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
}

export default PageRouteLoader;

