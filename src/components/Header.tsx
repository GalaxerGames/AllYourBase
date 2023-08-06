'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'

const Header: React.FC = () => {
  return (
    <div className="justify-between items-center flex h-16 min-w-screen bg-yellow-600 px-4 py-2 ">
      <Image src="/logo.png" alt="Logo" width={250} height={100} />
      <ConnectButton chainStatus={'none'} showBalance={false} />
    </div>
  )
}

export default Header
