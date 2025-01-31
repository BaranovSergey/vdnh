import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function Navbar({ onMenuClick, onAddByCoordsClick, cameraCount }) {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textAlign: 'center' }}
        >
          Камеры наблюдения ТСО {cameraCount}
        </Typography>
        <Button
          onClick={onAddByCoordsClick}
          variant="contained"
          color="success" // Изменяем цвет на зеленый
        >
          Добавить по координатам
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
