import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Rating, Avatar,
  Chip, Stack, Alert
} from '@mui/material';
import { ownerApi } from '@/api/ownerApi';
import DataTable, { Column } from '@/components/DataTable';
import { socketService } from '@/utils/socket';

const OwnerReviewsPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (venueId) {
      const socket = socketService.connect();
      socketService.joinVenue(venueId);

      const handleNewReview = (newReview: any) => {
        // Update query cache for current venue and page
        queryClient.setQueryData(['owner-reviews', venueId, page, rowsPerPage], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              reviews: [newReview, ...old.data.reviews.slice(0, rowsPerPage - 1)],
              total: (old.data.total || 0) + 1
            }
          };
        });
      };

      socket?.on('new-review', handleNewReview);

      return () => {
        socket?.off('new-review', handleNewReview);
      };
    }
  }, [venueId, page, rowsPerPage, queryClient]);

  const { data: reviewsRes, isLoading, error } = useQuery({
    queryKey: ['owner-reviews', venueId, page, rowsPerPage],
    queryFn: () => ownerApi.getVenueReviews(venueId!, { page: page + 1, limit: rowsPerPage }),
    enabled: !!venueId,
  });

  const reviews = reviewsRes?.data?.reviews || [];
  const total = reviewsRes?.data?.total || 0;

  const columns: Column<any>[] = [
    {
      key: 'user',
      label: 'Khách hàng',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.user?.avatar} sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
            {row.user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.user?.phone}</Typography>
          </Box>
        </Stack>
      )
    },
    {
      key: 'rating',
      label: 'Đánh giá',
      render: (row) => <Rating value={row.rating} readOnly size="small" />
    },
    {
      key: 'comment',
      label: 'Nhận xét',
      render: (row) => (
        <Typography variant="body2" sx={{ fontStyle: 'italic', maxWidth: 300 }}>
          "{row.comment}"
        </Typography>
      )
    },
    {
      key: 'booking',
      label: 'Đơn đặt',
      render: (row) => row.booking ? (
        <Chip label={row.booking.booking_code} size="small" variant="outlined" color="primary" />
      ) : (
        <Typography variant="caption" color="text.disabled">Đánh giá chung</Typography>
      )
    },
    {
      key: 'createdAt',
      label: 'Ngày gửi',
      render: (row) => (
        <Typography variant="caption">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </Typography>
      )
    }
  ];

  if (error) return <Alert severity="error">Không thể tải danh sách đánh giá</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, fontFamily: 'Sora' }}>
        Quản lý đánh giá
      </Typography>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="Chưa có đánh giá nào cho địa điểm này"
      />
    </Box>
  );
};

export default OwnerReviewsPage;
