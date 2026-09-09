import { getLiveBriefing } from "@/src/lib/briefing";
import { getSeoulWeather } from "@/src/lib/weather";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [briefing, weather] = await Promise.all([getLiveBriefing(), getSeoulWeather()]);
  return <Dashboard briefing={briefing} weather={weather} />;
}
