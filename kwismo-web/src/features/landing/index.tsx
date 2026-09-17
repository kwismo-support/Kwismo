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
import FaqSection from './components/FaqSection';
import ContactFormSection from './components/ContactFormSection';
import Footer from './components/Footer';
import ScrollToTopButton from '@/shared/components/ScrollToTopButton';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-brand-navy font-body text-slate-900 dark:text-white transition-colors duration-200 relative">
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
        <FaqSection />
        <ContactFormSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}