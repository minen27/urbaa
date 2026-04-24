'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,       // 30 seconds
            gcTime: 1000 * 60 * 10,     // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                borderRadius: '0.875rem',
                fontSize: '0.875rem',
              },
            }}
          />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  )
}
