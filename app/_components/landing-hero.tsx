"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { SearchForm } from "./search-form";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* layered brand background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute right-[-8rem] top-24 h-[24rem] w-[24rem] rounded-full bg-teal-400/20 blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-[-6rem] h-[22rem] w-[22rem] rounded-full bg-lime-300/20 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur"
        >
          <Plane className="size-4" />
          Ascenda Loyalty · points-powered travel
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
        >
          Find your stay,{" "}
          <span className="text-primary">
            earn as you go
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground"
        >
          Search millions of hotels worldwide, compare live rates, and earn loyalty
          points on every booking.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-border/60 bg-card/80 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <SearchForm />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
