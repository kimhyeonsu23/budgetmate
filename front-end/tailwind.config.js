export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      colors: {
        brown: {
          400: '#5D3A00',
          800: '#3e2600',
        },
        kakao: '#FEE500',
        background: '#fffaf2',
      },
    },
  },
  plugins: [],
};
