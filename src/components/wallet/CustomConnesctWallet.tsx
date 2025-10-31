"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect, useReadContract, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { User, Copy, Check, LogOut, Wallet, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { formatUnits, type Abi } from 'viem'
import MockTokenABI from '@/abis/MockToken.json'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoonPayWidget } from '@/components/onramp/MoonPayWidget'
import Image from 'next/image'

const USDC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`
const MOCK_TOKEN_ABI = MockTokenABI as Abi
const FLOW_TESTNET_CHAIN_ID = 545

export default function CustomConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Check if on correct network
  const isCorrectNetwork = chain?.id === FLOW_TESTNET_CHAIN_ID
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isCorrectNetwork,
    }
  })

  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, 6) // USDC has 6 decimals
    : '0.00'

  // Check if user has low USDC balance (less than $10 for staking)
  const hasLowBalance = parseFloat(formattedUsdcBalance) < 10

  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showMoonPay, setShowMoonPay] = useState(false)
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

  const handleSwitchToFlow = async () => {
    try {
      setIsSwitching(true)
      setConnectError(null)
      await switchChain({ chainId: FLOW_TESTNET_CHAIN_ID })
      setShowNetworkWarning(false)
    } catch (error) {
      console.error('Failed to switch network:', error)
      setConnectError('Failed to switch to Flow EVM Testnet. Please try manually in your wallet.')
    } finally {
      setIsSwitching(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnectError(null)
      openConnectModal?.()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setConnectError('Failed to connect wallet. Please try again.')
    }
  }

  // Show warning if connected but on wrong network
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      setShowNetworkWarning(true)
    }
  }, [isConnected, isCorrectNetwork])

  // Auto-switch network after connection
  useEffect(() => {
    const autoSwitchNetwork = async () => {
      if (isConnected && !isCorrectNetwork && !isSwitching) {
        try {
          setIsSwitching(true)
          setConnectError(null)
          await switchChain({ chainId: FLOW_TESTNET_CHAIN_ID })
          setShowNetworkWarning(false)
        } catch (error) {
          console.error('Auto-switch failed:', error)
          // Don't show error immediately, let user see the warning dialog first
        } finally {
          setIsSwitching(false)
        }
      }
    }

    // Add a small delay to avoid immediate switch that might confuse users
    const timer = setTimeout(autoSwitchNetwork, 1000)
    return () => clearTimeout(timer)
  }, [isConnected, isCorrectNetwork, switchChain, isSwitching])

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
      <div className="space-y-2">
        <Button
          onClick={handleConnect}
          className="bg-linear-to-r from-primary/70 to-accent/70 text-white font-medium border border-border/40
                     hover:from-primary hover:to-accent shadow-sm transition-colors"
        >
          Connect Wallet
        </Button>
        {connectError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{connectError}</span>
          </div>
        )}
      </div>
    )
  }

  // --- Wrong Network Warning ---
  if (isConnected && !isCorrectNetwork) {
    return (
      <>
        {/* Network Warning Dialog */}
        <Dialog open={showNetworkWarning} onOpenChange={setShowNetworkWarning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <DialogTitle className="text-xl">Switch to Flow EVM Testnet</DialogTitle>
              </div>
              <DialogDescription className="text-base pt-2">
                <div className="space-y-3">
                  <p>This app only supports Flow EVM Testnet. Please switch your wallet network to Flow EVM Testnet to continue.</p>

                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <h4 className="font-medium mb-2">Network Details:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Chain ID:</strong> 545</li>
                      <li>• <strong>Network Name:</strong> Flow EVM Testnet</li>
                      <li>• <strong>RPC URL:</strong> https://testnet.evm.nodes.onflow.org</li>
                      <li>• <strong>Currency:</strong> FLOW</li>
                      <li>• <strong>Explorer:</strong> https://evm-testnet.flowscan.io</li>
                    </ul>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Click &quot;Switch to Flow EVM Testnet&quot; below or add the network manually in your wallet.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
              <Button
                onClick={handleSwitchToFlow}
                disabled={isSwitching}
                className="w-full bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
              >
                {isSwitching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  'Switch to Flow EVM Testnet'
                )}
              </Button>
              <Button
                onClick={() => {
                  disconnect()
                  setShowNetworkWarning(false)
                  setConnectError(null)
                }}
                variant="outline"
                className="w-full"
                disabled={isSwitching}
              >
                Disconnect
              </Button>
              {connectError && (
                <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{connectError}</span>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Wrong Network Button State */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowNetworkWarning(true)}
              variant="outline"
              className="bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Wrong Network
            </Button>
            <Button
              onClick={handleSwitchToFlow}
              disabled={isSwitching}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {isSwitching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                'Quick Switch'
              )}
            </Button>
          </div>
          {connectError && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{connectError}</span>
            </div>
          )}
        </div>
      </>
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
        <User className="w-5 h-5 p-0.5 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white" />

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
                {isCorrectNetwork && usdcBalance !== undefined
                  ? `${formatBalance(formattedUsdcBalance)} USDC`
                  : isCorrectNetwork
                    ? "Loading..."
                    : "Wrong Network"}
              </span>
            </div>
            {!isCorrectNetwork && (
              <div className="mt-2">
                <Button
                  onClick={() => {
                    handleSwitchToFlow()
                    setIsOpen(false)
                  }}
                  size="sm"
                  className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                >
                  Switch to Flow
                </Button>
              </div>
            )}
            {/* Buy USDC Button for low balance */}
            {isCorrectNetwork && hasLowBalance && (
              <div className="mt-2">
                <Button
                  onClick={() => {
                    setShowMoonPay(true)
                    setIsOpen(false)
                  }}
                  size="sm"
                  className="w-full text-base bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Image 
                    src="/Assets/Logo/moonpay-icon.png" 
                    alt="MoonPay" 
                    width={16} 
                    height={16}
                    className="mr-1 rounded-sm"
                  />
                  Buy USDC
                </Button>
              </div>
            )}
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

      {/* MoonPay Widget Dialog */}
      <Dialog open={showMoonPay} onOpenChange={setShowMoonPay}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buy USDC with MoonPay</DialogTitle>
            <DialogDescription>
              Purchase USDC directly with your credit card or bank transfer to start staking.
            </DialogDescription>
          </DialogHeader>
          <MoonPayWidget
            onClose={() => setShowMoonPay(false)}
            onSuccess={() => {
              setShowMoonPay(false)
              // Optionally refresh balance or show success message
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}