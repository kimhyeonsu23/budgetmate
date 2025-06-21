import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import axios from 'axios'

export default function FindId() {
  const [userName, setUserName] = useState('')
  const [resultEmail, setResultEmail] = useState('')       // 단일 이메일 저장
  const [resultList, setResultList] = useState([])         // 여러 이메일 저장 (타입 애너테이션 제거)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFindId = async () => {
    if (!userName.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    setResultEmail('')
    setResultList([])

    try {
      const res = await axios.post('/user/find-id', { userName })

      if (res.data.multiple) {
        // 중복된 이름으로 2명 이상 조회된 경우
        setResultList(res.data.emailList || [])
      } else if (res.data.email) {
        // 단일 사용자가 조회된 경우
        setResultEmail(res.data.email)
      } else {
        // 200 OK지만 email/ emailList 둘 다 없는 경우
        setError('등록된 아이디(이메일)가 없습니다.')
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // 사용자 없음으로 400 Bad Request를 받은 경우
        setError('등록된 아이디(이메일)가 없습니다.')
      } else {
        console.error('FindId API 호출 오류:', err)
        setError('아이디 조회 중 오류가 발생했습니다.')
      }
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
        아이디 찾기
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
            label="이름"
            fullWidth
            variant="outlined"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            error={!!error && !resultEmail && resultList.length === 0}
            helperText={error && !resultEmail && resultList.length === 0 ? error : ''}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFindId}
            disabled={loading}
            fullWidth
          >
            {loading ? '조회 중...' : '아이디 조회'}
          </Button>

          {resultEmail && (
            <Alert severity="success">
              아이디(이메일): <strong>{resultEmail}</strong>
            </Alert>
          )}
          {resultList.length > 0 && (
            <Alert severity="success" sx={{ textAlign: 'left' }}>
              동일한 이름으로 등록된 이메일이 {resultList.length}건 있습니다:
              <ul style={{ margin: '8px 0 0 1.5em', padding: 0 }}>
                {resultList.map((email, idx) => (
                  <li key={idx} style={{ lineHeight: 1.6 }}>
                    <strong>{email}</strong>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

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
