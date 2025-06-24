import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, CircularProgress } from '@mui/material'

export default function KakaoCallback() {
  const navigate = useNavigate()
  const isCalled = useRef(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    if (!code) {
      navigate('/')
      return
    }

    if (isCalled.current) {
      return
    }
    isCalled.current = true

    url.searchParams.delete('code')
    window.history.replaceState({}, '', url.toString())

    axios
      .get('/user/oauth/kakao', { params: { code } })
      .then((res) => {
        const { userId, accessToken, email, userName, requiresConsent } = res.data

        if (requiresConsent) {
          localStorage.setItem('pendingEmail', email)
          localStorage.setItem('pendingUserName', userName)
          localStorage.setItem('pendingLoginType', 'KAKAO')
          navigate('/consent')
          return
        }

        localStorage.setItem('userId', userId)
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('email', email)
        localStorage.setItem('userName', userName)
        navigate('/home')
      })
      .catch((err) => {
        console.error('카카오 로그인 실패:', err)
        alert('카카오 로그인 실패')
        navigate('/')
      })
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
        카카오 로그인 처리 중...
      </Typography>
    </Box>
  )
}