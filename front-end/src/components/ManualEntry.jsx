import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Paper,
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import koLocale from 'date-fns/locale/ko'

function formatDateToYYYYMMDD(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const categoryOptions = [
  '외식',
  '교통',
  '생활비',
  '쇼핑',
  '건강',
  '교육',
  '저축/투자',
  '수입',
]

export default function ManualEntry() {
  const navigate = useNavigate()
  const [date, setDate] = useState(null)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!date || !category || !amount) {
      setError('날짜, 카테고리, 금액은 반드시 입력해야 합니다.')
      return
    }
    setError('')

    const token = localStorage.getItem('accessToken')
    const userId = localStorage.getItem('userId')

    const keywordMap = {
      '외식': 1,
      '교통': 2,
      '생활비': 3,
      '쇼핑': 4,
      '건강': 5,
      '교육': 6,
      '저축/투자': 7,
      '수입': 8,
    }

    const payload = {
      date: formatDateToYYYYMMDD(date), 
      shop: description.trim() || category,
      userId: parseInt(userId),
      keywordId: keywordMap[category],
      totalPrice: parseInt(amount, 10),
      imagePath: '',
    }

    try {
      const res = await fetch('/receipt/createReceipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || '서버 에러')
      }

      navigate('/ledger')
    } catch (err) {
      console.error(err)
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <Box
      component="main"
      sx={{
        bgcolor: '#FFFDF7',
        minHeight: '100vh',
        py: 6,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          bgcolor: '#ffffff',
        }}
      >
        <Typography variant="h5" gutterBottom>
          수동 가계부 입력
        </Typography>

        {error && (
          <Typography variant="body2" color="error" mb={2}>
            {error}
          </Typography>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
          <Box component="form" onSubmit={handleSubmit}>
            <DatePicker
              label="날짜"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />

            <TextField
              select
              label="카테고리"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="">
                <em>선택하세요</em>
              </MenuItem>
              {categoryOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="설명 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="금액"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              margin="normal"
            />

            <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/ledger')}
                sx={{ textTransform: 'none' }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{ textTransform: 'none' }}
              >
                저장
              </Button>
            </Stack>
          </Box>
        </LocalizationProvider>
      </Paper>
    </Box>
  )
}
