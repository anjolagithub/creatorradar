import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CreatorRadar — AI Intelligence for Bags Tokens',
  description: 'Track, score, and copy-trade the best creator tokens on Bags.fm. Powered by AI momentum scoring.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </body>
    </html>
  )
}
