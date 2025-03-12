import React, { useMemo } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'

const CameraDrawer = ({
  drawerOpen,
  onCloseDrawer,
  cameraViews = [],
  search,
  setSearch,
  handleDeleteCamera,
  startBlinkingMarker,
}) => {
  // Фильтрация по подстроке (без учёта регистра)
  const filteredCameras = useMemo(() => {
    return cameraViews.filter((camera) =>
      (camera.rtspUrl || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [cameraViews, search])

  // Вычисляем ширину дравера исходя из длины самого длинного URL
  const drawerWidth = useMemo(() => {
    if (cameraViews.length === 0) return 300
    const longestUrl = cameraViews.reduce(
      (longest, camera) =>
        (camera.rtspUrl?.length || 0) > longest.length
          ? camera.rtspUrl
          : longest,
      ''
    )
    return Math.min(Math.max(longestUrl.length * 8 + 100, 300), 600)
  }, [cameraViews])

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={onCloseDrawer}
      PaperProps={{
        sx: {
          width: `${drawerWidth}px`,
          top: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box p={2} sx={{ overflowY: 'auto', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Список камер
        </Typography>
        <TextField
          placeholder="Поиск по URL"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ marginBottom: 2, width: '100%' }}
        />
        <List>
          {filteredCameras.map((camera, index) => (
            <ListItem
              key={camera.id || index}
              disablePadding
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1,
                padding: '8px 0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideocamIcon style={{ color: 'black' }} />
                <ListItemText
                  primary={`URL: ${camera.rtspUrl}`}
                  secondary={`Координаты: ${camera.start.lat.toFixed(
                    4
                  )}, ${camera.start.lng.toFixed(4)}`}
                  sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => startBlinkingMarker(camera)}
                  variant="outlined"
                  sx={{ minWidth: 'auto' }}
                >
                  Обнаружить
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDeleteCamera(camera)}
                  variant="contained"
                  color="error"
                  sx={{ minWidth: 'auto' }}
                >
                  Удалить
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default React.memo(CameraDrawer)
