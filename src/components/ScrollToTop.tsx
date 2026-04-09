import { Fab, Zoom, useScrollTrigger } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const dropIn = keyframes`
  from { opacity: 0; transform: translateY(-20px) scale(0.8); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  70%  { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
`;

const ScrollToTop = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 400,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
        <Fab
          onClick={handleClick}
          size="medium"
          aria-label="scroll back to top"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 2000,
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            animation: trigger
              ? `${dropIn} 0.45s cubic-bezier(0.34,1.56,0.64,1) both, ${pulse} 2s infinite`
              : 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #15803D, #16A34A)',
              transform: 'translateY(-3px) scale(1.08)',
              boxShadow: '0 16px 40px -8px rgba(22,163,74,0.5)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.96)',
            },
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 8px 24px -4px rgba(22,163,74,0.35)',
          }}
        >
          <KeyboardArrowUp sx={{ fontSize: 22, strokeWidth: 2 }} />
        </Fab>
    </Zoom>
  );
};

export default ScrollToTop;