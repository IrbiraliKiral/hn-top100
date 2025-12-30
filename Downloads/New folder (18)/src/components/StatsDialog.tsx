'use client'

import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Stack,
    Box,
    Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BarChartIcon from '@mui/icons-material/BarChart'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import TodayIcon from '@mui/icons-material/Today'
import useHackerNewsStore from '@/store/hackerNewsStore'

interface StatsDialogProps {
    open: boolean
    onClose: () => void
}

export default function StatsDialog({ open, onClose }: StatsDialogProps) {
    const getStats = useHackerNewsStore((state) => state.getStats)
    const stats = getStats()

    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
    }).reverse()

    const maxReads = Math.max(...last7Days.map(d => stats.readByDate[d] || 0), 1)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BarChartIcon />
                        <Typography variant="h6" fontWeight={600}>
                            Reading Stats
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    {/* Summary cards */}
                    <Stack direction="row" spacing={2}>
                        <Box
                            sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                textAlign: 'center',
                            }}
                        >
                            <MenuBookIcon sx={{ fontSize: 28, mb: 1, opacity: 0.7 }} />
                            <Typography variant="h4" fontWeight={700}>
                                {stats.totalRead}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Articles Read
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                textAlign: 'center',
                            }}
                        >
                            <BookmarkIcon sx={{ fontSize: 28, mb: 1, opacity: 0.7 }} />
                            <Typography variant="h4" fontWeight={700}>
                                {stats.totalBookmarked}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Bookmarks
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    {/* Weekly chart */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <TodayIcon fontSize="small" />
                            <Typography variant="subtitle2" fontWeight={600}>
                                Last 7 Days
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 80 }}>
                            {last7Days.map((date) => {
                                const count = stats.readByDate[date] || 0
                                const height = maxReads > 0 ? (count / maxReads) * 100 : 0
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })

                                return (
                                    <Stack key={date} alignItems="center" sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ mb: 0.5 }}>
                                            {count}
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: `${Math.max(height, 4)}%`,
                                                bgcolor: count > 0 ? 'primary.main' : 'action.disabled',
                                                borderRadius: 1,
                                                minHeight: 4,
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {dayName}
                                        </Typography>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    </Box>

                    {stats.totalRead === 0 && (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Start reading to see your stats here!
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    )
}
