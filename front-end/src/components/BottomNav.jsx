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
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue)
          navigate(newValue)
        }}
        showLabels
      >
        <BottomNavigationAction label="홈" value="/home" icon={<HomeIcon />} />
        <BottomNavigationAction label="영수증" value="/home/receipt" icon={<ReceiptIcon />} />
        <BottomNavigationAction label="가계부" value="/ledger" icon={<BookIcon />} />
        <BottomNavigationAction label="내 정보" value="/mypage" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
