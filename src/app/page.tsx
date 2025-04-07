// app/page.tsx
import Header from "@/components/header";
import GameDisplay from "@/components/game-display";
import SidePanel from "@/components/side-panel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row p-4 gap-4 w-full overflow-hidden">
        <GameDisplay />
        <SidePanel />
      </main>
    </div>
  );
}
