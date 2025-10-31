"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(0,102,255,${0.1 + i * 0.02})`, // Using primary color
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-primary" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function BackgroundPaths({
  title = "Stake on Credibility",
  subtitle = "not luck.",
  description = "Forter is the Information Finance Protocol. Back outcomes and the analysts who forecast them.",
}: {
  title?: string
  subtitle?: string
  description?: string
}) {
  const titleWords = title.split(" ")
  const subtitleWords = subtitle.split(" ")

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Additional accent paths */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full text-accent opacity-30" viewBox="0 0 696 316" fill="none">
          <motion.path
            d="M100 100 Q350 50 600 100 T1000 100"
            stroke="currentColor"
            strokeWidth={1}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 backdrop-blur-md px-6 py-3 text-sm font-medium shadow-xl shadow-primary/20 mb-8"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
            Forecast Porter
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 tracking-tighter">
            {titleWords.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-foreground to-foreground/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tighter">
            {subtitleWords.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`sub-${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.5 + wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-primary via-accent to-primary"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <div
              className="inline-block group relative bg-gradient-to-b from-primary/10 to-accent/10 
                            p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl 
                            transition-shadow duration-300"
            >
              <Button
                variant="ghost"
                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                              bg-background/95 hover:bg-background/100 text-foreground 
                              transition-all duration-300 group-hover:-translate-y-0.5 
                              border border-border/10 hover:shadow-md"
              >
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                  Explore News
                </span>
                <span
                  className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                    transition-all duration-300"
                >
                  →
                </span>
              </Button>
            </div>

            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-border/30 text-foreground 
                         hover:bg-secondary/50 hover:text-foreground hover:border-border/50 
                         backdrop-blur-md bg-background/5 transition-all duration-300 
                         hover:scale-105 hover:shadow-lg"
            >
              Read the Vision
            </Button>
          </motion.div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/20">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span>Secure, verifiable outcomes</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/20">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Dual-staking accountability</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}