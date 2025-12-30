'use client'

import { IconButton, Tooltip } from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import useHackerNewsStore from '@/store/hackerNewsStore'

interface BookmarkButtonProps {
    objectID: string
}

export default function BookmarkButton({ objectID }: BookmarkButtonProps) {
    const bookmarks = useHackerNewsStore((state) => state.bookmarks)
    const toggleBookmark = useHackerNewsStore((state) => state.toggleBookmark)

    const isBookmarked = bookmarks.includes(objectID)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        toggleBookmark(objectID)
    }

    return (
        <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{
                    color: isBookmarked ? 'primary.main' : 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.2)',
                        color: 'primary.main',
                    },
                }}
            >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
        </Tooltip>
    )
}
