import ContactBar from './components/ContactBar';

import Navbar from './components/Navbar';

import Hero from './components/Hero';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
    
    <main className="min-h-screen bg-[#151D34]">

      <ContactBar />

      <Navbar />

      <Hero />

    </main>
    
      <h1 className="text-4xl font-bold text-emerald-400 mb-4">KWISMO</h1>
      <p className="text-slate-300 text-lg text-center max-w-xl">
        Plateforme d'intelligence et de prévention contre la fraude Mobile Money.
      </p>
      
    </div>
  );
}
