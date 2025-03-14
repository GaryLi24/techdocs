import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    htmlFontSize: 16, // 告诉MUI基础字体大小是16px
    fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
    fontSize: 16, // 默认字体大小16px
    h1: {
      fontSize: '2.5rem', // 40px
    },
    h2: {
      fontSize: '2rem', // 32px
    },
    h3: {
      fontSize: '1.75rem', // 28px
    },
    h4: {
      fontSize: '1.5rem', // 24px
    },
    h5: {
      fontSize: '1.25rem', // 20px
    },
    h6: {
      fontSize: '1rem', // 16px
    },
    body1: {
      fontSize: '1rem', // 16px
    },
    body2: {
      fontSize: '0.875rem', // 14px
    },
    button: {
      fontSize: '0.875rem', // 14px
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
        },
      },
    },
  },
})

export default theme
