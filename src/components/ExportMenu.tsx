'use client'

import { useState } from 'react'
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Snackbar,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'
import useHackerNewsStore from '@/store/hackerNewsStore'

export default function ExportMenu() {
    const exportData = useHackerNewsStore((state) => state.exportData)
    const clearHistory = useHackerNewsStore((state) => state.clearHistory)
    const clearBookmarks = useHackerNewsStore((state) => state.clearBookmarks)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [snackbar, setSnackbar] = useState<string | null>(null)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleExport = () => {
        const data = exportData()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hn-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setSnackbar('Data exported successfully')
        handleClose()
    }

    const handleClearHistory = () => {
        if (confirm('Clear all reading history?')) {
            clearHistory()
            setSnackbar('History cleared')
        }
        handleClose()
    }

    const handleClearBookmarks = () => {
        if (confirm('Clear all bookmarks?')) {
            clearBookmarks()
            setSnackbar('Bookmarks cleared')
        }
        handleClose()
    }

    return (
        <>
            <Tooltip title="More options">
                <IconButton onClick={handleClick} size="small">
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleExport}>
                    <ListItemIcon>
                        <FileDownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Data</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleClearHistory}>
                    <ListItemIcon>
                        <DeleteOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Clear History</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleClearBookmarks}>
                    <ListItemIcon>
                        <BookmarkRemoveIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Clear Bookmarks</ListItemText>
                </MenuItem>
            </Menu>
            <Snackbar
                open={Boolean(snackbar)}
                autoHideDuration={2000}
                onClose={() => setSnackbar(null)}
                message={snackbar}
            />
        </>
    )
}
