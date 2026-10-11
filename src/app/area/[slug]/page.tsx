import { AppShell } from "@/components/AppShell";
import { zones } from "@/lib/data";

export function generateStaticParams() {
  return zones.map((z) => ({ slug: z.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const z = zones.find((z) => z.id === params.slug);
  if (!z) return {};

  return {
    title: `${z.name} Durga Puja | PujoMap`,
    description: `Explore the best Durga Puja pandals in ${z.name}, Kolkata. Plan your route and find great food nearby.`,
  };
}

export default function AreaPage() {
  return <AppShell />;
}
