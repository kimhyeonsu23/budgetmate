import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import axios from 'axios'

export default function FindPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFindPassword = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await axios.post('/user/send-reset-code', { email: email.trim() })

      if (res.data.success) {
        setMessage(res.data.message)
        
        setTimeout(() => {
          navigate(`/verify-reset-code?email=${encodeURIComponent(email.trim())}`)
        }, 1000)
      } else {
        setError(res.data.message || '인증 코드 발송에 실패했습니다.')
      }
    } catch (err) {
      console.error('send-reset-code API 오류:', err)
      setError(err.response?.data?.message || '인증 코드 발송 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component="main"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        minHeight: '100vh',
        pt: 4,
        pb: 10,
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" gutterBottom color="primary" sx={{ textAlign: 'center' }}>
        비밀번호 찾기
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        가입된 이메일을 입력하시면 인증 코드를 이메일로 보내드립니다.
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 360, md: 600, lg: 800 },
          mx: 'auto',
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="이메일"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && !message}
            helperText={error && !message ? error : ''}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFindPassword}
            disabled={loading}
            fullWidth
          >
            {loading ? '요청 중...' : '인증 코드 받기'}
          </Button>

          {/* 성공 시, 인증 코드가 발송되었다는 메시지 표시 */}
          {message && <Alert severity="success">{message}</Alert>}

          <Button
            variant="text"
            onClick={() => navigate('/')}
            color="secondary"
            sx={{ mt: 2 }}
          >
            로그인 화면으로 돌아가기
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
