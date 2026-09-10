import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, ChevronLeft, ArrowRight, ShieldCheck, Phone, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WelcomeApp() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'phone' | 'otp' | 'success'>('splash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (currentScreen === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [currentScreen, timer]);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-2 sm:p-6 font-sans">
      {/* Outer Phone Mockup Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-slate-800 flex flex-col justify-between select-none">

        {/* Dynamic Background Mesh Gradients matching the UI image */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#115e54] via-slate-100 to-[#2dd4bf]">
          {/* Top-left dark green orb */}
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#0d5c52] opacity-90 blur-3xl" />
          {/* Top-right slate purple orb */}
          <div className="absolute -top-12 -right-16 w-80 h-80 rounded-full bg-[#334155] opacity-80 blur-3xl" />
          {/* Middle white bright light wash */}
          <div className="absolute top-1/3 left-0 right-0 h-96 bg-white/80 blur-2xl" />
          {/* Bottom emerald green glow orb */}
          <div className="absolute -bottom-16 -right-10 w-96 h-96 rounded-full bg-[#10b981] opacity-90 blur-3xl" />
          {/* Bottom mint left orb */}
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-[#34d399] opacity-80 blur-3xl" />
        </div>

        {/* Status Bar */}
        <div className="relative z-20 pt-3 px-7 flex justify-between items-center text-white font-medium text-xs">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3.5 h-3.5 fill-white stroke-none" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-white stroke-none" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 text-center">

          {/* SCREEN 1: Exact Image Splash Welcome */}
          {currentScreen === 'splash' && (
            <div className="flex flex-col items-center justify-center w-full animate-fade-in">
              <h1 
                onClick={() => setCurrentScreen('phone')}
                className="text-[44px] font-bold text-[#f58220] tracking-normal font-sans cursor-pointer hover:scale-105 transition-transform drop-shadow-sm select-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Welcome
              </h1>

              {/* Subtext nudge to interact */}
              <button
                onClick={() => setCurrentScreen('phone')}
                className="mt-12 px-6 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-slate-700 text-xs font-semibold shadow-sm hover:bg-white/60 transition-all flex items-center space-x-2 group"
              >
                <span>Tap to continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* SCREEN 2: Phone Number Input */}
          {currentScreen === 'phone' && (
            <div className="w-full max-w-xs flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-[#f58220]" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Get Started</h2>
              <p className="text-xs text-slate-600 mb-8 px-2">Enter your phone number to receive a verification code</p>

              <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/60 flex items-center mb-4">
                <span className="px-3 text-sm font-bold text-slate-600 border-r border-slate-200">+1</span>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-slate-800 text-sm font-medium focus:outline-none placeholder-slate-400"
                />
              </div>

              <button
                onClick={() => setCurrentScreen('otp')}
                disabled={!phoneNumber}
                className="w-full py-3.5 rounded-2xl bg-[#f58220] hover:bg-[#e07318] active:scale-95 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentScreen('splash')}
                className="mt-4 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* SCREEN 3: Verification OTP Input */}
          {currentScreen === 'otp' && (
            <div className="w-full max-w-xs flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[#f58220]" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Code</h2>
              <p className="text-xs text-slate-600 mb-8 px-2">
                We sent a 4-digit code to <span className="font-semibold text-slate-800">{phoneNumber || '+1 (555) 000-0000'}</span>
              </p>

              {/* OTP Input Fields */}
              <div className="flex justify-between space-x-3 mb-6 w-full px-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-white/80 focus:border-[#f58220] text-center text-xl font-bold text-slate-800 shadow-md focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentScreen('success')}
                disabled={otp.some((digit) => digit === '')}
                className="w-full py-3.5 rounded-2xl bg-[#f58220] hover:bg-[#e07318] active:scale-95 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Verify & Continue</span>
              </button>

              <div className="mt-6 flex items-center space-x-2 text-xs">
                <span className="text-slate-600">Didn't receive code?</span>
                {timer > 0 ? (
                  <span className="text-slate-800 font-semibold">{timer}s</span>
                ) : (
                  <button
                    onClick={() => setTimer(30)}
                    className="text-[#f58220] font-bold hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentScreen('phone')}
                className="mt-4 text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change phone number</span>
              </button>
            </div>
          )}

          {/* SCREEN 4: Success Screen */}
          {currentScreen === 'success' && (
            <div className="w-full max-w-xs flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verified!</h2>
              <p className="text-xs text-slate-600 mb-8">Your phone number has been successfully authenticated.</p>

              <button
                onClick={() => {
                  setCurrentScreen('splash');
                  setOtp(['', '', '', '']);
                  setPhoneNumber('');
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all"
              >
                Return to Splash Screen
              </button>
            </div>
          )}

        </div>

        {/* Bottom Android System Navigation Bar (as shown in image) */}
        <div className="relative z-20 pb-2 pt-1 flex justify-center items-center space-x-16 text-slate-700 opacity-60">
          {/* Square Icon */}
          <div className="w-3.5 h-3.5 border-2 border-slate-700 rounded-sm" />
          
          {/* Concentric Circle Icon */}
          <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Back Triangle Icon */}
          <div 
            onClick={() => {
              if (currentScreen === 'phone') setCurrentScreen('splash');
              if (currentScreen === 'otp') setCurrentScreen('phone');
              if (currentScreen === 'success') setCurrentScreen('splash');
            }}
            className="cursor-pointer hover:opacity-100 transition-opacity"
          >
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-700" />
          </div>
        </div>

      </div>
    </div>
  );
}