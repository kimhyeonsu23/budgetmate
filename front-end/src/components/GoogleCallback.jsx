import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, CircularProgress } from '@mui/material'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const isCalled = useRef(false)

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code')

    if (code && !isCalled.current) {
      isCalled.current = true

      axios
        .get('/user/oauth/google', { params: { code } })
        .then((res) => {
          const data = res.data
          const { userId, accessToken, email, userName, requiresConsent } = data

          if (requiresConsent) {
            localStorage.setItem('pendingEmail', email)
            localStorage.setItem('pendingUserName', userName)
            localStorage.setItem('pendingLoginType', 'GOOGLE')
            navigate('/consent')
            return
          }

          localStorage.setItem('userId',     userId)
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('email',       email)
          localStorage.setItem('userName',    userName)

          window.history.replaceState({}, '', window.location.pathname)
          navigate('/home')
        })
        .catch((err) => {
          console.error('구글 로그인 실패:', err)
          alert('구글 로그인 실패')
          navigate('/')
        })
    }
  }, [navigate])

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      px={2}
      textAlign="center"
    >
      <CircularProgress />
      <Typography variant="h6" mt={2} color="textSecondary">
        구글 로그인 처리 중...
      </Typography>
    </Box>
  )
}
