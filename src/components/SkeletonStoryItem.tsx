import { Card, CardContent, Skeleton, Stack, Box, alpha } from '@mui/material'

export default function SkeletonStoryItem() {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2}>
          {/* Header skeleton */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton
              variant="rounded"
              width={40}
              height={40}
              sx={{ borderRadius: 2 }}
            />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width={150} height={14} />
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Stack>
          </Stack>

          {/* Title skeleton */}
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="90%" height={28} />
            <Skeleton variant="text" width="70%" height={28} />
          </Stack>

          {/* Stats skeleton */}
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: 2.5 }} />
            <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 2.5 }} />
          </Stack>

          {/* Button skeleton */}
          <Skeleton variant="rounded" width={140} height={44} sx={{ borderRadius: 3 }} />
        </Stack>
      </CardContent>
    </Card>
  )
}