'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, Typography, Stack, Chip, Button, Box, Avatar } from '@mui/material'
import CommentIcon from '@mui/icons-material/Comment'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { formatDistanceToNow } from '@/utils/dateUtils'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'
import CommentPreview from './CommentPreview'
import useHackerNewsStore from '@/store/hackerNewsStore'

interface Story {
  objectID: string
  title: string
  url: string
  author: string
  points: number
  created_at: string
  num_comments: number
}

interface StoryItemProps {
  story: Story
  isFocused?: boolean
  onToggleComments?: () => void
}

function getFaviconUrl(url: string): string | null {
  if (!url) return null
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

export default function StoryItem({ story, isFocused = false, onToggleComments }: StoryItemProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const timeAgo = formatDistanceToNow(story.created_at)
  const readHistory = useHackerNewsStore((state) => state.readHistory)
  const markAsRead = useHackerNewsStore((state) => state.markAsRead)

  const isRead = readHistory.includes(story.objectID)
  const faviconUrl = getFaviconUrl(story.url)

  const handleReadMore = () => {
    markAsRead(story.objectID)
  }

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isFocused])

  return (
    <Card
      ref={cardRef}
      elevation={0}
      sx={{
        position: 'relative',
        opacity: isRead ? 0.6 : 1,
        border: '1px solid',
        borderColor: isFocused ? 'primary.main' : 'divider',
      }}
    >
      {isRead && (
        <CheckCircleIcon
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'success.main',
            fontSize: 20,
          }}
        />
      )}
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {faviconUrl && (
              <Avatar
                src={faviconUrl}
                variant="rounded"
                sx={{ width: 28, height: 28, bgcolor: 'background.default' }}
              />
            )}
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' }, flex: 1, pr: isRead ? 4 : 0 }}
            >
              {story.title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<ArrowUpwardIcon sx={{ fontSize: 14 }} />}
              label={`${story.points}`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<CommentIcon sx={{ fontSize: 14 }} />}
              label={`${story.num_comments}`}
              size="small"
              variant="outlined"
              onClick={onToggleComments}
              sx={{ cursor: onToggleComments ? 'pointer' : 'default' }}
            />
            <Typography variant="body2" color="text.secondary">
              by {story.author} • {timeAgo}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <ShareButton title={story.title} url={story.url || `https://news.ycombinator.com/item?id=${story.objectID}`} />
            <BookmarkButton objectID={story.objectID} />
          </Stack>

          <CommentPreview objectID={story.objectID} commentCount={story.num_comments} />

          {story.url && (
            <Button
              variant="contained"
              size="small"
              endIcon={<OpenInNewIcon />}
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReadMore}
              sx={{ width: 'fit-content' }}
            >
              Read More
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}