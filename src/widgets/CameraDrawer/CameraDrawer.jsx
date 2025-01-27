import React from 'react'
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
  startBlinkingMarker,
}) {
  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={onCloseDrawer}
      PaperProps={{
        sx: {
          top: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box p={2} width={300} sx={{ overflowY: 'auto', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Список камер
        </Typography>
        <TextField
          placeholder="Поиск по IP"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ marginBottom: 2, width: '100%' }}
        />
        <List>
          {cameraViews
            .filter((camera) =>
              camera.ip.toLowerCase().includes(search.toLowerCase())
            )
            .map((camera, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <VideocamIcon
                  style={{
                    color:
                      highlightedCamera?.ip === camera.ip ? iconColor : 'black',
                    marginRight: 8,
                  }}
                />
                <ListItemText
                  primary={`IP: ${camera.ip}`}
                  secondary={`Координаты: ${camera.start.lat.toFixed(
                    4
                  )}, ${camera.start.lng.toFixed(4)}`}
                />
                <Button
                  size="small"
                  onClick={() => startBlinkingMarker(camera)} // Вызываем подсветку камеры
                  variant="outlined"
                  sx={{
                    minWidth: 'auto',
                  }}
                >
                  Обнаружить
                </Button>
              </ListItem>
            ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default CameraDrawer
