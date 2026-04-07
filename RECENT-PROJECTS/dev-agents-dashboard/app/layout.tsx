import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Developer Agent Competitive Analysis | February 2026',
  description: 'Executive dashboard comparing Google Antigravity, Claude Code, GitHub Copilot, OpenAI Codex, and Cursor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
