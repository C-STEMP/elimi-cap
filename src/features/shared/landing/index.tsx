import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { PipelineSection } from "./components/PipelineSection";
import { InfrastructureSection } from "./components/InfrastructureSection";
import { PillarsSection } from "./components/PillarsSection";
import { ImpactSection } from "./components/ImpactSection";
import { FaqSection } from "./components/FaqSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { AosProvider } from "./components/AosProvider";

export default function LandingPage() {
  return (
    <AosProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <PipelineSection />
          <InfrastructureSection />
          <PillarsSection />
          <ImpactSection />
          <FaqSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </AosProvider>
  );
}
