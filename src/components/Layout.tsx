import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Button, Avatar, Stack } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SettingsIcon from '@mui/icons-material/Settings'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/store'

export default function Layout(){
  const [open, setOpen] = React.useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const { signOut, user, brand, logoUrl } = useAuth()

  const links = [
    { to:'/', label:'الرئيسية', icon:<HomeIcon /> },
    { to:'/employees', label:'الموظفون', icon:<PeopleAltIcon /> },
    { to:'/attendance', label:'الحضور والإنصراف', icon:<EventAvailableIcon /> },
    { to:'/expenses', label:'المصروفات', icon:<MoneyIcon /> },
    { to:'/debts', label:'ديون العملاء', icon:<ReceiptLongIcon /> },
    { to:'/reports', label:'التقارير', icon:<AssessmentIcon /> },
    { to:'/settings', label:'الإعدادات', icon:<SettingsIcon /> },
  ]

  return (
    <Box sx={{ display:'flex' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee', bgcolor:'background.paper' }}>
        <Toolbar sx={{ gap: 2, justifyContent:'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={()=>setOpen(true)} sx={{ display:{ xs:'inline-flex', md:'none' }}}><MenuIcon/></IconButton>
            <Avatar src={logoUrl} alt={brand} sx={{ width: 36, height: 36 }} />
            <Typography variant="h6">{brand}</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography color="text.secondary" sx={{ display:{ xs:'none', sm:'block' } }}>{user?.email}</Typography>
            <Button variant="outlined" color="error" size="small" onClick={signOut}>خروج</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={()=>setOpen(false)} sx={{ '& .MuiDrawer-paper':{ width: 260 }}}>
        <Box role="presentation" sx={{ mt:1 }}>
          <List>
            {links.map(l=>(
              <ListItemButton key={l.to} selected={loc.pathname===l.to} onClick={()=>{nav(l.to); setOpen(false)}}>
                <ListItemIcon>{l.icon}</ListItemIcon>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="nav" sx={{ width: 260, flexShrink: 0, display:{ xs:'none', md:'block' } }}>
        <Box sx={{ position:'fixed', top:64, bottom:0, width:260, borderInlineEnd: '1px solid #eee', bgcolor:'background.paper' }}>
          <List>
            {links.map(l=>(
              <ListItemButton key={l.to} selected={loc.pathname===l.to} onClick={()=>nav(l.to)}>
                <ListItemIcon>{l.icon}</ListItemIcon>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      <Box component="main" sx={{ flexGrow:1, p:2, mt:8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
