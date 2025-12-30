'use client'

import { Stack } from '@mui/material'
import StoryItem from './StoryItem'
import SkeletonStoryItem from './SkeletonStoryItem'

interface Story {
  objectID: string
  title: string
  url: string
  author: string
  points: number
  created_at: string
  num_comments: number
}

interface StoryListProps {
  stories: Story[]
  loading: boolean
  focusedIndex?: number
  onToggleComments?: (objectID: string) => void
}

export default function StoryList({
  stories,
  loading,
  focusedIndex = -1,
  onToggleComments,
}: StoryListProps) {
  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonStoryItem key={index} />
        ))}
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      {stories.map((story, index) => (
        <StoryItem
          key={story.objectID}
          story={story}
          isFocused={index === focusedIndex}
          onToggleComments={onToggleComments ? () => onToggleComments(story.objectID) : undefined}
        />
      ))}
    </Stack>
  )
}