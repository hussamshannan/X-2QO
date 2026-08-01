import Cursor from "@/components/Cursor";
import Loader from "@/components/Loader";
import ScrollMotion from "@/components/ScrollMotion";
import SiteChrome from "@/components/SiteChrome";
import Access from "@/components/sections/Access";
import Hero from "@/components/sections/Hero";
import Log from "@/components/sections/Log";
import Manifesto from "@/components/sections/Manifesto";
import Research from "@/components/sections/Research";
import Specs from "@/components/sections/Specs";

export default function Page() {
  return (
    <>
      <a href="#main" className="skipLink">
        Skip to content
      </a>

      <Loader />
      <Cursor />
      <SiteChrome />

      <main id="main">
        <Hero />
        <Manifesto />
        <Research />
        <Specs />
        <Log />
        <Access />
      </main>

      <ScrollMotion />
    </>
  );
}
