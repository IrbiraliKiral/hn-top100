'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { lightTheme, darkTheme } from '@/theme/theme'
import useHackerNewsStore from '@/store/hackerNewsStore'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const darkMode = useHackerNewsStore((state) => state.darkMode)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch by waiting for client mount
    if (!mounted) {
        return (
            <AppRouterCacheProvider>
                <ThemeProvider theme={lightTheme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </AppRouterCacheProvider>
        )
    }

    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
    )
}
