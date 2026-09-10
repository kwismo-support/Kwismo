import ContactBar from './components/ContactBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FraudProblem from './components/FraudProblem';
import WhatKwismoBrings from './components/WhatKwismoBrings';
import AfricanTeam from './components/AfricanTeam';
import Pricing from './components/Pricing';
import OperatorsInstitutions from './components/OperatorsInstitutions';
import AllYouNeed from './components/AllYouNeed';
import HowItWorks from './components/HowItWorks';
import ContactFormSection from './components/ContactFormSection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0F1626] font-body text-slate-900 dark:text-white transition-colors duration-200">
      <ContactBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FraudProblem />
        <WhatKwismoBrings />
        <AfricanTeam />
        <Pricing />
        <OperatorsInstitutions />
        <AllYouNeed />
        <HowItWorks />
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  );
}