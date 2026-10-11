import { AppShell } from "@/components/AppShell";
import { metroStations } from "@/lib/data";

export function generateStaticParams() {
  // Simple slugification matching standard URL patterns
  return metroStations.map((m) => ({ slug: m.toLowerCase().replace(/\s+/g, '-') }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const stationName = metroStations.find((m) => m.toLowerCase().replace(/\s+/g, '-') === params.slug);
  if (!stationName) return {};

  return {
    title: `Pandals near ${stationName} Metro | PujoMap`,
    description: `Explore the best Durga Puja pandals near ${stationName} Metro station. Plan your route and find great food nearby.`,
  };
}

export default function MetroPage() {
  return <AppShell />;
}
