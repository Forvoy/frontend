import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, User, Zap, Shield, Target, Brain } from "lucide-react"

export default function DualStaking() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Dual Staking Mechanism</h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Stake on outcomes or back credible analysts. Choose your strategy and earn rewards.
        </p>
        <Badge className="mt-6 bg-gray-500/10 text-blue-200 border border-primary/30 px-4 py-2 text-sm font-medium">
          Outcome + Credibility = Complete Information Finance
        </Badge>
      </div>

      {/* Two Staking Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Outcome Staking Card */}
        <Card className="group border border-border bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <Badge className="mb-3 bg-primary/15 text-primary border-0 font-medium">Outcome Staking</Badge>
                <h3 className="text-2xl font-bold text-foreground">Stake on Outcome</h3>
              </div>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed text-base">
              Traditional YES/NO positions. Provide liquidity and earn from collective prediction correctness.
            </p>

            {/* Metrics Grid */}
            <div className="space-y-4 mb-8 p-6 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Reward Share</span>
                </div>
                <span className="font-bold text-primary text-lg">80%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                </div>
                <span className="font-semibold text-foreground">Medium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Entry Barrier</span>
                </div>
                <span className="font-semibold text-primary">Low</span>
              </div>
            </div>

            {/* Example */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-foreground">Example</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Stake $100 on &ldquo;Will BTC hit $100k by Dec 2024?&rdquo; → Earn proportional rewards if correct
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credibility Staking Card */}
        <Card className="group border border-border bg-gradient-to-br from-card to-card/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
                <Brain className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <Badge className="mb-3 bg-accent/15 text-accent border-0 font-medium">Credibility Staking</Badge>
                <h3 className="text-2xl font-bold text-foreground">Stake on Informer</h3>
              </div>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed text-base">
              Back specific analysts based on their track record. Earn when your chosen informer proves correct.
            </p>

            {/* Metrics Grid */}
            <div className="space-y-4 mb-8 p-6 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Reward Share</span>
                </div>
                <span className="font-bold text-accent text-lg">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                </div>
                <span className="font-semibold text-foreground">Higher</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Research Required</span>
                </div>
                <span className="font-semibold text-accent">High</span>
              </div>
            </div>

            {/* Example */}
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm font-semibold text-foreground">Example</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Alice has 87% accuracy → Stake $50 on her BTC analysis → Earn if her prediction is correct
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Pool Distribution */}
      <Card className="border border-border bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Reward Pool Distribution</h3>

          <div className="space-y-8">
            {/* Distribution Bar */}
            <div className="relative">
              <div className="flex h-16 rounded-xl overflow-hidden shadow-lg border border-border/50">
                <div className="flex-[80] bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-bold text-base md:text-lg">
                  80%
                </div>
                <div className="flex-[20] bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center text-foreground font-bold text-base md:text-lg">
                  20%
                </div>
              </div>
            </div>

            {/* Distribution Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div className="text-sm font-semibold text-primary">Outcome Liquidity Providers</div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rewards for providing prediction depth and collective intelligence
                </p>
              </div>

              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-accent" />
                  <div className="text-sm font-semibold text-accent">Credibility Ecosystem</div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  20% to correct analysts who create quality analysis pools
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Quote */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground italic text-lg">
          &ldquo;Balance collective wisdom with human intelligence — credibility drives the majority of rewards.&rdquo;
        </p>
      </div>
    </div>
  )
}
