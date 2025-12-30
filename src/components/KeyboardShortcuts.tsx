'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcutsProps {
    storiesCount: number
    focusedIndex: number
    onFocusChange: (index: number) => void
    onOpenStory: () => void
    onToggleBookmark: () => void
    onToggleComments: () => void
    onShowHelp: () => void
}

export default function KeyboardShortcuts({
    storiesCount,
    focusedIndex,
    onFocusChange,
    onOpenStory,
    onToggleBookmark,
    onToggleComments,
    onShowHelp,
}: KeyboardShortcutsProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return
            }

            switch (e.key.toLowerCase()) {
                case 'j':
                    e.preventDefault()
                    onFocusChange(Math.min(focusedIndex + 1, storiesCount - 1))
                    break
                case 'k':
                    e.preventDefault()
                    onFocusChange(Math.max(focusedIndex - 1, 0))
                    break
                case 'o':
                case 'enter':
                    if (focusedIndex >= 0) {
                        e.preventDefault()
                        onOpenStory()
                    }
                    break
                case 'b':
                    if (focusedIndex >= 0) {
                        e.preventDefault()
                        onToggleBookmark()
                    }
                    break
                case 'c':
                    if (focusedIndex >= 0) {
                        e.preventDefault()
                        onToggleComments()
                    }
                    break
                case '?':
                    e.preventDefault()
                    onShowHelp()
                    break
                case 'escape':
                    e.preventDefault()
                    onFocusChange(-1)
                    break
            }
        },
        [
            storiesCount,
            focusedIndex,
            onFocusChange,
            onOpenStory,
            onToggleBookmark,
            onToggleComments,
            onShowHelp,
        ]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    return null // This component doesn't render anything
}
