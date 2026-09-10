import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Wifi, Battery, Signal, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form States
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      alert(isLogin ? 'Connexion réussie !' : 'Compte créé avec succès !');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Mobile Device Wrapper */}
      <div className="relative w-full max-w-[412px] h-[892px] bg-white rounded-[50px] shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden border-[10px] border-slate-800 flex flex-col justify-between">
        
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-30 text-white select-none">
          <span className="text-sm font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-4 h-4 fill-current" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Background Gradient */}
        <div 
          className="absolute inset-0 transition-all duration-700 ease-in-out z-0"
          style={{
            background: isLogin 
              ? 'linear-gradient(180deg, #0f766e 0%, #1e293b 50%, #ffffff 85%)'
              : 'linear-gradient(180deg, #15a362 0%, #3d5a50 45%, #ffffff 75%)'
          }}
        />

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-between pt-16 pb-6 px-6 overflow-y-auto no-scrollbar">
          
          {/* Header Section */}
          <div className="mt-6 mb-6 animate-fade-in">
            <h1 className="text-[38px] font-bold text-white leading-tight tracking-tight">
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </h1>
            <p className="text-emerald-100/80 text-[15px] mt-3 leading-relaxed max-w-[280px]">
              {isLogin 
                ? 'Remplissez vos identifiants pour accéder à votre espace personnel.' 
                : 'Remplissez le formulaire ci-dessous pour créer votre compte.'}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-end gap-3.5">
            
            {/* Success Toast Overlay */}
            {submitted && (
              <div className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-bounce mb-2">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Opération réussie</p>
                  <p className="text-xs text-emerald-100">Veuillez patienter...</p>
                </div>
              </div>
            )}

            {!isLogin && (
              /* Nom & Prénom Row */
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required={!isLogin}
                    className="w-full h-[54px] px-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required={!isLogin}
                    className="w-full h-[54px] px-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[54px] pl-4 pr-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[54px] pl-4 pr-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Input (Only for Sign Up) */}
            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmation"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                  className="w-full h-[54px] pl-4 pr-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {isLogin && (
              <div className="text-right px-1">
                <button type="button" className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted}
              className="w-full h-[54px] mt-2 bg-[#ff9500] hover:bg-[#e08300] active:scale-[0.98] text-white font-semibold rounded-full shadow-md shadow-orange-500/10 transition-all flex items-center justify-center text-[16px]"
            >
              {submitted ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isLogin ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 tracking-wider">OU</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {/* Secondary Action Button */}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setNom('');
              setPrenom('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="w-full h-[54px] border border-slate-800 hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-semibold rounded-full transition-all flex items-center justify-center text-[15px]"
          >
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>

          {/* Android Style Bottom Navigation Bar */}
          <div className="mt-8 flex items-center justify-around w-full max-w-[240px] mx-auto text-slate-400 select-none">
            <button className="p-2 hover:text-slate-600 transition-colors">
              <div className="w-3.5 h-3.5 bg-slate-400 rounded-sm" />
            </button>
            <button className="p-2 hover:text-slate-600 transition-colors">
              <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />
            </button>
            <button className="p-2 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}