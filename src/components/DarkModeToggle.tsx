'use client'

import { IconButton, Tooltip } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import useHackerNewsStore from '@/store/hackerNewsStore'

export default function DarkModeToggle() {
    const darkMode = useHackerNewsStore((state) => state.darkMode)
    const toggleDarkMode = useHackerNewsStore((state) => state.toggleDarkMode)

    return (
        <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
                onClick={toggleDarkMode}
                sx={{
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'rotate(30deg)',
                    },
                }}
            >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </Tooltip>
    )
}
