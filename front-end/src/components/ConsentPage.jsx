import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Stack } from '@mui/material'

export default function ConsentPage() {
  const navigate = useNavigate()
  const email = localStorage.getItem('pendingEmail')
  const loginType = localStorage.getItem('pendingLoginType')

  const handleAgree = async () => {
    try {
      const res = await fetch('/user/confirm-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, loginType }),
      })
      const data = await res.json()
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('email', data.email)
      localStorage.setItem('userName', data.userName)

      // 더 이상 필요 없는 pending 키 삭제
      localStorage.removeItem('pendingEmail')
      localStorage.removeItem('pendingLoginType')

      navigate('/home')
    } catch (err) {
      console.error(err)
      alert('전환에 실패했습니다.')
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      px={2}
    >
      <Stack spacing={2} textAlign="center">
        <Typography variant="h6">
          <strong>{email}</strong> 은 이미 가입된 이메일입니다.
        </Typography>
        <Typography>
          {loginType === 'KAKAO' ? '카카오' : '구글'} 계정으로 전환하시겠습니까?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAgree}
        >
          네, 전환하겠습니다
        </Button>
      </Stack>
    </Box>
  )
}