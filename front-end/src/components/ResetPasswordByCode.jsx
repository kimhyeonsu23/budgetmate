import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordByCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailQuery = searchParams.get('email') || '';
  const codeQuery = searchParams.get('code') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailQuery || !codeQuery) {
      setError('유효하지 않은 접근입니다.');
    }
  }, [emailQuery, codeQuery]);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/user/reset-password-by-code', {
        email: emailQuery,
        code: codeQuery,
        newPassword,
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(res.data.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      console.error('reset-password-by-code API 오류:', err);
      setError(err.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">🔐 비밀번호 재설정</h1>

      <p className="text-sm text-center text-gray-600 mb-6">
        <strong className="text-indigo-600">{emailQuery}</strong>의 인증 코드{' '}
        <strong className="text-indigo-600">{codeQuery}</strong>가 확인되었습니다.
      </p>

      <div className="w-full max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 다시 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? '요청 중...' : '비밀번호 재설정'}
        </button>

        {message && (
          <p className="text-center text-sm text-green-600">{message}</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full text-sm text-gray-500 text-center hover:underline mt-2"
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}
