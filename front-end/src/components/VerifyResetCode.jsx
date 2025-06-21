import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import axios from 'axios'

export default function VerifyResetCode() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const emailQuery = searchParams.get('email') || ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [remainingSeconds, setRemainingSeconds] = useState(300)

  const [reloadMessage, setReloadMessage] = useState('')

  useEffect(() => {
    if (!emailQuery) {
      setError('유효하지 않은 접근입니다.')
    }
  }, [emailQuery])

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return // 0 이하가 되면 더 이상 타이머를 돌리지 않음
    }
    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [remainingSeconds])

  // 초 단위 숫자를 "MM:SS" 형식 문자열로 변환해 주는 헬퍼 함수
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const mm = String(mins).padStart(2, '0')
    const ss = String(secs).padStart(2, '0')
    return `${mm}:${ss}`
  }

  // 인증 코드 재요청 (남은 시간 초기화, 코드 발송)
  const handleResendCode = async () => {
    setLoading(true)
    setError('')
    setReloadMessage('')
    try {
      const res = await axios.post('/user/send-reset-code', { email: emailQuery })
      if (res.data.success) {
        setReloadMessage('새 인증 코드를 발송했습니다.')
        setRemainingSeconds(300) // 5분(300초)으로 초기화
        setCode('')              // 입력창 비우기
      } else {
        setError(res.data.message || '인증 코드 재요청에 실패했습니다.')
      }
    } catch (err) {
      console.error('send-reset-code API 오류:', err)
      setError(err.response?.data?.message || '인증 코드 재요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('인증 코드를 입력해주세요.')
      return
    }
    if (remainingSeconds <= 0) {
      setError('인증 시간이 만료되었습니다. 재요청 버튼을 눌러주세요.')
      return
    }

    setLoading(true)
    setError('')
    setReloadMessage('')
    try {
      const res = await axios.post('/user/verify-reset-code', {
        email: emailQuery,
        code: code.trim(),
      })
      if (res.data.verified) {
        navigate(
          `/reset-password-by-code?email=${encodeURIComponent(emailQuery)}&code=${encodeURIComponent(
            code.trim()
          )}`
        )
      } else {
        setError(res.data.message || '인증 코드가 일치하지 않습니다.')
      }
    } catch (err) {
      console.error('verify-reset-code API 오류:', err)
      const msg = err.response?.data?.message || '인증 코드 확인 중 오류가 발생했습니다.'
      setError(msg)
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
      sx={{ minHeight: '100vh', pt: 4, pb: 10, px: 2, bgcolor: 'background.default' }}
    >
      <Typography variant="h4" color="primary" gutterBottom>
        인증 코드 입력
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, textAlign: 'center' }}
      >
        이메일({emailQuery})로 받은 인증 코드를 입력하세요.
      </Typography>

      <Typography
        variant="subtitle1"
        color={remainingSeconds > 0 ? 'text.primary' : 'error'}
        sx={{ mb: 3, textAlign: 'center', fontFamily: 'monospace' }}
      >
        {remainingSeconds > 0
          ? `남은 시간: ${formatTime(remainingSeconds)}`
          : '인증 시간이 만료되었습니다.'}
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Stack spacing={2}>
          <TextField
            label="인증 코드"
            fullWidth
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!error}
            helperText={error}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyCode}
            disabled={loading || remainingSeconds <= 0}
            fullWidth
          >
            {loading ? '확인 중...' : '코드 확인'}
          </Button>

          {remainingSeconds <= 0 && (
            <>
              {reloadMessage && (
                <Alert severity="success">{reloadMessage}</Alert>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleResendCode}
                disabled={loading}
                fullWidth
              >
                {loading ? '재요청 중...' : '인증 코드 재요청'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
