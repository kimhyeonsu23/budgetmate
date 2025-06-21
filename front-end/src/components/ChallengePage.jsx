import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Divider, Grid, Paper
} from '@mui/material';

export default function ChallengePage() {
  const [budget, setBudget] = useState(0);
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

  const savingRate = budget > 0
    ? Math.max(0, ((1 - monthlySpending / budget) * 100)).toFixed(1)
    : 0;

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        챌린지
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* 예산 및 절약률 정보 */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">💰 이번 달 예산 및 소비</Typography>
        <Box sx={{ mt: 1 }}>
          <Typography>📌 설정된 예산: ₩{budget.toLocaleString()}</Typography>
          <Typography>📉 이번 달 지출: ₩{monthlySpending.toLocaleString()}</Typography>
          <Typography>📊 절약률: {savingRate}%</Typography>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
