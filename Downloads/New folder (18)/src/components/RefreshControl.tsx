'use client'

import { useState } from 'react'
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Badge,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckIcon from '@mui/icons-material/Check'
import useHackerNewsStore, { RefreshInterval } from '@/store/hackerNewsStore'

const refreshOptions: { label: string; value: RefreshInterval }[] = [
    { label: 'Off', value: 0 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
    { label: '10 minutes', value: 600000 },
]

export default function RefreshControl() {
    const refreshInterval = useHackerNewsStore((state) => state.refreshInterval)
    const setRefreshInterval = useHackerNewsStore((state) => state.setRefreshInterval)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleSelect = (value: RefreshInterval) => {
        setRefreshInterval(value)
        handleClose()
    }

    const isActive = refreshInterval > 0

    return (
        <>
            <Tooltip title="Auto-refresh settings">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        color: 'white',
                        animation: isActive ? 'spin 2s linear infinite' : 'none',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                        },
                    }}
                >
                    <Badge
                        color="secondary"
                        variant="dot"
                        invisible={!isActive}
                    >
                        <RefreshIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {refreshOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        selected={refreshInterval === option.value}
                    >
                        <ListItemIcon>
                            {refreshInterval === option.value && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
