import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Typography, Grid, Card, Button, CircularProgress, Stack, Chip, Divider, Paper, ToggleButtonGroup, ToggleButton, LinearProgress } from '@mui/material';
import { CheckCircle, Cancel, Verified, Storefront, SportsTennis, AccessTime, Bolt, WorkspacePremium, Spa } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { subscriptionApi } from '@/api/subscriptionApi';
import { useSnackbar } from 'notistack';
import type { ReactNode } from 'react';

/* ─── helpers ─────────────────────────────────────────────── */
const FEATURE_LABELS: Record<string, string> = {
  analytics: 'Báo cáo doanh thu',
  staff_management: 'Quản lý nhân viên',
  custom_coupons: 'Tạo mã khuyến mãi',
};

type TierConf = { color: string; gradient: string; icon: ReactNode; tier: number };

const TIER_CONFIG: Record<string, TierConf> = {
  free:    { color: '#64748B', gradient: 'linear-gradient(135deg,#64748B,#94A3B8)', icon: <Spa sx={{ fontSize: 28 }} />,              tier: 0 },
  basic:   { color: '#3B82F6', gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)', icon: <Bolt sx={{ fontSize: 28 }} />,             tier: 1 },
  premium: { color: '#8B5CF6', gradient: 'linear-gradient(135deg,#7C3AED,#C084FC)', icon: <WorkspacePremium sx={{ fontSize: 28 }} />, tier: 2 },
};

const getTierKey = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('premium') || n.includes('chuyên')) return 'premium';
  if (n.includes('basic')   || n.includes('bản'))    return 'basic';
  return 'free';
};

const fmt = (v: any) =>
  parseFloat(v) === 0
    ? 'Miễn phí'
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const durationLabel = (m: number) => {
  if (m >= 120) return 'Vĩnh viễn';
  if (m === 12)  return '1 Năm';
  return `${m} Tháng`;
};

/* ─── component ────────────────────────────────────────────── */
export default function OwnerSubscription() {
  const { enqueueSnackbar } = useSnackbar();
  const [durMap, setDurMap] = useState<Record<number, number>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle payment return status
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      enqueueSnackbar('Nâng cấp gói dịch vụ thành công! 🎉', { variant: 'success' });
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else if (status === 'error') {
      enqueueSnackbar('Thanh toán thất bại hoặc đã bị hủy.', { variant: 'error' });
      searchParams.delete('status');
      setSearchParams(searchParams);
    }
  }, [searchParams, enqueueSnackbar, setSearchParams]);

  // Get venues from OwnerLayout context
  const { venues = [] } = useOutletContext<{ venueId: any; venues: any[] }>();
  const venueCount = venues.length;

  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionApi.getPlans,
  });

  const { data: mySubRes, isLoading: subLoading, refetch } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMySubscription,
  });

  const purchase = useMutation({
    mutationFn: (optionId: number) => subscriptionApi.purchasePlan(optionId),
    onSuccess: (res: any) => {
      if (res.paymentUrl) {
         enqueueSnackbar('Chuyển hướng đến VNPay...', { variant: 'info' });
         window.location.href = res.paymentUrl;
      } else {
         enqueueSnackbar(res.message || 'Kích hoạt thành công!', { variant: 'success' });
         refetch();
      }
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.message || 'Lỗi khi thanh toán', { variant: 'error' }),
  });

  const plans: any[]    = plansRes  || [];
  const currentSub: any = mySubRes;

  // Init duration map
  useEffect(() => {
    if (!plans.length) return;
    const init: Record<number, number> = {};
    plans.forEach((p: any) => {
      const opts = p.options || [];
      if (!opts.length) return;
      const def = opts.reduce((a: any, b: any) => a.duration_months < b.duration_months ? a : b);
      init[p.id] = def.duration_months;
    });
    if (currentSub?.plan_id && currentSub?.option?.duration_months) {
      init[currentSub.plan_id] = currentSub.option.duration_months;
    }
    setDurMap(init);
  }, [plans.length, currentSub?.id]);

  if (plansLoading || subLoading)
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><CircularProgress size={48} /></Box>;

  const renderUsageStrip = () => {
    const opt = currentSub?.option;
    if (!opt) return null;
    const venuePct = opt.max_venues > 0 ? Math.min(100, Math.round((venueCount / opt.max_venues) * 100)) : 0;
    return (
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', gap: 3, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Storefront sx={{ color: '#64748B', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Cơ sở</Typography>
          <LinearProgress variant="determinate" value={venuePct} sx={{ width: 70, borderRadius: 5, height: 6, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: venuePct >= 100 ? '#EF4444' : '#10B981' } }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{venueCount} / {opt.max_venues}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <SportsTennis sx={{ color: '#64748B', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Sân/cơ sở</Typography>
          <Typography variant="caption" color="text.secondary">tối đa <b>{opt.max_courts_per_venue}</b> sân</Typography>
        </Stack>
        {Object.entries(opt.features || {}).map(([k, v]: any) => (
          <Chip key={k} size="small" icon={v ? <CheckCircle sx={{ color: '#10B981 !important', fontSize: '14px !important' }} /> : <Cancel sx={{ color: '#CBD5E1 !important', fontSize: '14px !important' }} />}
            label={FEATURE_LABELS[k] || k} sx={{ fontWeight: 600, bgcolor: v ? '#F0FDF4' : '#F8FAFC', color: v ? '#059669' : '#94A3B8', border: 'none' }} />
        ))}
      </Paper>
    );
  };

  const renderCard = (plan: any) => {
    const tKey = getTierKey(plan.name);
    const conf = TIER_CONFIG[tKey] || TIER_CONFIG.free;
    const opts = plan.options || [];
    if (!opts.length) return null;
    const selDur = durMap[plan.id] ?? opts[0].duration_months;
    const activeOpt = opts.find((o: any) => o.duration_months === selDur) || opts[0];
    const isCurrent = currentSub?.option_id === activeOpt.id;
    
    // Identify current level
    const currentTierLevel = TIER_CONFIG[getTierKey(currentSub?.plan?.name || '')]?.tier ?? 0;
    const isUpgrade = conf.tier > currentTierLevel;
    const isDowngrade = conf.tier < currentTierLevel;

    return (
      <Grid item xs={12} md={4} key={plan.id} sx={{ display: 'flex' }}>
        <Card sx={{ flex: 1, p: 0, borderRadius: 4, border: isCurrent ? `2px solid ${conf.color}` : '1.5px solid #E2E8F0', position: 'relative', overflow: 'visible',
          boxShadow: isCurrent ? `0 8px 30px -6px ${conf.color}55` : '0 2px 8px rgba(0,0,0,.04)', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 40px -10px ${conf.color}44` } }}>
          {isCurrent && <Chip label="Đang dùng" size="small" sx={{ position: 'absolute', top: -12, right: 16, fontWeight: 800, bgcolor: conf.color, color: '#fff', fontSize: 11, height: 24, zIndex: 5 }} />}
          <Box sx={{ background: conf.gradient, p: 2.5, borderRadius: '14px 14px 0 0', color: 'white' }}>
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.5 }}>
              <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,.2)', borderRadius: 2 }}>{conf.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>{plan.name}</Typography>
                <Typography sx={{ fontSize: '0.72rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.description}</Typography>
              </Box>
            </Stack>
            {opts.length > 1 ? (
              <ToggleButtonGroup value={selDur} exclusive size="small" onChange={(_, v) => v && setDurMap(prev => ({ ...prev, [plan.id]: v }))} sx={{ bgcolor: 'rgba(255,255,255,.15)', borderRadius: 2, p: 0.15, display: 'flex' }}>
                {opts.map((o: any) => (
                  <ToggleButton key={o.id} value={o.duration_months} sx={{ flex: 1, color: 'white', fontWeight: 800, fontSize: '0.65rem', border: 'none !important', borderRadius: '6px !important', '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.3) !important', color: 'white' } }}>
                    {durationLabel(o.duration_months)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            ) : (
              <Chip label={durationLabel(activeOpt.duration_months)} size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', fontWeight: 700, fontSize: '0.72rem' }} />
            )}
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', color: conf.color, lineHeight: 1 }}>{fmt(activeOpt.price)}</Typography>
              {parseFloat(activeOpt.price) > 0 && 
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>/ {durationLabel(activeOpt.duration_months).toLowerCase()}</Typography>}
            </Box>
            <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Storefront sx={{ fontSize: 16, color: conf.color }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}><b>{activeOpt.max_venues}</b> cơ sở · <b>{activeOpt.max_courts_per_venue}</b> sân/cơ sở</Typography>
              </Stack>
              {Object.entries(activeOpt.features || {}).map(([k, v]: any) => (
                <Stack key={k} direction="row" spacing={1} alignItems="center">
                  {v ? <CheckCircle sx={{ fontSize: 15, color: conf.color }} /> : <Cancel sx={{ fontSize: 15, color: '#CBD5E1' }} />}
                  <Typography variant="body2" sx={{ fontWeight: 500, color: v ? 'text.primary' : 'text.disabled', fontSize: '0.8rem' }}>{FEATURE_LABELS[k] || k}</Typography>
                </Stack>
              ))}
            </Stack>
            
            <Button 
                fullWidth 
                variant={isCurrent ? 'outlined' : 'contained'} 
                size="medium" 
                disabled={isCurrent || isDowngrade || purchase.isPending} 
                onClick={() => purchase.mutate(activeOpt.id)}
                sx={{ 
                    borderRadius: 2.5, 
                    fontWeight: 900, 
                    fontSize: '0.82rem', 
                    bgcolor: isCurrent || isDowngrade ? 'transparent' : conf.color, 
                    borderColor: isDowngrade ? '#E2E8F0' : conf.color, 
                    color: isCurrent ? conf.color : isDowngrade ? '#94A3B8' : 'white', 
                    '&:hover': { bgcolor: isCurrent || isDowngrade ? 'transparent' : conf.color, filter: 'brightness(.9)' } 
                }}
            >
              {isCurrent ? 'Đang sử dụng' : isDowngrade ? 'Gói cơ bản' : isUpgrade ? '⚡ Nâng cấp ngay' : 'Thanh toán ngay'}
            </Button>
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2.5, px: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Gói dịch vụ 💎</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>Chọn gói phù hợp để mở rộng quy mô kinh doanh</Typography>
        </Box>
        {currentSub && (
          <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Verified sx={{ color: '#0EA5E9', fontSize: 20 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369A1', display: 'block', lineHeight: 1 }}>{currentSub.plan?.name}</Typography>
              <Typography variant="caption" sx={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 0.3, lineHeight: 1.6 }}>
                <AccessTime sx={{ fontSize: 11 }} /> HH đến {currentSub.end_date ? new Date(currentSub.end_date).toLocaleDateString('vi-VN') : '—'}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
      {renderUsageStrip()}
      <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: 'stretch' }}>
        {plans.map(renderCard)}
      </Grid>
    </Box>
  );
}
