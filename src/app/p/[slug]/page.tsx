import { AppShell } from "@/components/AppShell";
import { places } from "@/lib/data";

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = places.find((p) => p.slug === params.slug);
  if (!p) return {};

  return {
    title: `${p.name.en} | PujoMap`,
    description: `Visit ${p.name.en} in ${p.area}. Explore the Kolkata Durga Puja map and plan your route.`,
    openGraph: {
      title: `${p.name.en} | PujoMap`,
      description: `Visit ${p.name.en} in ${p.area}. Explore the Kolkata Durga Puja map and plan your route.`,
    },
  };
}

export default function PlacePage() {
  return <AppShell />;
}
