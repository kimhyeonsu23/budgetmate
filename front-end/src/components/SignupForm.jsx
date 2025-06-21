import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material'
import icon from '../assets/icon.png'

export default function SignupForm() {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
    }
    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  const handleSendCode = async () => {
    if (!email) return setError('이메일을 입력해주세요.')
    try {
      const res = await fetch('/user/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setError('')
        setTimeLeft(300)
        setTimerActive(true)
      } else {
        setError(result.message || '이메일 전송 실패')
      }
    } catch {
      setError('서버 오류 발생')
    }
  }

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('/user/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: authCode }),
      })
      const result = await res.json()
      if (result.verified) {
        setIsEmailVerified(true)
        setError('')
        setTimerActive(false)
      } else {
        setError(result.message || '인증코드가 일치하지 않습니다.')
      }
    } catch {
      setError('네트워크 오류 발생')
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!userName || !email || !password || !confirmPassword) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      const res = await fetch('/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        localStorage.setItem('accessToken', result.token)
        localStorage.setItem('email', result.user.email)
        localStorage.setItem('userName', result.user.userName)
        navigate('/home')
      } else {
        setError(result.message || '회원가입 실패')
      }
    } catch {
      setError('네트워크 오류 발생')
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSignup}
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="background.default"
      minHeight="100vh"
      px={2}
      py={4}
    >
      <Box component="img" src={icon} alt="아이콘" width={120} mb={2} />
      <Typography variant="h4" gutterBottom>
        회원가입
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          label="이름"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          fullWidth
        />

        <TextField
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          disabled={isEmailVerified}
        />

        {!isEmailVerified && (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={handleSendCode}
              disabled={timerActive}
              fullWidth
            >
              인증코드 발송
            </Button>
            {timerActive && (
              <Box display="flex" alignItems="center" pl={1}>
                <CircularProgress size={24} />
                <Typography ml={1}>
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {!isEmailVerified && (
          <Box display="flex" gap={1}>
            <TextField
              label="인증코드 입력"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              fullWidth
            />
            <Button variant="outlined" onClick={handleVerifyCode}>
              확인
            </Button>
          </Box>
        )}

        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />

        <Button type="submit" variant="contained" size="large" fullWidth>
          회원가입
        </Button>
      </Stack>
    </Box>
  )
}
