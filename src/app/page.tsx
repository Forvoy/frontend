import DualStaking from "@/components/landing/DualStaking"
import FeaturePillars from "@/components/landing/FeaturePillars"
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"
import ReputationTiers from "@/components/landing/ReputationTiers"
import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Dark overlay for better text readability across entire page */}
      <div className="fixed inset-0 bg-black/20 z-5 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Desktop Header is handled in layout */}
        <div className="hidden md:block">
          <Header />
        </div>
        <Hero />

        {/* Desktop-only sections - hidden on mobile */}
        <div className="hidden md:block">
          <section id="pillars" className="px-4 md:px-6 py-16">
            <FeaturePillars />
          </section>

          <section id="dual-staking" className="px-4 md:px-6 py-16">
            <DualStaking />
          </section>

          <section id="reputation" className="px-4 md:px-6 py-16">
            <ReputationTiers />
          </section>

          <section id="how" className="px-4 md:px-6 py-16">
            <HowItWorks />
          </section>

          <section className="px-4 md:px-6 pb-20 pt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border border-border bg-[#1A1A1D] shadow-md">
                <CardContent className="p-8 md:p-12 text-center">
                  <h3 className="text-balance text-3xl md:text-4xl font-semibold text-foreground">
                    Transform noise into signal. Finance credible information.
                  </h3>
                  <p className="mt-4 md:mt-6 text-muted-foreground text-lg text-pretty max-w-2xl mx-auto">
                    Join the permissionless information finance protocol. Build on-chain reputation through verifiable
                    analysis.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center">
                    <Link href="/news">
                      <Button
                        size="lg"
                        className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                      >
                        Explore News
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
