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
    title: "Luxury Menswear in Pakistan — Kurtas, Suits, Sherwani",
    description:
      "MAISON is Pakistan's premier luxury menswear brand. Shop designer kurtas, tailored suits, sherwanis, waistcoats & western formals. Eastern & western wear with nationwide COD delivery.",
    keywords:
      "MAISON, MAISON clothing, MAISON Pakistan, luxury menswear Pakistan, designer kurta, shalwar kameez, sherwani, wedding sherwani, waistcoat, jamawar, boski suit, khaddar kurta, tailored suit, mens formal suit, western wear men, eastern wear men, mens fashion Pakistan, online menswear Pakistan",
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
