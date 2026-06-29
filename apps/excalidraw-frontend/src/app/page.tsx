import Nav from "@/src/components/Nav";
import Hero from "@/src/components/Hero";
import Features from "@/src/components/Features";
import Templates from "@/src/components/Templates";
import Pricing from "@/src/components/Pricing";
import CTA from "@/src/components/CTA";
import Footer from "@/src/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Features />
      <Templates />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
