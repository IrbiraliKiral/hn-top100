'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Stack,
  InputAdornment,
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import HistoryIcon from '@mui/icons-material/History'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import BarChartIcon from '@mui/icons-material/BarChart'
import StoryList from '@/components/StoryList'
import DarkModeToggle from '@/components/DarkModeToggle'
import RefreshControl from '@/components/RefreshControl'
import SortControl from '@/components/SortControl'
import ExportMenu from '@/components/ExportMenu'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import ShortcutsHelp from '@/components/ShortcutsHelp'
import StatsDialog from '@/components/StatsDialog'
import useHackerNewsStore from '@/store/hackerNewsStore'

type FilterTab = 'all' | 'bookmarks' | 'history'

export default function Home() {
  const {
    stories,
    loading,
    error,
    fetchTopStories,
    searchQuery,
    setSearchQuery,
    refreshInterval,
    bookmarks,
    readHistory,
    toggleBookmark,
    markAsRead,
    sortBy,
  } = useHackerNewsStore()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [showHelp, setShowHelp] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMounted(true)
    fetchTopStories()
  }, [fetchTopStories])

  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => fetchTopStories(), refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [refreshInterval, fetchTopStories])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [activeTab])

  const filteredStories = useMemo(() => {
    let filtered = stories

    // Filter by tab
    if (activeTab === 'bookmarks') {
      filtered = stories.filter((story) => bookmarks.includes(story.objectID))
    } else if (activeTab === 'history') {
      filtered = stories.filter((story) => readHistory.includes(story.objectID))
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((story) =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort stories
    const sorted = [...filtered]
    switch (sortBy) {
      case 'points':
        sorted.sort((a, b) => b.points - a.points)
        break
      case 'comments':
        sorted.sort((a, b) => b.num_comments - a.num_comments)
        break
      case 'date':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default:
        // Keep original order
        break
    }

    return sorted
  }, [stories, activeTab, bookmarks, readHistory, searchQuery, sortBy])

  const handleOpenStory = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredStories.length) {
      const story = filteredStories[focusedIndex]
      if (story.url) {
        markAsRead(story.objectID)
        window.open(story.url, '_blank', 'noopener,noreferrer')
      }
    }
  }, [focusedIndex, filteredStories, markAsRead])

  const handleToggleBookmark = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredStories.length) {
      toggleBookmark(filteredStories[focusedIndex].objectID)
    }
  }, [focusedIndex, filteredStories, toggleBookmark])

  const handleToggleComments = useCallback((objectID?: string) => {
    const id = objectID || (focusedIndex >= 0 ? filteredStories[focusedIndex]?.objectID : null)
    if (id) {
      setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }, [focusedIndex, filteredStories])

  if (!mounted) return null

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <KeyboardShortcuts
        storiesCount={filteredStories.length}
        focusedIndex={focusedIndex}
        onFocusChange={setFocusedIndex}
        onOpenStory={handleOpenStory}
        onToggleBookmark={handleToggleBookmark}
        onToggleComments={() => handleToggleComments()}
        onShowHelp={() => setShowHelp(true)}
      />
      <ShortcutsHelp open={showHelp} onClose={() => setShowHelp(false)} />
      <StatsDialog open={showStats} onClose={() => setShowStats(false)} />

      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            HN Top 100
          </Typography>

          <Box sx={{ flex: 1, maxWidth: 360 }}>
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Stack direction="row" spacing={0.5}>
            <SortControl />
            <Tooltip title="Statistics">
              <IconButton onClick={() => setShowStats(true)} size="small">
                <BarChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Keyboard shortcuts">
              <IconButton onClick={() => setShowHelp(true)} size="small">
                <KeyboardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ExportMenu />
            <RefreshControl />
            <DarkModeToggle />
          </Stack>
        </Toolbar>

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ px: 2 }}
        >
          <Tab
            value="all"
            icon={<AllInboxIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={<Stack direction="row" spacing={1} alignItems="center"><span>All</span><Chip label={stories.length} size="small" /></Stack>}
          />
          <Tab
            value="bookmarks"
            icon={<BookmarkIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={<Stack direction="row" spacing={1} alignItems="center"><span>Saved</span>{bookmarks.length > 0 && <Chip label={bookmarks.length} size="small" />}</Stack>}
          />
          <Tab
            value="history"
            icon={<HistoryIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={<Stack direction="row" spacing={1} alignItems="center"><span>History</span>{readHistory.length > 0 && <Chip label={readHistory.length} size="small" />}</Stack>}
          />
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2}>
          {error && (
            <Typography color="error">{error}</Typography>
          )}

          {activeTab !== 'all' && filteredStories.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography variant="h6" gutterBottom>
                {activeTab === 'bookmarks' ? 'No saved stories' : 'No history'}
              </Typography>
              <Typography variant="body2">
                {activeTab === 'bookmarks'
                  ? 'Bookmark stories to save them here'
                  : 'Read stories will appear here'}
              </Typography>
            </Box>
          )}

          <StoryList
            stories={filteredStories}
            loading={loading}
            focusedIndex={focusedIndex}
            onToggleComments={handleToggleComments}
          />
        </Stack>
      </Container>
    </Box>
  )
}