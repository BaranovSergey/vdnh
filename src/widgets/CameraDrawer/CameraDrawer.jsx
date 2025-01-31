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

function CameraDrawer({
  drawerOpen,
  onCloseDrawer,
  cameraViews,
  highlightedCamera,
  iconColor,
  search,
  setSearch,
  handleDeleteCamera,
  startBlinkingMarker,
  blinkingCamera, // Получаем текущий моргающий маркер
}) {
  // Вычисляем ширину дравера в зависимости от длины самой длинной ссылки
  const drawerWidth = useMemo(() => {
    const longestLink = cameraViews.reduce(
      (max, camera) =>
        camera.rtspUrl.length > max.length ? camera.rtspUrl : max,
      ''
    )
    const approxCharWidth = 8 // Средняя ширина символа (в пикселях)
    const padding = 100 // Дополнительное пространство для отступов
    const calculatedWidth = longestLink.length * approxCharWidth + padding

    return Math.min(Math.max(calculatedWidth, 300), 600) // Ограничиваем от 300px до 600px
  }, [cameraViews])

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={onCloseDrawer}
      PaperProps={{
        sx: {
          width: `${drawerWidth}px`, // Устанавливаем ширину дравера
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
          {cameraViews
            .filter((camera) =>
              camera.rtspUrl.toLowerCase().includes(search.toLowerCase())
            )
            .map((camera, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: 'column', // Вертикальное выравнивание текста
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
                    sx={{
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => startBlinkingMarker(camera)}
                    variant="outlined"
                    sx={{
                      minWidth: 'auto',
                    }}
                  >
                    Обнаружить
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleDeleteCamera(camera)}
                    variant="contained"
                    color="error"
                    sx={{
                      minWidth: 'auto',
                    }}
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

export default CameraDrawer
