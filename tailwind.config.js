/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  important: '#__next',
  theme: {
    extend: {
      fontSize: {
        xs: '0.75rem' /* 12px */,
        sm: '0.875rem' /* 14px */,
        base: '1rem' /* 16px */,
        lg: '1.125rem' /* 18px */,
        xl: '1.25rem' /* 20px */,
        '2xl': '1.5rem' /* 24px */,
        '3xl': '1.875rem' /* 30px */,
        '4xl': '2.25rem' /* 36px */,
        '5xl': '3rem' /* 48px */,
      },
      spacing: {
        0.25: '0.25rem' /* 4px */,
        0.5: '0.5rem' /* 8px */,
        0.75: '0.75rem' /* 12px */,
        1: '1rem' /* 16px */,
        1.5: '1.5rem' /* 24px */,
        2: '2rem' /* 32px */,
        3: '3rem' /* 48px */,
        4: '4rem' /* 64px */,
      },
      colors: {
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          main: '#dc004e',
          light: '#ff4081',
          dark: '#9a0036',
        },
      },
    },
  },
  corePlugins: {
    preflight: false, // 与MUI一起使用时禁用preflight是好的做法
  },
  plugins: [],
}
