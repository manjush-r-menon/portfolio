import { jetbrainsMono } from "@/utils/fonts";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">Default Font</h1>
      <p className={`${jetbrainsMono.className} text-2xl text-green-400 mt-4`}>
        This is Pacifico font — it should look cursive and playful!
      </p>
    </main>
  );
}
