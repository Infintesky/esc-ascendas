import { SearchForm } from "./_components/search-form";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Find your stay</h1>
      <SearchForm />
    </main>
  );
}
