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
        p: 2.5,
        borderRadius: 2.5,
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
        alignItems: 'center',
        bgcolor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        boxShadow: 'none',
      }}
    >
      {onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />,
            sx: { borderRadius: 2, bgcolor: 'white' },
          }}
          sx={{ flexGrow: 1, minWidth: 280, maxWidth: 360 }}
        />
      )}

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', ml: onSearchChange ? 'auto' : 0 }}>
        {children}
        {onReset && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={onReset}
            disabled={disableReset}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', height: 40 }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default AdminFilterBar;
