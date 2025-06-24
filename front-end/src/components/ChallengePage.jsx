import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Divider, Grid, Paper, TextField, Button
} from '@mui/material';

export default function ChallengePage() {
  const [budget, setBudget] = useState(0);
  const [inputBudget, setInputBudget] = useState('');
  const [monthlySpending, setMonthlySpending] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBudget();
    fetchMonthlySpending();
  }, []);

  const fetchBudget = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');
    const now = new Date();

    try {
      const res = await fetch(
        `/budget?userId=${userId}&year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setBudget(data.budget || 0);
        setInputBudget(String(data.budget || ''));
      } else {
        console.error('예산 불러오기 실패', res.status);
      }
    } catch (err) {
      console.error('예산 API 에러:', err);
    }
  };

  const fetchMonthlySpending = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('/statis/getReceipt/calMonthlyTotal', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const total = await res.text();
        setMonthlySpending(Number(total));
      } else {
        console.error('소비 불러오기 실패', res.status);
      }
    } catch (err) {
      console.error('소비 API 에러:', err);
    }
  };

  const handleBudgetSave = async () => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const now = new Date();

    const body = {
      userId: Number(userId),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      budget: Number(inputBudget)
    };

    try {
      const res = await fetch('/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('예산이 저장되었습니다.');
        fetchBudget();
      } else {
        alert('예산 저장 실패');
      }
    } catch (err) {
      console.error('예산 저장 에러:', err);
    }
  };

  const savingRate = budget > 0
    ? Math.max(0, ((1 - monthlySpending / budget) * 100)).toFixed(1)
    : 0;

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#1f2937', // text-gray-800
          }}
        >챌린지</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            borderColor: '#cbd5e1',
            color: '#334155',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f1f5f9',
            }
          }}
        >
          ← 돌아가기
        </Button>
      </Box>
      <Divider sx={{ mb: 4, mt: 1 }} />

      {/* 예산 및 절약률 정보 */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">💰 이번 달 예산 및 소비</Typography>
        <Box sx={{ mt: 1 }}>
          <Typography>📌 설정된 예산: ₩{budget.toLocaleString()}</Typography>
          <Typography>📉 이번 달 지출: ₩{monthlySpending.toLocaleString()}</Typography>
          <Typography>📊 절약률: {savingRate}%</Typography>
        </Box>

        {/* 예산 수정 입력창 */}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="예산 수정"
            type="number"
            value={inputBudget}
            onChange={(e) => setInputBudget(e.target.value)}
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleBudgetSave}
            fullWidth
            sx={{ mt: 1, backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
          >
            예산 저장
          </Button>
        </Box>
      </Box>

      {/* 챌린지 선택 */}
      <Typography variant="h6" sx={{ mb: 2 }}>🔥 지금 도전할 수 있는 챌린지</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/challenges/no-spending')}>
            <Typography variant="subtitle1">🧘 무지출 챌린지</Typography>
            <Typography variant="body2" color="text.secondary">
              지정 기간 동안 소비를 0원으로! 습관 리셋 도전
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/challenges/category-limit')}>
            <Typography variant="subtitle1">📦 카테고리 제한 챌린지</Typography>
            <Typography variant="body2" color="text.secondary">
              특정 소비 카테고리의 지출을 줄여보세요
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate('/challenges/saving')}>
            <Typography variant="subtitle1">🏆 절약 챌린지</Typography>
            <Typography variant="body2" color="text.secondary">
              예산 10% 절약 도전! 알뜰 소비로 보상 받기
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              ※ 절약 챌린지는 이번 달 1일~말일 전체 기간으로만 설정할 수 있어요.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
