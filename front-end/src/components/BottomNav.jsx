import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ReceiptIcon from '@mui/icons-material/Receipt'
import BookIcon from '@mui/icons-material/Book'
import PersonIcon from '@mui/icons-material/Person'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [value, setValue] = useState(location.pathname)

  useEffect(() => {
    setValue(location.pathname)
  }, [location.pathname])

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderTop: '1px solid #eee',
        bgcolor: '#fafafa',
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue)
          navigate(newValue)
        }}
        sx={{
          '& .Mui-selected': {
            color: '#1976d2',
          },
        }}
      >
        <BottomNavigationAction
          label="홈"
          value="/home"
          icon={<HomeIcon />}
          sx={{ minWidth: 60 }}
        />
        <BottomNavigationAction
          label="영수증"
          value="/home/receipt"
          icon={<ReceiptIcon />}
          sx={{ minWidth: 60 }}
        />
        <BottomNavigationAction
          label="가계부"
          value="/ledger"
          icon={<BookIcon />}
          sx={{ minWidth: 60 }}
        />
        <BottomNavigationAction
          label="내 정보"
          value="/mypage"
          icon={<PersonIcon />}
          sx={{ minWidth: 60 }}
        />
      </BottomNavigation>
    </Paper>
  )
}
