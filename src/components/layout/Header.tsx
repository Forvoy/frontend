"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import CustomConnectButton from '@/components/wallet/CustomConnesctWallet'
import { ChainIndicator } from '@/components/wallet/ChainIndicator'

export default function Header() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  const isNewsActive = pathname?.startsWith('/news')
  const isAnalystsActive = pathname?.startsWith('/analysts')
  const isFaucetActive = pathname === '/faucet'
  const isMyProfile = isConnected && address && pathname === `/profile/${address}`

  const navigation = [
    { name: "News", href: "/news", active: isNewsActive },
    { name: "Analysts", href: "/analysts", active: isAnalystsActive },
    { name: "Faucet", href: "/faucet", active: isFaucetActive },
  ]

  if (isConnected && address) {
    navigation.push({
      name: "My Profile",
      href: `/profile/${address}`,
      active: isMyProfile || false
    })
  }

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <nav className="bg-background/80 backdrop-blur-md border border-border/30 rounded-2xl px-4 py-2 shadow-sm shadow-primary/10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image
                src="/Forvoy.png"
                alt="FORVOY"
                width={32}
                height={32}
                className="w-12 h-12 rounded-lg"
              />
              <span className="font-mono text-xl font-bold tracking-wide text-foreground">
                FORVOY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${item.active
                    ? 'text-foreground bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-background/20'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Chain Indicator & Connect Wallet */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <ChainIndicator />
              </div>
              <CustomConnectButton />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}