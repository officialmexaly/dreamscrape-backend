'use client'

import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import theme from '@/src/admin/theme'
import { AuthProvider } from './AuthProvider'
import { BlogPostsProvider } from './BlogPostsProvider'
import { EventsProvider } from './EventsProvider'
import { ServicesProvider } from './ServicesProvider'
import { InquiriesProvider } from './InquiriesProvider'
import { MediaProvider } from './MediaProvider'
import { SiteContentProvider } from './SiteContentProvider'
import { SettingsProvider } from './SettingsProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <BlogPostsProvider>
            <EventsProvider>
              <ServicesProvider>
                <InquiriesProvider>
                  <MediaProvider>
                    <SiteContentProvider>
                      <SettingsProvider>{children}</SettingsProvider>
                    </SiteContentProvider>
                  </MediaProvider>
                </InquiriesProvider>
              </ServicesProvider>
            </EventsProvider>
          </BlogPostsProvider>
        </AuthProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}
