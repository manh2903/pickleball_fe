import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TablePagination, 
  CircularProgress, Box, Typography 
} from '@mui/material';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
  maxHeight?: string | number;
  hidePagination?: boolean;
}

const DataTable = <T extends { id: string | number }>({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = 'Không có dữ liệu hiển thị.',
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  rowsPerPageOptions = [5, 10, 25],
  maxHeight = 480,
  hidePagination = false
}: DataTableProps<T>) => {
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: 0, maxHeight }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {columns.map((col) => (
                <TableCell 
                  key={col.key} 
                  align={col.align || 'left'}
                  sx={{ fontWeight: 800, bgcolor: '#F8FAFC', borderBottom: '1.5px solid #F1F5F9', py: 1.5 }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={32} thickness={5} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 700 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((col) => (
                    <TableCell key={`${row.id}-${col.key}`} align={col.align || 'left'} sx={{ py: 1.5 }}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!hidePagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{ borderTop: 'none', px: 2 }}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      )}
    </Box>
  );
};

export default DataTable;
