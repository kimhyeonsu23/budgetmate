const BASE_URL = window.location.origin;

export const REDIRECT_URI = `${BASE_URL}/oauth/kakao/callback`;
export const API_BASE_URL   = 'http://localhost:8080';

export const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
export const KAKAO_AUTH_URL = 
  `https://kauth.kakao.com/oauth/authorize?` +
  `client_id=${KAKAO_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code`;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_REDIRECT_URI = `${BASE_URL}/oauth/google/callback`;
export const GOOGLE_AUTH_URL = 
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=email%20profile`;
