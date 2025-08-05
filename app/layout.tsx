import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zen World App',
  description: 'A peaceful digital experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
