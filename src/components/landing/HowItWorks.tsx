import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, PenTool, Users, Zap, Trophy, ArrowRight } from "lucide-react"

const STEPS = [
  {
    title: "Connect & Browse",
    description: "Connect wallet and browse curated news across crypto, macro, and tech.",
    icon: Wallet,
    color: "from-blue-500 to-blue-600",
    details: ["Wallet authentication", "Farcaster integration", "News discovery"],
  },
  {
    title: "Write Analysis",
    description: "Submit detailed reasoning with evidence and stake USDC to prove conviction.",
    icon: PenTool,
    color: "from-cyan-400 to-cyan-500",
    details: ["Research & evidence", "Reasoning submission", "Conviction staking"],
  },
  {
    title: "Community Stakes",
    description: "Others stake on outcomes or back your credibility in dual staking pools.",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    details: ["Outcome staking", "Informer backing", "Pool accumulation"],
  },
  {
    title: "Oracle Resolution",
    description: "AI agents and oracles verify outcomes using real-world data sources.",
    icon: Zap,
    color: "from-cyan-400 to-cyan-500",
    details: ["Data verification", "Oracle consensus", "Dispute resolution"],
  },
  {
    title: "Rewards & Reputation",
    description: "Distribute rewards based on accuracy and build permanent credibility.",
    icon: Trophy,
    color: "from-blue-600 to-cyan-500",
    details: ["Reward distribution", "NFT updates", "Reputation building"],
  },
]

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">How Forvoy Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          From connecting your wallet to building permanent on-chain reputation — the complete Information Finance
          journey.
        </p>
        <Badge className="bg-gray-500/10 text-blue-200 border-blue-200 hover:bg-blue-500/20">
          5-Step Process to Credible Rewards
        </Badge>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {STEPS.map((step, i) => {
          const IconComponent = step.icon
          return (
            <div key={step.title} className="relative">
              <Card className="group border border-border bg-card hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Step Number & Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-500/10 text-blue-200 border-blue-200">
                      {i + 1}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow">{step.description}</p>

                  {/* Details */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Arrow Connector */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm group-hover:border-blue-400/50 transition-colors">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Card */}
      <Card className="border border-border bg-gradient-to-r from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-3">The Complete Cycle</h3>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Each prediction cycle builds your on-chain reputation. Over time, your accuracy becomes a measurable,
            portable asset that other protocols can integrate — transforming information into a financial primitive.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
