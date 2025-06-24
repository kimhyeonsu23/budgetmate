import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyResetCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailQuery = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [reloadMessage, setReloadMessage] = useState('');

  useEffect(() => {
    if (!emailQuery) setError('유효하지 않은 접근입니다.');
  }, [emailQuery]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [remainingSeconds]);

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setReloadMessage('');
    try {
      const res = await axios.post('/user/send-reset-code', { email: emailQuery });
      if (res.data.success) {
        setReloadMessage('새 인증 코드를 발송했습니다.');
        setRemainingSeconds(300);
        setCode('');
      } else {
        setError(res.data.message || '인증 코드 재요청에 실패했습니다.');
      }
    } catch (err) {
      console.error('send-reset-code API 오류:', err);
      setError(err.response?.data?.message || '인증 코드 재요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return setError('인증 코드를 입력해주세요.');
    if (remainingSeconds <= 0) {
      setError('인증 시간이 만료되었습니다. 재요청 버튼을 눌러주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setReloadMessage('');
    try {
      const res = await axios.post('/user/verify-reset-code', {
        email: emailQuery,
        code: code.trim(),
      });
      if (res.data.verified) {
        navigate(`/reset-password-by-code?email=${encodeURIComponent(emailQuery)}&code=${encodeURIComponent(code.trim())}`);
      } else {
        setError(res.data.message || '인증 코드가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('verify-reset-code API 오류:', err);
      setError(err.response?.data?.message || '인증 코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">📮 인증 코드 입력</h1>

      <p className="text-sm text-center text-gray-600 mb-1">
        이메일 <strong className="text-indigo-600">{emailQuery}</strong>로 전송된 인증 코드를 입력하세요.
      </p>

      <p className={`text-center text-sm font-mono mb-4 ${remainingSeconds > 0 ? 'text-gray-700' : 'text-red-500'}`}>
        {remainingSeconds > 0
          ? `남은 시간: ${formatTime(remainingSeconds)}`
          : '인증 시간이 만료되었습니다.'}
      </p>

      {error && <p className="text-center text-sm text-red-500 mb-1">{error}</p>}
      {reloadMessage && <p className="text-center text-sm text-green-600 mb-1">{reloadMessage}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerifyCode();
        }}
        className="w-full max-w-xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">인증 코드</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6자리 코드 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading || remainingSeconds <= 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? '확인 중...' : '코드 확인'}
        </button>

        {remainingSeconds <= 0 && (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="w-full border border-indigo-500 text-indigo-600 font-medium py-3 rounded-xl hover:bg-indigo-50 transition"
          >
            {loading ? '재요청 중...' : '인증 코드 재요청'}
          </button>
        )}
      </form>
    </div>
  );
}
