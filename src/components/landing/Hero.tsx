import AnimatedPaths from "./AnimatedPaths";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Fixed Animated Paths Background - stays in place */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <AnimatedPaths />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center px-4 md:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 backdrop-blur-md px-4 py-2 text-sm font-medium shadow-lg shadow-primary/10">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forecast Voyage
          </span>
        </div>

        <h1 className="text-balance mt-6 text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Stake on Credibility,
          </span>
          <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            not luck.
          </span>
        </h1>

        <p className="text-pretty mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Forvoy is the{" "}
          <span className="font-semibold text-foreground">
            Information Finance Protocol
          </span>
          . Back outcomes and the analysts who forecast them. Build portable,
          on-chain reputation with dynamic NFTs.
        </p>

        {/* Mobile: Show Explore News button */}
        <div className="mt-8 md:hidden">
          <Link href="/news">
            <Button
              size="lg"
              className="min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              Explore News
            </Button>
          </Link>
        </div>

        {/* Desktop: Show feature indicators */}
        <div className="mt-6 hidden md:flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Secure, verifiable outcomes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Dual-staking accountability</span>
          </div>
        </div>
      </div>
    </section>
  );
}
