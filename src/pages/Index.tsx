import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import CollectionsGrid from "@/components/CollectionsGrid";
import NewArrivals from "@/components/NewArrivals";
import EditorialBanner from "@/components/EditorialBanner";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    description:
      "MAISON — luxury menswear curated for the modern gentleman. Discover new arrivals, signature collections, and timeless essentials.",
  });
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <PageTransition>
        <HeroSection />
        <MarqueeBanner />
        <CollectionsGrid />
        <NewArrivals />
        <EditorialBanner />
        <Newsletter />
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Index;
