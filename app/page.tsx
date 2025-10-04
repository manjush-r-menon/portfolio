import { Container } from "@/components/container/container";
import HeroSection from "@/components/hero-section/hero-section";
import AboutMeSection from "@/components/about-me-section/about-me-section";
import ContactMeSection from "@/components/contact-me/contact-me-section";
import { ExperienceRoadmap } from "@/components/road-map/road-map";

export default function Home() {
  return (
    <Container className="flex h-full items-center mt-6 md:mt-12">
      <HeroSection />
      <AboutMeSection />
      <ExperienceRoadmap />
      <ContactMeSection />
    </Container>
  );
}
