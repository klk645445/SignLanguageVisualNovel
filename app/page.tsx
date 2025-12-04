import { VisualNovelEngine } from "./components/visual-novel";
import { sampleStory } from "./data/sample-story";

export default function Home() {
  return (
    <main className="w-full h-screen">
      <VisualNovelEngine story={sampleStory} />
    </main>
  );
}
