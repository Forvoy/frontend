import { Card, CardContent } from "@/components/ui/card"

const PILLARS = [
  {
    title: "Dual-Staking Credibility",
    body: "Stake on outcomes and on informers. Incentivize truth and expertise, not lucky guesses.",
  },
  {
    title: "Information as Finance",
    body: "Turn analysis into a yield-bearing position. Fund credible insights, not speculation.",
  },
  {
    title: "On-Chain Reputation",
    body: "Dynamic soulbound NFTs track accuracy, streaks, and expertise across categories.",
  },
  {
    title: "Data-Verified Resolution",
    body: "Resolutions anchored by oracles and AI agents—fewer disputes, higher credibility.",
  },
  {
    title: "Analysts × DAOs × Investors",
    body: "Bridge those who know with those who decide. Credibility becomes portable capital.",
  },
]

export default function FeaturePillars() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-balance text-3xl md:text-4xl font-bold mb-4 text-foreground">The Five Pillars</h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
          The foundation of Information Finance: incentives for truth, verifiable resolution, and portable reputation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PILLARS.map((p, idx) => (
          <Card
            key={p.title}
            className="group border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold leading-tight text-foreground">{p.title}</h3>
                <div
                  className="h-8 w-8 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                  style={{
                    background: idx % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)",
                  }}
                  aria-hidden
                />
              </div>
              <p className="text-muted-foreground leading-relaxed">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
