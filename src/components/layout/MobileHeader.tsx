"use client"

import Image from "next/image"
import Link from "next/link"
import { WalletConnect } from '@/lib/privy'
import { useFarcaster } from '@/contexts/FarcasterProvider'
import { ChainIndicator } from '@/components/wallet/ChainIndicator'

export default function MobileHeader() {
  const { isInFarcaster, user: farcasterUser, isReady } = useFarcaster()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/forter.webp"
            alt="FORTER"
            width={24}
            height={24}
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-mono text-lg font-bold tracking-wide text-foreground">
            FORTER
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Farcaster User Info - Only show in MiniApp */}
          {isReady && isInFarcaster && farcasterUser && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
              {farcasterUser.pfpUrl && (
                <Image
                  src={farcasterUser.pfpUrl}
                  alt={farcasterUser.username || 'User'}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-xs font-medium text-foreground">
                @{farcasterUser.username || `FID:${farcasterUser.fid}`}
              </span>
            </div>
          )}

          {/* Chain Indicator & Wallet Connect */}
          <ChainIndicator />
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}