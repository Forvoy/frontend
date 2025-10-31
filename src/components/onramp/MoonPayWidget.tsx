'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface MoonPayWidgetProps {
  onClose?: () => void;
  onSuccess?: (transactionData: any) => void;
}

export function MoonPayWidget({ onClose, onSuccess }: MoonPayWidgetProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const openMoonPayWidget = () => {
    if (!address) return;

    setIsLoading(true);
    
    // MoonPay widget configuration
    const moonPayUrl = new URL('https://buy-staging.moonpay.com');
    moonPayUrl.searchParams.set('apiKey', process.env.NEXT_PUBLIC_MOONPAY_API_KEY!);
    moonPayUrl.searchParams.set('currencyCode', 'usdc');
    moonPayUrl.searchParams.set('walletAddress', address);
    moonPayUrl.searchParams.set('colorCode', '#3b82f6');
    moonPayUrl.searchParams.set('showWalletAddressForm', 'true');
    moonPayUrl.searchParams.set('redirectURL', window.location.origin);

    // Open MoonPay in popup
    const popup = window.open(
      moonPayUrl.toString(),
      'moonpay',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    setIsLoading(false);
    setShowWidget(true);

    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setShowWidget(false);
        onSuccess?.({ status: 'completed' });
      }
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {!showWidget ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-1">
              <Image 
                src="/Assets/Logo/moonpay-icon.png" 
                alt="MoonPay" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">
                Need USDC to stake?
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Buy USDC directly with your credit card or bank transfer. Minimum stake is $10 USDC.
              </p>
              <Button
                onClick={openMoonPayWidget}
                disabled={!address || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Image 
                      src="/Assets/Logo/moonpay-icon.png" 
                      alt="MoonPay" 
                      width={16} 
                      height={16}
                      className="mr-2 rounded-sm"
                    />
                    Buy USDC with MoonPay
                  </>
                )}
              </Button>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              MoonPay window opened. Complete your purchase to continue.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoonPayWidget;