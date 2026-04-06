import { ReactNode } from 'react';
import { Box, Card, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  bottomText?: string;
  bottomLink?: string;
  bottomLinkText?: string;
}

const AuthLayout = ({ children, title, subtitle, bottomText, bottomLink, bottomLinkText }: AuthLayoutProps) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #F8FAFC 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Spheres */}
      <Box sx={{ 
        position: 'absolute', 
        top: -100, 
        right: -100, 
        width: 300, 
        height: 300, 
        borderRadius: '50%', 
        background: 'rgba(34, 197, 94, 0.1)', 
        filter: 'blur(100px)' 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: -100, 
        left: -100, 
        width: 300, 
        height: 300, 
        borderRadius: '50%', 
        background: 'rgba(34, 197, 94, 0.05)', 
        filter: 'blur(80px)' 
      }} />

      <Container maxWidth="xs" sx={{ mt: 8, mb: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" component={Link} to="/" sx={{ 
            textDecoration: 'none', 
            fontWeight: 800, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <Box component="span" sx={{ mr: 1 }}>🏓</Box> Pickleball Hub
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
            {title}
          </Typography>
          <Typography color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
          {children}
        </Card>

        {(bottomText && bottomLink) && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {bottomText}{' '}
              <Button 
                component={Link} 
                to={bottomLink} 
                sx={{ minWidth: 'auto', p: 0, ml: 0.5, fontWeight: 700 }}
              >
                {bottomLinkText}
              </Button>
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AuthLayout;
