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
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import XIcon from '@mui/icons-material/X'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import RedditIcon from '@mui/icons-material/Reddit'

interface ShareButtonProps {
    title: string
    url: string
}

export default function ShareButton({ title, url }: ShareButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)

    const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        e.preventDefault()

        // Try native Web Share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({ title, url })
                return
            } catch {
                // User cancelled or error, fall through to menu
            }
        }

        setAnchorEl(e.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setSnackbarOpen(true)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = url
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setSnackbarOpen(true)
        }
        handleClose()
    }

    const handleShareTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank', 'noopener,noreferrer')
        handleClose()
    }

    const handleShareLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
        handleClose()
    }

    const handleShareReddit = () => {
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        window.open(redditUrl, '_blank', 'noopener,noreferrer')
        handleClose()
    }

    return (
        <>
            <Tooltip title="Share">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            color: 'primary.main',
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <ShareIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleCopyLink}>
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy Link</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleShareTwitter}>
                    <ListItemIcon>
                        <XIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share on X</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleShareLinkedIn}>
                    <ListItemIcon>
                        <LinkedInIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share on LinkedIn</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleShareReddit}>
                    <ListItemIcon>
                        <RedditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share on Reddit</ListItemText>
                </MenuItem>
            </Menu>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message="Link copied to clipboard!"
            />
        </>
    )
}
