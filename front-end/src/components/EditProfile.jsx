import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function EditProfile() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || '');
    setEmail(localStorage.getItem('email') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setMessage('');

    try {
      const userId = localStorage.getItem('userId');

      await axios.put('/user/update', {
        userId,
        userName,
        currentPassword,
        newPassword: newPassword || null,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      localStorage.setItem('userName', userName);
      setMessage('프로필이 수정되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';

      if (status === 403 && msg.includes('현재 비밀번호')) {
        setPasswordError('현재 비밀번호가 일치하지 않습니다.');
      } else if (msg) {
        setMessage('수정 실패: ' + msg);
      } else {
        setMessage('수정 실패: 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <main className="min-h-screen bg-white flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">프로필 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              placeholder="현재 비밀번호 입력"
              required
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
            <Link to="/find-password" className="block mt-1 text-sm text-indigo-500 hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">새 비밀번호 (선택)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-300 focus:border-indigo-300"
              placeholder="변경할 비밀번호 입력"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition duration-200"
          >
            저장하기
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="block w-full mt-2 text-sm text-gray-500 text-center hover:underline"
        >
          ← 마이페이지로 돌아가기
        </button>
      </div>
    </main>
  );
}
