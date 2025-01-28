import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function Navbar({ onMenuClick, onAddByCoordsClick }) {
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
          Камеры наблюдения ТСО
        </Typography>
        <Button
          onClick={onAddByCoordsClick}
          variant="contained" // Делает кнопку с заливкой
          color="secondary" // Добавляем выделенный цвет
          sx={{ marginLeft: 2 }} // Отступ от текста
        >
          Добавить по координатам
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
