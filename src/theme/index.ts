import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#22C55E', // Vibrant Green
      light: '#4ADE80',
      dark: '#16A34A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F172A', // Deep Navy
      light: '#1E293B',
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
    h1: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
      color: '#0F172A',
    },
    h2: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Times New Roman", serif',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
          },
        },
        containedPrimary: {
          '&:hover': {
            background: '#16A34A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
  },
});

export default theme;
