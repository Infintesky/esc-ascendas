import { SearchForm } from "./_components/search-form";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find your stay
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search hotels worldwide and earn points on every booking.
        </p>
      </div>
      <SearchForm />
    </main>
  );
}
