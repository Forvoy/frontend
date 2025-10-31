"use client"

import { Home, TrendingUp, User, NotebookTextIcon, Droplet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAccount } from 'wagmi'

export default function MobileNav() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  const navItems = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      href: "/",
      active: pathname === "/"
    },
    {
      id: "news",
      icon: NotebookTextIcon,
      label: "News",
      href: "/news",
      active: pathname?.startsWith('/news')
    },
    {
      id: "analysts",
      icon: TrendingUp,
      label: "Analysts",
      href: "/analysts",
      active: pathname?.startsWith('/analysts')
    },
    {
      id: "faucet",
      icon: Droplet,
      label: "Faucet",
      href: "/faucet",
      active: pathname === '/faucet'
    },
    ...(isConnected && address ? [{
      id: "profile",
      icon: User,
      label: "Profile",
      href: `/profile/${address}`,
      active: pathname === `/profile/${address}`
    }] : [])
  ]

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/30 px-3 py-3 shadow-lg shadow-primary/10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}