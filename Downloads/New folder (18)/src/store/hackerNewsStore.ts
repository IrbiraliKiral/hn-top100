import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Story {
  objectID: string
  title: string
  url: string
  author: string
  points: number
  created_at: string
  num_comments: number
}

interface Comment {
  id: number
  author: string
  text: string
  created_at: string
  children?: Comment[]
}

type RefreshInterval = 0 | 60000 | 300000 | 600000
type SortOption = 'default' | 'points' | 'comments' | 'date'

interface ReadingStats {
  totalRead: number
  totalBookmarked: number
  readByDate: Record<string, number> // date string -> count
}

interface HackerNewsState {
  // Stories
  stories: Story[]
  loading: boolean
  error: string | null
  searchQuery: string
  sortBy: SortOption

  // UI Preferences
  darkMode: boolean
  refreshInterval: RefreshInterval

  // User Data
  bookmarks: string[]
  readHistory: string[]
  readTimestamps: Record<string, string> // objectID -> ISO date string

  // Comments cache
  commentsCache: Record<string, Comment[]>
  loadingComments: Record<string, boolean>

  // Actions - Stories
  setSearchQuery: (query: string) => void
  setSortBy: (sort: SortOption) => void
  fetchTopStories: () => Promise<void>

  // Actions - UI
  toggleDarkMode: () => void
  setRefreshInterval: (interval: RefreshInterval) => void

  // Actions - User Data
  toggleBookmark: (objectID: string) => void
  markAsRead: (objectID: string) => void
  isBookmarked: (objectID: string) => boolean
  isRead: (objectID: string) => boolean
  clearHistory: () => void
  clearBookmarks: () => void

  // Actions - Export
  exportData: () => string

  // Actions - Statistics
  getStats: () => ReadingStats

  // Actions - Comments
  fetchComments: (objectID: string) => Promise<void>
}

const useHackerNewsStore = create<HackerNewsState>()(
  persist(
    (set, get) => ({
      // Initial state
      stories: [],
      loading: false,
      error: null,
      searchQuery: '',
      sortBy: 'default',
      darkMode: true,
      refreshInterval: 0,
      bookmarks: [],
      readHistory: [],
      readTimestamps: {},
      commentsCache: {},
      loadingComments: {},

      // Story actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => set({ sortBy: sort }),

      fetchTopStories: async () => {
        set({ loading: true, error: null })
        try {
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          const timestamp = Math.floor(yesterday.getTime() / 1000)

          const response = await fetch(
            `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${timestamp}&hitsPerPage=100`
          )

          if (!response.ok) {
            throw new Error('Failed to fetch stories')
          }

          const data = await response.json()
          set({ stories: data.hits, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false
          })
        }
      },

      // UI actions
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),

      // User data actions
      toggleBookmark: (objectID) => set((state) => ({
        bookmarks: state.bookmarks.includes(objectID)
          ? state.bookmarks.filter((id) => id !== objectID)
          : [...state.bookmarks, objectID]
      })),

      markAsRead: (objectID) => set((state) => {
        if (state.readHistory.includes(objectID)) {
          return state
        }
        const today = new Date().toISOString().split('T')[0]
        return {
          readHistory: [...state.readHistory, objectID],
          readTimestamps: { ...state.readTimestamps, [objectID]: today }
        }
      }),

      isBookmarked: (objectID) => get().bookmarks.includes(objectID),
      isRead: (objectID) => get().readHistory.includes(objectID),

      clearHistory: () => set({ readHistory: [], readTimestamps: {} }),
      clearBookmarks: () => set({ bookmarks: [] }),

      // Export data
      exportData: () => {
        const { bookmarks, readHistory, readTimestamps, stories } = get()
        const bookmarkedStories = stories.filter(s => bookmarks.includes(s.objectID))
        const readStories = stories.filter(s => readHistory.includes(s.objectID))

        const exportObj = {
          exportedAt: new Date().toISOString(),
          bookmarks: bookmarkedStories.map(s => ({
            id: s.objectID,
            title: s.title,
            url: s.url,
            author: s.author,
            points: s.points,
          })),
          history: readStories.map(s => ({
            id: s.objectID,
            title: s.title,
            url: s.url,
            readAt: readTimestamps[s.objectID] || 'unknown',
          })),
          stats: get().getStats(),
        }
        return JSON.stringify(exportObj, null, 2)
      },

      // Statistics
      getStats: () => {
        const { readHistory, bookmarks, readTimestamps } = get()

        const readByDate: Record<string, number> = {}
        Object.values(readTimestamps).forEach(date => {
          readByDate[date] = (readByDate[date] || 0) + 1
        })

        return {
          totalRead: readHistory.length,
          totalBookmarked: bookmarks.length,
          readByDate,
        }
      },

      // Comments actions
      fetchComments: async (objectID) => {
        const { commentsCache, loadingComments } = get()

        if (commentsCache[objectID] || loadingComments[objectID]) {
          return
        }

        set({ loadingComments: { ...loadingComments, [objectID]: true } })

        try {
          const response = await fetch(
            `https://hn.algolia.com/api/v1/items/${objectID}`
          )

          if (!response.ok) {
            throw new Error('Failed to fetch comments')
          }

          const data = await response.json()
          const comments = (data.children || []).slice(0, 3).map((child: any) => ({
            id: child.id,
            author: child.author,
            text: child.text,
            created_at: child.created_at,
          }))

          set((state) => ({
            commentsCache: { ...state.commentsCache, [objectID]: comments },
            loadingComments: { ...state.loadingComments, [objectID]: false }
          }))
        } catch (error) {
          set((state) => ({
            loadingComments: { ...state.loadingComments, [objectID]: false }
          }))
        }
      },
    }),
    {
      name: 'hacker-news-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        refreshInterval: state.refreshInterval,
        bookmarks: state.bookmarks,
        readHistory: state.readHistory,
        readTimestamps: state.readTimestamps,
        sortBy: state.sortBy,
      }),
    }
  )
)

export default useHackerNewsStore
export type { Story, Comment, RefreshInterval, SortOption, ReadingStats }