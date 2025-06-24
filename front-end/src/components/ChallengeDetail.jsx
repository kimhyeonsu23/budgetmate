import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [successRate, setSuccessRate] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    fetchChallengeDetail();
  }, []);

  const fetchChallengeDetail = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get('/challenge/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const selected = res.data.find((c) => c.id === Number(id));
      if (selected) {
        setChallenge(selected);
        calculateProgressInfo(selected);
      }
    } catch (err) {
      console.error('챌린지 조회 실패', err);
    }
  };

  const calculateProgressInfo = (c) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const passedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24)) + 1;
    const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (now < start) {
      setSuccessRate(0);
      setDaysRemaining(totalDays);
    } else if (now > end) {
      setSuccessRate(100);
      setDaysRemaining(0);
    } else {
      const rate = Math.min(100, (passedDays / totalDays) * 100);
      setSuccessRate(rate.toFixed(1));
      setDaysRemaining(remaining >= 0 ? remaining : 0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`/challenge/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('삭제되었습니다.');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  if (!challenge) return <Typography align="center" mt={10} color="textSecondary">⏳ 로딩 중...</Typography>;

  return (
    <Box className="bg-gray-50 min-h-screen py-6 px-4">
      <Card className="max-w-xl mx-auto border border-gray-200">
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5" fontWeight="bold">🏁 챌린지 상세</Typography>
            <Button onClick={() => navigate(-1)} size="small" variant="outlined">← 돌아가기</Button>
          </Box>

          <Chip
            label={
              challenge.success
                ? '이 챌린지를 성공했습니다! 🎊 포인트가 지급되었어요.'
                : `챌린지 진행 중이에요. ⏳ ${daysRemaining}일 남았습니다.`
            }
            color={challenge.success ? 'success' : 'primary'}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Divider sx={{ mb: 2 }} />

          <Typography variant="body1" gutterBottom>
            <strong>📅 기간:</strong> {challenge.startDate} ~ {challenge.endDate}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>🏷️ 유형:</strong> {challenge.type}
          </Typography>

          {challenge.type === 'NO_SPENDING' && (
            <Typography variant="body1"><strong>💸 허용 지출 한도:</strong> ₩{challenge.targetAmount.toLocaleString()}</Typography>
          )}
          {challenge.type === 'CATEGORY_LIMIT' && (
            <>
              <Typography variant="body1"><strong>📦 제한 카테고리:</strong> {challenge.targetCategory}</Typography>
              <Typography variant="body1"><strong>💰 지출 상한:</strong> ₩{challenge.targetAmount.toLocaleString()}</Typography>
            </>
          )}
          {challenge.type === 'SAVING' && (
            <Typography variant="body1"><strong>💡 성공 조건:</strong> 예산보다 ₩{challenge.targetAmount.toLocaleString()} 덜 쓰기</Typography>
          )}

          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight="bold">📊 진행률: {successRate}%</Typography>
            <LinearProgress
              variant="determinate"
              value={Number(successRate)}
              sx={{ height: 10, borderRadius: 5, mt: 1 }}
              color={Number(successRate) >= 100 ? 'success' : 'primary'}
            />
          </Box>

          <Box mt={3}>
            <Typography variant="body2"><strong>✅ 성공 여부:</strong> {challenge.success ? '성공 🎉' : '진행 중 ⏳'}</Typography>
            <Typography
              variant="body2"
              color={daysRemaining <= 3 ? 'error' : 'textPrimary'}
              fontWeight={daysRemaining <= 3 ? 'bold' : 'normal'}
            >
              <strong>⏳ 남은 기간:</strong> {daysRemaining}일 남음
            </Typography>
          </Box>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 4, textTransform: 'none' }}
          >
            삭제하기
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
