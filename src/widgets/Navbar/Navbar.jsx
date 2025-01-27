import React from 'react'
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function Navbar({ onMenuClick }) {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textAlign: 'center' }}
        >
          Камеры наблюдения ТСО
        </Typography>
        <IconButton color="inherit" edge="start" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
