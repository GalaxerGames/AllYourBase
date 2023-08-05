'use client'

import '@rainbow-me/rainbowkit/styles.css'

import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'
import { baseGoerli } from 'viem/chains'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import throwIfUndefined from '@/utils/throwIfUndefined'

type WalletProviderProps = {
  children: React.ReactNode
}

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { chains, publicClient } = configureChains(
    [baseGoerli],
    [publicProvider()]
  )

  const { connectors } = getDefaultWallets({
    appName: 'Galaxer',
    projectId: throwIfUndefined(
      process.env.NEXT_PUBLIC_PROJECT_ID,
      'Missing env PROJECT_ID'
    ),
    chains,
  })

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  })

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: '#5A5A5A',
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default WalletProvider
