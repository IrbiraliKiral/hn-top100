'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    Collapse,
    Typography,
    Stack,
    Skeleton,
    Divider,
    Avatar,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import useHackerNewsStore from '@/store/hackerNewsStore'

interface CommentPreviewProps {
    objectID: string
    commentCount: number
}

function stripHtml(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function CommentPreview({ objectID, commentCount }: CommentPreviewProps) {
    const [expanded, setExpanded] = useState(false)
    const commentsCache = useHackerNewsStore((state) => state.commentsCache)
    const loadingComments = useHackerNewsStore((state) => state.loadingComments)
    const fetchComments = useHackerNewsStore((state) => state.fetchComments)

    const comments = commentsCache[objectID] || []
    const isLoading = loadingComments[objectID] || false

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        if (!expanded && comments.length === 0) {
            fetchComments(objectID)
        }
        setExpanded(!expanded)
    }

    if (commentCount === 0) {
        return null
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Button
                size="small"
                onClick={handleToggle}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
                {expanded ? 'Hide Comments' : `Show ${Math.min(3, commentCount)} Comments`}
            </Button>

            <Collapse in={expanded}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                    {isLoading ? (
                        <Stack spacing={2}>
                            {[1, 2, 3].map((i) => (
                                <Box key={i}>
                                    <Skeleton width="30%" height={20} />
                                    <Skeleton width="100%" height={40} />
                                </Box>
                            ))}
                        </Stack>
                    ) : comments.length > 0 ? (
                        <Stack spacing={2} divider={<Divider />}>
                            {comments.map((comment) => (
                                <Box key={comment.id}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                fontSize: '0.75rem',
                                                bgcolor: 'primary.main',
                                            }}
                                        >
                                            {comment.author?.[0]?.toUpperCase() || '?'}
                                        </Avatar>
                                        <Typography variant="caption" fontWeight={600} color="primary">
                                            {comment.author || 'Anonymous'}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {stripHtml(comment.text)}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No comments available
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Box>
    )
}
