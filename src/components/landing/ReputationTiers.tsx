import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Shield, Star, Crown } from "lucide-react"

const TIERS = [
  {
    name: "Novice",
    range: "0–49%",
    icon: TrendingUp,
    color: "from-slate-400 to-slate-500",
    description: "Learning the ropes",
    benefits: ["Basic access", "Standard visibility"],
  },
  {
    name: "Analyst",
    range: "50–69%",
    icon: Zap,
    color: "from-slate-500 to-slate-600",
    description: "Building credibility",
    benefits: ["Featured content", "Increased rewards"],
  },
  {
    name: "Expert",
    range: "70–84%",
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    description: "Proven track record",
    benefits: ["Leaderboard position", "Priority display"],
  },
  {
    name: "Master",
    range: "85–94%",
    icon: Star,
    color: "from-cyan-400 to-cyan-500",
    description: "Elite performance",
    benefits: ["Staking multiplier", "VIP features"],
  },
  {
    name: "Legend",
    range: "95–100%",
    icon: Crown,
    color: "from-blue-600 to-cyan-500",
    description: "Legendary status",
    benefits: ["DAO governance", "Exclusive perks"],
  },
]

export default function ReputationTiers() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Reputation Tiers</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Soulbound NFTs that evolve with your performance. Your credibility becomes a portable, verifiable asset
          on-chain.
        </p>
        <Badge className="bg-gray-500/10 text-blue-200 border-blue-200 hover:bg-blue-500/20">
          Permanent On-Chain Record
        </Badge>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
        {TIERS.map((tier) => {
          const IconComponent = tier.icon
          return (
            <Card
              key={tier.name}
              className="group border border-border bg-card hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden"
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Tier Info */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">{tier.range}</div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mt-auto pt-4 border-t border-border">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Soulbound</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Non-transferable tokens tied to your identity. Your reputation cannot be bought or sold.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Dynamic Visuals</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NFT images update automatically based on your performance tier and accuracy stats.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Portable</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your reputation follows you across Web3. Other protocols can integrate your credibility score.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
