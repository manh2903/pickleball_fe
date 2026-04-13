import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, TextField, MenuItem, Stack, Chip,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { Search, Visibility, CheckCircle, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';

const statusColors: any = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const statusLabels: any = {
  open: 'Mới mở',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý',
  closed: 'Đã đóng',
};

const severityLabels: any = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

const AdminIncidents = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: incidentsRes, isLoading } = useQuery({
    queryKey: ['admin-incidents', status, severity, search, page, rowsPerPage],
    queryFn: () => adminApi.getIncidents({
      status,
      severity,
      search,
      page: page + 1,
      limit: rowsPerPage,
    }),
  });

  const incidents = incidentsRes?.data?.incidents || [];
  const total = incidentsRes?.data?.total || 0;

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes: string }) =>
      adminApi.updateIncidentStatus(id, { status, resolution_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      enqueueSnackbar('Đã cập nhật trạng thái sự cố', { variant: 'success' });
      setOpenDetail(false);
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi cập nhật sự cố', { variant: 'error' }),
  });

  const handleOpenDetail = (incident: any) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setResolutionNotes(incident.resolution_notes || '');
    setOpenDetail(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'incident',
      label: 'Sự cố',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 280 }}>
            {row.description}
          </Typography>
        </Box>
      )
    },
    {
      key: 'venue',
      label: 'Cơ sở / Sân',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.venue?.name || 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.court?.name || 'Toàn cơ sở'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'reporter',
      label: 'Người báo',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.reporter?.name || 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">
            Chủ sân: {row.venue?.owner?.name || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'severity',
      label: 'Mức độ',
      render: (row) => (
        <Chip
          label={severityLabels[row.severity] || row.severity}
          color={row.severity === 'high' ? 'error' : row.severity === 'medium' ? 'warning' : 'info'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Chip
          label={statusLabels[row.status] || row.status}
          color={statusColors[row.status] || 'default'}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (row) => (
        <Tooltip title="Xem và xử lý">
          <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
        Xử Lý Sự Cố Toàn Hệ Thống
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Theo dõi báo cáo sự cố từ staff/owner và điều phối xử lý trên toàn nền tảng.
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Tìm sự cố, cơ sở, người báo..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} />,
              sx: { borderRadius: 2 }
            }}
            sx={{ flexGrow: 1, minWidth: 280 }}
          />
          <TextField select size="small" label="Trạng thái" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 180 }}>
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="open">Mới mở</MenuItem>
            <MenuItem value="in_progress">Đang xử lý</MenuItem>
            <MenuItem value="resolved">Đã xử lý</MenuItem>
            <MenuItem value="closed">Đã đóng</MenuItem>
          </TextField>
          <TextField select size="small" label="Mức độ" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(0); }} sx={{ minWidth: 180 }}>
            <MenuItem value="all">Tất cả mức độ</MenuItem>
            <MenuItem value="low">Thấp</MenuItem>
            <MenuItem value="medium">Trung bình</MenuItem>
            <MenuItem value="high">Cao</MenuItem>
          </TextField>
        </Stack>

        <DataTable
          columns={columns}
          data={incidents}
          isLoading={isLoading}
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          emptyMessage="Chưa có sự cố nào phù hợp bộ lọc."
        />
      </Card>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Điều phối sự cố: {selectedIncident?.title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Mô tả</Typography>
              <Typography variant="body2" color="text.secondary">{selectedIncident?.description}</Typography>
            </Box>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="open">Mới mở</MenuItem>
              <MenuItem value="in_progress">Đang xử lý</MenuItem>
              <MenuItem value="resolved">Đã xử lý</MenuItem>
              <MenuItem value="closed">Đã đóng</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú xử lý"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetail(false)} startIcon={<Close />}>Đóng</Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={updateMutation.isPending || !selectedIncident}
            onClick={() => updateMutation.mutate({
              id: selectedIncident.id,
              status: newStatus,
              notes: resolutionNotes,
            })}
          >
            Lưu cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminIncidents;
