import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import WalletProvider from '../providers/WalletProvider'
import { ApolloWrapper } from '@/providers/ApolloWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Galaxer Map',
  description: 'Map for galaxer Toronto hackaton',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen  h-full `}>
        <WalletProvider>
          <ApolloWrapper>
            <Header />
            <main className="flex flex-col h-full items-center justify-between p-10">
              {children}
            </main>
          </ApolloWrapper>
        </WalletProvider>
      </body>
    </html>
  )
}
