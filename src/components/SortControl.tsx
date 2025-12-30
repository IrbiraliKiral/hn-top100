'use client'

import { useState } from 'react'
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material'
import SortIcon from '@mui/icons-material/Sort'
import CheckIcon from '@mui/icons-material/Check'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CommentIcon from '@mui/icons-material/Comment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import useHackerNewsStore, { SortOption } from '@/store/hackerNewsStore'

const sortOptions: { label: string; value: SortOption; icon: React.ReactNode }[] = [
    { label: 'Default', value: 'default', icon: <SwapVertIcon fontSize="small" /> },
    { label: 'Most Points', value: 'points', icon: <TrendingUpIcon fontSize="small" /> },
    { label: 'Most Comments', value: 'comments', icon: <CommentIcon fontSize="small" /> },
    { label: 'Newest First', value: 'date', icon: <AccessTimeIcon fontSize="small" /> },
]

export default function SortControl() {
    const sortBy = useHackerNewsStore((state) => state.sortBy)
    const setSortBy = useHackerNewsStore((state) => state.setSortBy)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleSelect = (value: SortOption) => {
        setSortBy(value)
        handleClose()
    }

    const currentOption = sortOptions.find(o => o.value === sortBy)

    return (
        <>
            <Tooltip title={`Sort: ${currentOption?.label}`}>
                <IconButton onClick={handleClick} size="small">
                    <SortIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {sortOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        selected={sortBy === option.value}
                    >
                        <ListItemIcon>{option.icon}</ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                        {sortBy === option.value && (
                            <CheckIcon fontSize="small" sx={{ ml: 1 }} />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
