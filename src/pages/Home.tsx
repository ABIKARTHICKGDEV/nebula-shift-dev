import { Nav } from "@/components/portfolio/nav";
import { RoleSwitcher } from "@/components/portfolio/role-switcher";
import { Hero } from "@/components/portfolio/hero";
import { FeaturedSpotlight } from "@/components/portfolio/featured-spotlight";
import { Projects } from "@/components/portfolio/projects";
import {
  About,
  CurrentlyBuilding,
  Showcase,
  Skills,
  Learning,
  Process,
  GithubBlock,
  CareerInterests,
  Contact,
  Footer,
  LoadingScreen,
} from "@/components/portfolio/sections";
import { useViewerRole } from "@/hooks/use-viewer-role";
import { portfolio } from "@/data/portfolio";
import { siteConfig } from "@/config/site";
import { useDocumentMeta } from "@/lib/use-document-meta";

export default function Home() {
  const [role, setRole] = useViewerRole();

  useDocumentMeta({
    title: "Abikarthick G — Unity Game Developer & Gameplay Programmer",
    description:
      "Portfolio of Abikarthick G — Unity game developer, gameplay programmer, and game designer. Play my games, view projects, and download resume.",
    canonical: siteConfig.siteUrl + "/",
    og: {
      title: "Abikarthick G — Unity Game Developer",
      description:
        "Unity, C#, and gameplay programming portfolio. Playable itch.io builds, project case studies, and live GitHub activity.",
      type: "website",
      url: siteConfig.siteUrl + "/",
    },
    twitter: { card: "summary_large_image" },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: portfolio.profile.name,
      jobTitle: "Unity Game Developer",
      email: portfolio.profile.email,
      url: portfolio.profile.linkedin,
      sameAs: [portfolio.profile.github, portfolio.profile.linkedin],
      address: {
        "@type": "PostalAddress",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
  });

  return (
    <div className="relative min-h-screen">
      <LoadingScreen />
      <Nav role={role} />
      <main>
        <RoleSwitcher active={role} onChange={setRole} />
        <Hero role={role} />
        <FeaturedSpotlight role={role} />
        <About />
        <CurrentlyBuilding />
        <Projects role={role} />
        <Showcase />
        <Skills role={role} />
        <Learning />
        <Process />
        <GithubBlock />
        <CareerInterests />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
