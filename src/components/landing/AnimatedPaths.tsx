"use client"

import { motion } from "motion/react"

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
            initial={{ pathLength: 0.3, opacity: 0.8 }}
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

export default function AnimatedPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      
      {/* Additional accent paths */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <svg className="w-full h-full text-[#0066ff]" viewBox="0 0 696 316" fill="none">
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
          <motion.path
            d="M0 200 Q250 150 500 200 T900 200"
            stroke="currentColor"
            strokeWidth={0.8}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </svg>
      </div>
    </div>
  )
}