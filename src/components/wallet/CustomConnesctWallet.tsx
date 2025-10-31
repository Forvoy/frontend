"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { User, Copy, Check, LogOut, Wallet } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { formatUnits, type Abi } from 'viem'
import MockTokenABI from '@/abis/MockToken.json'

const USDC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`
const MOCK_TOKEN_ABI = MockTokenABI as Abi

export default function CustomConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  })

  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, 6) // USDC has 6 decimals
    : '0.00'

  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Format large numbers with K, M, B, T suffixes
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance)

    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(2)}T`
    } else if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`
    } else {
      return num.toFixed(2)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // --- Not Connected ---
  if (!isConnected) {
    return (
      <Button
        onClick={openConnectModal}
        className="bg-gradient-to-r from-primary/70 to-accent/70 text-white font-medium border border-border/40
                   hover:from-primary hover:to-accent shadow-sm transition-colors"
      >
        Connect Wallet
      </Button>
    )
  }

  // --- Connected ---
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="bg-card border-border/40 text-foreground hover:bg-card/80 transition-colors rounded-lg px-3 py-2 h-auto flex items-center gap-2"
      >
        {/* Profile Icon */}
        <User className="w-5 h-5 p-0.5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white" />

        {/* Address */}
        <span className="font-mono text-sm font-medium">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border/40 rounded-lg shadow-lg overflow-hidden z-50">
          {/* USDC Balance */}
          <div className="px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2 text-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">
                {usdcBalance !== undefined
                  ? `${formatBalance(formattedUsdcBalance)} USDC`
                  : "Loading..."}
              </span>
            </div>
          </div>

          {/* Copy Address */}
          <button
            onClick={() => {
              copyAddress()
              setIsOpen(false)
            }}
            className="w-full px-4 py-3 flex items-center gap-2 text-foreground hover:bg-background/50 transition-colors text-sm border-b border-border/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-accent" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          {/* Disconnect */}
          <button
            onClick={() => {
              disconnect()
              setIsOpen(false)
            }}
            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-background/50 transition-colors text-sm text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  )
}