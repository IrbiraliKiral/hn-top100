'use client'

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Typography,
    Chip,
    Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardIcon from '@mui/icons-material/Keyboard'

interface ShortcutsHelpProps {
    open: boolean
    onClose: () => void
}

const shortcuts = [
    { key: 'J', description: 'Next story' },
    { key: 'K', description: 'Previous story' },
    { key: 'O', description: 'Open story in new tab' },
    { key: 'B', description: 'Toggle bookmark' },
    { key: 'Enter', description: 'Open story in new tab' },
    { key: 'C', description: 'Toggle comments' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close dialogs / Clear focus' },
]

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <KeyboardIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Keyboard Shortcuts
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Table size="small">
                    <TableBody>
                        {shortcuts.map((shortcut) => (
                            <TableRow key={shortcut.key}>
                                <TableCell sx={{ border: 0, pl: 0, width: 80 }}>
                                    <Chip
                                        label={shortcut.key}
                                        size="small"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontWeight: 600,
                                            minWidth: 50,
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ border: 0 }}>
                                    <Typography variant="body2">{shortcut.description}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}
