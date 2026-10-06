import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChecklistFakeNews from "@/components/ChecklistFakeNews";
import Verificador from "@/components/Verificador";
import PapelDaIA from "@/components/PapelDaIA";
import OndeChecar from "@/components/OndeChecar";
import SobreProjeto from "@/components/SobreProjeto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ChecklistFakeNews />
        <Verificador />
        <PapelDaIA />
        <OndeChecar />
        <SobreProjeto />
      </main>
      <Footer />
    </>
  );
}
