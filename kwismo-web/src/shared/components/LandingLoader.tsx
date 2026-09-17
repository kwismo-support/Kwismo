import { useEffect, useState } from 'react';
import ColorLogo from '@/assets/logo/Color_Logo.png';

interface LandingLoaderProps {
  onFinished?: () => void;
}

export default function LandingLoader({ onFinished }: LandingLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const updateProgress = (target: number) => {
      if (!isMounted) return;
      setProgress((prev) => Math.max(prev, target));
    };

    const handleCheckLoading = () => {
      const images = Array.from(document.images);
      if (images.length === 0) {
        updateProgress(85);
        return;
      }

      const loadedImages = images.filter((img) => img.complete);
      const ratio = loadedImages.length / images.length;
      const calculatedProgress = Math.round(25 + ratio * 65);
      updateProgress(calculatedProgress);
    };

    const timerStart = setTimeout(() => updateProgress(20), 80);

    const images = Array.from(document.images);
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', handleCheckLoading);
        img.addEventListener('error', handleCheckLoading);
      }
    });

    const handleWindowLoad = () => {
      updateProgress(100);
    };

    if (document.readyState === 'complete') {
      updateProgress(100);
    } else {
      window.addEventListener('load', handleWindowLoad);
      handleCheckLoading();
    }

    const interval = setInterval(() => {
      if (document.readyState === 'complete') {
        updateProgress(100);
        clearInterval(interval);
      } else {
        setProgress((prev) => {
          if (prev < 90) return prev + Math.floor(Math.random() * 4 + 2);
          return prev;
        });
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timerStart);
      clearInterval(interval);
      window.removeEventListener('load', handleWindowLoad);
      images.forEach((img) => {
        img.removeEventListener('load', handleCheckLoading);
        img.removeEventListener('error', handleCheckLoading);
      });
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer1 = setTimeout(() => setFadeOut(true), 250);
      const timer2 = setTimeout(() => {
        setHidden(true);
        if (onFinished) onFinished();
      }, 750);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [progress, onFinished]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-brand-navy via-[#0A0F1D] to-brand-navy text-white transition-opacity duration-500 font-body ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-green/15 rounded-full blur-3xl animate-heartbeat" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-brand-green/20 blur-xl animate-heartbeat" />
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-4 sm:p-5 shadow-2xl border border-white/20 flex items-center justify-center animate-heartbeat relative z-10">
            <img
              src={ColorLogo}
              alt="KWISMO Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-brand-green font-semibold text-xs sm:text-sm tracking-wider uppercase mt-1">
          <span>Chargement en cours</span>
          <span className="font-bold font-mono text-white/90">({progress}%)</span>
        </div>

        <div className="w-56 sm:w-72 h-2 bg-white/10 rounded-full overflow-hidden relative border border-white/10 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-brand-green via-emerald-400 to-brand-orange rounded-full transition-all duration-150 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

