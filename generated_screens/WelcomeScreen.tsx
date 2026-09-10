import React, { useState } from 'react';
import { Wifi, Signal, Battery, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';

export default function KwismoApp() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 p-0 sm:p-4 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Mobile Device Frame Container */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-slate-950 sm:rounded-[48px] shadow-2xl overflow-hidden border-0 sm:border-[8px] border-slate-800 flex flex-col justify-between select-none">
        
        {/* iOS Status Bar */}
        <div className="relative z-30 flex justify-between items-center px-7 pt-3 pb-1 text-white text-xs font-semibold tracking-tight">
          <span>9:41</span>
          {/* Dynamic Island / Notch area space */}
          <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 fill-current stroke-none" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center">
              <Battery className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen Content */}
        {currentScreen === 'welcome' && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
            {/* Background Gradient */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: 'linear-gradient(180deg, #25B87A 0%, #29A873 25%, #2B4E4A 50%, #71808F 75%, #FFFFFF 100%)'
              }}
            />

            {/* Subtle Texture / Gradient Overlay for exact color match */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#233f3c]/40 to-white/90 mix-blend-multiply" />

            {/* Logo and Brand Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-8 px-6">
              {/* Kwismo Shield Logo */}
              <div className="w-28 h-32 mb-4 relative drop-shadow-lg flex items-center justify-center">
                <svg viewBox="0 0 100 115" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shield Outer White Body */}
                  <path 
                    d="M50 0C78 10 95 18 95 48C95 82 50 115 50 115C50 115 5 82 5 48C5 18 22 10 50 0Z" 
                    fill="white" 
                  />
                  {/* Inner Dark Green Layer */}
                  <path 
                    d="M50 30C41.7157 30 35 36.7157 35 45C35 49.5 37 53.5 40.2 56.2L25 80C32 87 41 90 50 90C59 90 68 87 75 80L59.8 56.2C63 53.5 65 49.5 65 45C65 36.7157 58.2843 30 50 30Z" 
                    fill="#1F5848" 
                  />
                  {/* Inner Light Teal Accent Layer */}
                  <path 
                    d="M50 30C41.7157 30 35 36.7157 35 45C35 48.2 36.1 51.1 38 53.5L50 72L62 53.5C63.9 51.1 65 48.2 65 45C65 36.7157 58.2843 30 50 30Z" 
                    fill="#3CA682" 
                  />
                  {/* Keyhole / Pin Center Dot Cutout */}
                  <circle cx="50" cy="43" r="5" fill="white" />
                  {/* Lower Chevron White cutout pattern inside shield */}
                  <path 
                    d="M50 98C42 95 34 89 27 82L50 62L73 82C66 89 58 95 50 98Z" 
                    fill="white" 
                  />
                </svg>
              </div>

              {/* Brand Typography */}
              <h1 className="text-white text-[42px] font-extrabold tracking-tight font-sans leading-none drop-shadow-sm">
                kwismo
              </h1>
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 px-6 pb-12 space-y-3.5 w-full">
              {/* Primary Action - Se Connecter */}
              <button
                onClick={() => setCurrentScreen('login')}
                className="w-full py-3.5 px-6 bg-[#FF9000] hover:bg-[#E58200] active:scale-[0.98] text-white font-semibold rounded-full shadow-md shadow-orange-500/20 text-[15px] transition-all duration-200 flex items-center justify-center tracking-wide"
              >
                Se connecter
              </button>

              {/* Secondary Action - Créer un compte */}
              <button
                onClick={() => setCurrentScreen('register')}
                className="w-full py-3.5 px-6 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#344275] font-semibold border border-[#344275] rounded-full text-[15px] transition-all duration-200 flex items-center justify-center tracking-wide"
              >
                Créer un compte
              </button>
            </div>
          </div>
        )}

        {/* Login Screen */}
        {currentScreen === 'login' && (
          <div className="relative flex-1 flex flex-col justify-between bg-white px-6 pt-4 pb-8 overflow-y-auto animate-fadeIn">
            <div>
              {/* Top Bar */}
              <button 
                onClick={() => setCurrentScreen('welcome')}
                className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 w-fit"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="mt-6 mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
                <p className="text-slate-500 text-sm mt-1">Bienvenue sur Kwismo, identifiez-vous pour continuer.</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button className="text-xs font-medium text-[#25B87A] hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-4">
              <button 
                onClick={() => alert("Connexion réussie!")}
                className="w-full py-3.5 px-6 bg-[#FF9000] hover:bg-[#E58200] active:scale-[0.98] text-white font-semibold rounded-full shadow-md text-sm transition"
              >
                Se connecter
              </button>

              <p className="text-center text-xs text-slate-500">
                Vous n'avez pas de compte ?{' '}
                <button 
                  onClick={() => setCurrentScreen('register')} 
                  className="text-[#25B87A] font-semibold hover:underline"
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Register Screen */}
        {currentScreen === 'register' && (
          <div className="relative flex-1 flex flex-col justify-between bg-white px-6 pt-4 pb-8 overflow-y-auto animate-fadeIn">
            <div>
              {/* Top Bar */}
              <button 
                onClick={() => setCurrentScreen('welcome')}
                className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 w-fit"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="mt-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Créer un compte</h2>
                <p className="text-slate-500 text-sm mt-1">Rejoignez Kwismo en quelques secondes.</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8+ caractères"
                      className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25B87A] focus:bg-white text-sm transition"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => alert("Compte créé avec succès!")}
                className="w-full py-3.5 px-6 bg-[#25B87A] hover:bg-[#1fa069] active:scale-[0.98] text-white font-semibold rounded-full shadow-md text-sm transition"
              >
                S'inscrire
              </button>

              <p className="text-center text-xs text-slate-500">
                Déjà un compte ?{' '}
                <button 
                  onClick={() => setCurrentScreen('login')} 
                  className="text-[#25B87A] font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Android Bottom Navigation Bar */}
        <div className="relative z-30 bg-white sm:bg-slate-900/10 py-3 flex justify-center items-center gap-12">
          {/* Square Icon */}
          <div className="w-3.5 h-3.5 bg-slate-600 rounded-[2px]" />
          {/* Circle Icon */}
          <div className="w-4 h-4 border-2 border-slate-600 rounded-full" />
          {/* Back Triangle Icon */}
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-slate-600" />
        </div>

      </div>
    </div>
  );
}