import ContactBar from './components/ContactBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Comparison from './components/Comparison';
import FraudProblem from './components/FraudProblem';
import DowloadCTA from './components/DownloadCTA';
import Footer from './components/Footer';

export default function LandingPage() {

  return (

    <main className="min-h-screen w-full overflow-x-hidden bg-[#151D34]">
      
      <ContactBar />
      
      <Navbar />
      
      <Hero />

      <FraudProblem/>

      <Comparison/>

      <Pricing/>

      <Partners/>

      <DowloadCTA/>

      <Footer/>
    
    </main>
  );
}