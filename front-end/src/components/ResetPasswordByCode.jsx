import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import axios from 'axios'

export default function ResetPasswordByCode() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // 쿼리에서 email, code 값을 꺼냄
  const emailQuery = searchParams.get('email') || ''
  const codeQuery = searchParams.get('code') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!emailQuery || !codeQuery) {
      setError('유효하지 않은 접근입니다.')
    }
  }, [emailQuery, codeQuery])

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      // 비밀번호 재설정 요청: POST /user/reset-password-by-code
      const res = await axios.post('/user/reset-password-by-code', {
        email: emailQuery,
        code: codeQuery,
        newPassword,
      })
      // 성공 시 { success: true, message: "비밀번호가 성공적으로 변경되었습니다." }
      if (res.data.success) {
        setMessage(res.data.message)
        // 2초 뒤 로그인 페이지로 이동
        setTimeout(() => navigate('/'), 2000)
      } else {
        setError(res.data.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch (err) {
      console.error('reset-password-by-code API 오류:', err)
      setError(err.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.')
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
        새 비밀번호 설정
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        이메일({emailQuery})의 인증 코드({codeQuery})가 확인되었습니다. 새 비밀번호를 입력하세요.
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Stack spacing={2}>
          <TextField
            label="새 비밀번호"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="비밀번호 확인"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleReset}
            disabled={loading}
            fullWidth
          >
            {loading ? '요청 중...' : '비밀번호 재설정'}
          </Button>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
    </Box>
  )
}
