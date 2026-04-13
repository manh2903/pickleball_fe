import { ReactNode } from 'react';
import { Box, Button, Card, TextField } from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';

interface AdminFilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onReset?: () => void;
  disableReset?: boolean;
}

const AdminFilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  children,
  onReset,
  disableReset = false,
}: AdminFilterBarProps) => {
  return (
    <Card
      sx={{
        p: 1.25,
        px: 2,
        borderRadius: 2.5,
        display: 'flex',
        gap: 1.5,
        flexWrap: 'nowrap', // Giữ theo hàng ngang
        alignItems: 'center',
        bgcolor: 'white',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        overflowX: 'auto', // Cho phép scroll ngang nếu quá nhiều filter trên màn nhỏ
        '&::-webkit-scrollbar': { display: 'none' }, // Ẩn scrollbar để đẹp hơn
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} />,
            sx: { 
              borderRadius: 2, 
              bgcolor: '#F8FAFC',
              fontSize: '0.85rem',
              height: 38,
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: '1px solid', borderColor: 'primary.main' },
            },
          }}
          sx={{ minWidth: 240, maxWidth: 320 }}
        />
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
        {children}
        {onReset && (
          <Button
            variant="text"
            size="small"
            startIcon={<Refresh sx={{ fontSize: 18 }} />}
            onClick={onReset}
            disabled={disableReset}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 800, 
              textTransform: 'none', 
              height: 38,
              px: 2,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#F1F5F9' }
            }}
          >
            Làm mới
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default AdminFilterBar;
