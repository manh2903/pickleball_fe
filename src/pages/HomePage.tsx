import { Box, Container, Typography, Button, Grid, Card, Stack, Divider, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import {
  PlayCircleFilled,
  Search,
  DateRange,
  LocationOn,
  Star,
  VerifiedUser,
  TrendingUp,
  Devices,
  ArrowForward,
  CheckCircle,
  Bolt,
  WorkspacePremium,
  Spa,
  Storefront,
  Cancel
} from "@mui/icons-material";
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscriptionApi';
import { keyframes } from "@mui/system";
import { useEffect, useState } from "react";

/* ── Animations ─────────────────────────────────────────── */
const orb = keyframes`
  0%,100% { transform: scale(1) translate(0,0); opacity:.7; }
  40%      { transform: scale(1.15) translate(30px,-25px); opacity:1; }
  70%      { transform: scale(.9) translate(-20px,20px); opacity:.85; }
`;
const reveal = keyframes`
  from { opacity:0; transform:translateY(36px); }
  to   { opacity:1; transform:translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
`;
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
`
const ping = keyframes`
  75%,100% { transform: scale(2); opacity: 0; }
`;

/* ── Reusable animated entry wrapper ────────────────────── */
const FadeUp = ({ delay = 0, children, sx = {} }: { delay?: number; children: React.ReactNode; sx?: any }) => (
  <Box sx={{ opacity: 0, animation: `${reveal} .75s ease-out ${delay}s forwards`, ...sx }}>{children}</Box>
);

// Counter component for stats
const Counter = ({ target, duration = 2000 }: { target: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  // Extract only the primary number to count (handle cases like "500+" or "34/34")
  const match = target.match(/^(\d+(?:\.\d+)?)/);
  const numericTarget = match ? parseFloat(match[1]) : 0;
  const suffix = target.replace(/^(\d+(?:\.\d+)?)/, "");

  useEffect(() => {
    let start = 0;
    const end = numericTarget;
    if (isNaN(end) || start === end) {
      if (!isNaN(end)) setCount(end);
      return;
    }

    const totalFrames = 60;
    const increment = end / totalFrames;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const nextCount = increment * frame;
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(nextCount);
      }
    }, duration / totalFrames);

    return () => clearInterval(timer);
  }, [numericTarget, duration]);

  // Handle decimal formatting (for items like 4.9)
  const displayValue = Number.isInteger(numericTarget) 
    ? Math.floor(count).toLocaleString() 
    : count.toFixed(1);

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
};

/* ── Data ────────────────────────────────────────────────── */
const features = [
  {
    title: "Tìm sân dễ dàng",
    desc: "Bản đồ trực quan, lọc theo khu vực, giá tiền và tiện ích. Tìm sân trong vài giây.",
    icon: <LocationOn sx={{ fontSize: 28 }} />,
    accent: "#22C55E",
    bg: "linear-gradient(135deg,#DCFCE7,#BBF7D0)",
    check: ["Lọc theo vị trí", "Xem ảnh sân thực tế", "So sánh giá"],
  },
  {
    title: "Đặt lịch 24/7",
    desc: "Đặt sân bất kỳ lúc nào, thanh toán linh hoạt qua VNPay, MoMo hoặc tiền mặt.",
    icon: <DateRange sx={{ fontSize: 28 }} />,
    accent: "#3B82F6",
    bg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    check: ["Đặt trước 30 ngày", "Hủy miễn phí 2h", "Nhắc lịch tự động"],
  },
  {
    title: "Quản lý chuyên nghiệp",
    desc: "Dashboard toàn diện cho chủ sân: lịch đặt, nhân viên, doanh thu theo thời gian thực.",
    icon: <VerifiedUser sx={{ fontSize: 28 }} />,
    accent: "#F59E0B",
    bg: "linear-gradient(135deg,#FEF9C3,#FDE68A)",
    check: ["Báo cáo doanh thu", "Quản lý nhân viên", "Thông báo đặt sân"],
  },
];

const statsData = [
  { value: "500+", label: "Sân đấu" },
  { value: "10000+", label: "Người chơi" },
  { value: "4.9★", label: "Đánh giá" },
  { value: "34/34", label: "Tỉnh thành" },
];

const ctaItems = [
  { icon: <TrendingUp sx={{ fontSize: 26 }} />, label: "Tăng trưởng nhanh" },
  { icon: <Devices sx={{ fontSize: 26 }} />, label: "Đa nền tảng" },
  { icon: <Star sx={{ fontSize: 26 }} />, label: "Dịch vụ 5 sao" },
  { icon: <PlayCircleFilled sx={{ fontSize: 26 }} />, label: "Dễ sử dụng" },
];

/* ── Pricing Config (Synced with OwnerSubscription) ──────── */
const FEATURE_LABELS: Record<string, string> = {
  analytics: 'Báo cáo doanh thu',
  staff_management: 'Quản lý nhân viên',
  custom_coupons: 'Tạo mã khuyến mãi',
};

const TIER_CONFIG: Record<string, any> = {
  free:  { color: '#64748B', gradient: 'linear-gradient(135deg,#64748B,#94A3B8)', icon: <Spa sx={{ fontSize: 24 }} />, bgTint: '#F8FAFC' },
  pro:   { color: '#16A34A', gradient: 'linear-gradient(135deg,#16A34A,#22C55E)', icon: <Bolt sx={{ fontSize: 24 }} />, bgTint: '#F0FDF4' },
  ultra: { color: '#8B5CF6', gradient: 'linear-gradient(135deg,#7C3AED,#C084FC)', icon: <WorkspacePremium sx={{ fontSize: 24 }} />, bgTint: '#F5F3FF' },
};

const getTierKey = (name: string, index: number): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('ultra') || index === 2) return 'ultra';
  if (n.includes('pro') || index === 1)   return 'pro';
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

/* ═══════════════════════════════════════════════════════════
   COMPONENT
 ═══════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => subscriptionApi.getPlans(),
  });

  const plans = Array.isArray(plansRes) ? plansRes : (plansRes as any)?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ overflow: "hidden", bgcolor: "#FAFAFA" }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 10, md: 8 },
          pb: { xs: 12, md: 20 },
          background: "linear-gradient(160deg,#F0FDF4 0%,#F8FAFC 55%,#EFF6FF 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, #CBD5E1 1px, transparent 0)`,
            backgroundSize: "32px 32px",
            opacity: 0.35,
          },
        }}
      >
        {/* Glow orbs */}
        {[
          { top: "-8%", right: "-4%", size: 560, color: "rgba(34,197,94,.12)", delay: "0s" },
          { bottom: "5%", left: "-8%", size: 480, color: "rgba(59,130,246,.1)", delay: "2s" },
        ].map((o, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: o.size,
              height: o.size,
              top: o.top,
              right: o.right,
              bottom: o.bottom,
              left: o.left,
              background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`,
              filter: "blur(72px)",
              zIndex: 0,
              animation: `${orb} 14s ${o.delay} infinite ease-in-out alternate`,
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left copy */}
            <Grid item xs={12} md={7}>
              <FadeUp delay={0}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 10, height: 10 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: "#22C55E",
                        animation: `${ping} 1.4s infinite`,
                      }}
                    />
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22C55E" }} />
                  </Box>
                  <Typography sx={{ fontSize: ".78rem", fontWeight: 700, color: "#16A34A", letterSpacing: 0.8, textTransform: "uppercase" }}>
                    #1 Pickleball Platform tại Việt Nam
                  </Typography>
                </Stack>
              </FadeUp>

              <FadeUp delay={0.1}>
                <Typography
                  sx={{
                    fontSize: { xs: "2.8rem", md: "4.2rem", lg: "4.6rem" },
                    fontWeight: 950,
                    lineHeight: 1.1,
                    letterSpacing: "-0.04em",
                    color: "#0F172A",
                    fontFamily: '"Sora","Plus Jakarta Sans",system-ui,sans-serif',
                    mb: 1,
                  }}
                >
                  Đam mê
                  <br />
                  rực cháy
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "2.8rem", md: "4.2rem", lg: "4.6rem" },
                    fontWeight: 950,
                    lineHeight: 1.1,
                    letterSpacing: "-0.04em",
                    fontFamily: '"Sora","Plus Jakarta Sans",system-ui,sans-serif',
                    mb: 3.5,
                    pb: 1,
                    background: "linear-gradient(90deg,#16A34A 0%,#22C55E 40%,#4ADE80 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: `${shimmer} 3s linear infinite`,
                  }}
                >
                  Đặt sân dễ dàng
                </Typography>
              </FadeUp>

              <FadeUp delay={0.22}>
                <Typography sx={{ color: "#475569", mb: 5, lineHeight: 1.75, fontSize: "1.1rem", maxWidth: 520 }}>
                  Hàng nghìn sân Pickleball chất lượng cao trên toàn quốc. Đặt lịch nhanh, thanh toán linh hoạt, kết nối cộng đồng người chơi.
                </Typography>
              </FadeUp>

              <FadeUp delay={0.34}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 6 }}>
                  <Button
                    component={Link}
                    to="/marketplace"
                    variant="contained"
                    size="large"
                    startIcon={<Search />}
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 4,
                      py: 1.9,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "none",
                      background: "linear-gradient(135deg,#16A34A,#22C55E)",
                      boxShadow: "0 16px 32px -8px rgba(22,163,74,.45)",
                      transition: "all .3s",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 22px 40px -8px rgba(22,163,74,.5)" },
                    }}
                  >
                    Khám phá ngay
                  </Button>
                  <Button
                    component={Link}
                    to="/register-owner"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.9,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      borderWidth: 2,
                      borderColor: "#E2E8F0",
                      color: "#1E293B",
                      bgcolor: "rgba(255,255,255,.8)",
                      backdropFilter: "blur(8px)",
                      transition: "all .3s",
                      "&:hover": { borderColor: "#22C55E", color: "#16A34A", borderWidth: 2, bgcolor: "#F0FDF4", transform: "translateY(-2px)" },
                    }}
                  >
                    Dành cho chủ sân
                  </Button>
                </Stack>
              </FadeUp>

              {/* Stats row */}
              <FadeUp delay={0.46}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0,
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    bgcolor: "rgba(255,255,255,.9)",
                    backdropFilter: "blur(12px)",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px -4px rgba(0,0,0,.07)",
                    width: "fit-content",
                  }}
                >
                  {statsData.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        textAlign: "center",
                        borderRight: i < statsData.length - 1 ? "1px solid #E2E8F0" : "none",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 900, fontSize: "1.4rem", color: "#0F172A", lineHeight: 1, fontFamily: '"Sora",system-ui,sans-serif' }}
                      >
                        <Counter target={s.value} />
                      </Typography>
                      <Typography
                        sx={{ fontSize: ".68rem", color: "#64748B", fontWeight: 600, mt: 0.4, textTransform: "uppercase", letterSpacing: 0.6 }}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </FadeUp>
            </Grid>
            
            {/* Right visual - Responsive Image Montage (Enlarged) */}
            <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center" }}>
              <Box sx={{ 
                position: "relative", 
                width: "125%", 
                transform: "translateX(15%)", 
                perspective: "1000px" 
              }}>
                {/* Main Large Image */}
                <Box
                  component="img"
                  src="https://cdn.shopvnb.com/uploads/images/bai_viet/tong-hop-dan-pickleball-hot-girl-8-1748226218.webp"
                  alt="Pickleball court"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 5,
                    boxShadow: "0 40px 100px -20px rgba(15, 23, 42, 0.25)",
                    zIndex: 1,
                    animation: `${slideInLeft} 1s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    border: '5px solid white',
                    display: 'block'
                  }}
                />
                {/* Secondary Inset Image */}
                <Box
                  component="img"
                  src="https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/7/7/hinh-anh-7-7-25-luc-0836-17518522026332056839590.jpeg"
                  alt="Pickleball players"
                  sx={{
                    position: "absolute",
                    bottom: "-15%",
                    right: "-15%",
                    width: "65%",
                    height: "auto",
                    borderRadius: 5,
                    boxShadow: "0 40px 80px -20px rgba(15, 23, 42, 0.35)",
                    zIndex: 2,
                    animation: `${slideInRight} 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    border: '5px solid white',
                    display: 'block'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <FadeUp>
              <Box sx={{ display: "inline-block", px: 2.5, py: 0.6, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, mb: 2.5 }}>
                <Typography sx={{ fontSize: ".75rem", fontWeight: 800, color: "#16A34A", textTransform: "uppercase", letterSpacing: 1.2 }}>
                  Tại sao chọn chúng tôi?
                </Typography>
              </Box>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Typography
                sx={{
                  fontWeight: 950,
                  fontSize: { xs: "2rem", md: "3rem" },
                  letterSpacing: "-0.03em",
                  color: "#0F172A",
                  lineHeight: 1.1,
                  fontFamily: '"Sora","Plus Jakarta Sans",system-ui,sans-serif',
                }}
              >
                Nền tảng Pickleball
                <br />
                toàn diện nhất Việt Nam
              </Typography>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Typography sx={{ color: "#64748B", mt: 2.5, fontSize: "1.1rem", maxWidth: 560, mx: "auto", lineHeight: 1.7 }}>
                Từ tìm kiếm đến đặt lịch, từ thanh toán đến quản lý — tất cả trên một nền tảng duy nhất.
              </Typography>
            </FadeUp>
          </Box>

          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FadeUp delay={i * 0.15}>
                  <Card
                    sx={{
                      p: 4.5,
                      height: "100%",
                      borderRadius: 5,
                      border: "1.5px solid #F1F5F9",
                      bgcolor: "#FAFAFA",
                      transition: "all .4s cubic-bezier(.175,.885,.32,1.275)",
                      cursor: "default",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        border: `1.5px solid ${f.accent}40`,
                        boxShadow: `0 32px 64px -16px ${f.accent}22`,
                        bgcolor: "#fff",
                        "& .feat-icon": { transform: "scale(1.15) rotate(8deg)" },
                      },
                    }}
                  >
                    <Box
                      className="feat-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: f.bg,
                        color: f.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3.5,
                        transition: "transform .4s cubic-bezier(.175,.885,.32,1.275)",
                        boxShadow: `0 8px 24px -4px ${f.accent}33`,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", mb: 1.5, color: "#0F172A", fontFamily: '"Sora",system-ui,sans-serif' }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: "#64748B", lineHeight: 1.75, mb: 3.5, fontSize: ".96rem" }}>{f.desc}</Typography>
                    <Divider sx={{ mb: 3, borderColor: "#F1F5F9" }} />
                    <Stack spacing={1.2}>
                      {f.check.map((c, j) => (
                        <Stack key={j} direction="row" spacing={1.2} alignItems="center">
                          <CheckCircle sx={{ fontSize: 16, color: f.accent }} />
                          <Typography sx={{ fontSize: ".85rem", color: "#475569", fontWeight: 600 }}>{c}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </FadeUp>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── PRICING SECTION ──────────────────────────────── */}
      <Box sx={{ py: { xs: 12, md: 18 }, bgcolor: "#F8FAFC" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <FadeUp>
              <Typography sx={{ fontSize: ".85rem", fontWeight: 800, color: "#22C55E", textTransform: "uppercase", letterSpacing: 2, mb: 2 }}>
                Dành cho Chủ sân chuyên nghiệp
              </Typography>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Typography sx={{ fontWeight: 950, fontSize: { xs: "2.2rem", md: "3rem" }, color: "#0F172A", letterSpacing: "-0.04em", mb: 2 }}>
                 Lựa chọn gói quản trị phù hợp
              </Typography>
            </FadeUp>
          </Box>

          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {loadingPlans ? (
              <Box sx={{ py: 10, textAlign: 'center', width: '100%' }}><CircularProgress /></Box>
            ) : plans.slice(0, 3).map((plan: any, i: number) => {
              const tKey = getTierKey(plan.name, i);
              const conf = TIER_CONFIG[tKey] || TIER_CONFIG.free;
              const opts = plan.options || [];
              if (!opts.length) return null;
              
              const sortedOpts = [...opts].sort((a: any, b: any) => a.price - b.price);
              const isPro = tKey === 'pro';

              return (
                <Grid item xs={12} sm={6} md={4} key={plan.id} sx={{ display: 'flex' }}>
                   <FadeUp delay={0.2 + (i * 0.1)} sx={{ flex: 1, display: 'flex' }}>
                    <Card sx={{ 
                      flex: 1, borderRadius: 0, display: 'flex', flexDirection: 'column',
                      border: `1px solid #E2E8F0`,
                      borderTop: `4px solid ${conf.color}`,
                      position: 'relative', overflow: 'visible',
                      bgcolor: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s',
                      "&:hover": { transform: "translateY(-8px)", boxShadow: `0 12px 32px rgba(0,0,0,0.08)` }
                    }}>
                      {isPro && (
                        <Box sx={{ 
                          position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
                          bgcolor: conf.color, color: 'white', px: 2, py: 0.5, 
                          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
                          zIndex: 10
                        }}>
                          Phổ biến nhất
                        </Box>
                      )}

                      <Box sx={{ p: 4, textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                         <Box sx={{ 
                           width: 52, height: 52, borderRadius: 0, background: conf.gradient, 
                           color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                           mx: 'auto', mb: 2, boxShadow: `0 4px 12px ${conf.color}30`
                         }}>
                           {conf.icon}
                         </Box>
                         <Typography sx={{ fontWeight: 950, fontSize: '1.25rem', color: '#0F172A', mb: 0.5, fontFamily: '"Sora", sans-serif' }}>
                           {plan.name}
                         </Typography>
                         <Typography sx={{ fontSize: '0.85rem', color: '#64748B', minHeight: 40 }}>
                           {plan.description}
                         </Typography>
                      </Box>

                      <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={1} sx={{ mb: 4 }}>
                          {sortedOpts.map((opt: any) => (
                            <Box key={opt.id} sx={{ 
                              p: 2, borderRadius: 0, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: conf.color, bgcolor: '#fff' }
                            }}>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                                {durationLabel(opt.duration_months)}
                              </Typography>
                              <Typography sx={{ fontSize: '1.1rem', fontWeight: 950, color: conf.color }}>
                                {fmt(opt.price)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
                        
                        <Stack spacing={1.5} sx={{ mb: 4 }}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Storefront sx={{ fontSize: 16, color: conf.color }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                              <b>{sortedOpts[0].max_venues}</b> Cơ sở · <b>{sortedOpts[0].max_courts_per_venue}</b> Sân/Cơ sở
                            </Typography>
                          </Stack>
                          {Object.entries(sortedOpts[0].features || {}).map(([k, v]: any) => (
                            <Stack key={k} direction="row" spacing={1.2} alignItems="center">
                              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {v ? (
                                  <CheckCircle sx={{ fontSize: 18, color: conf.color }} />
                                ) : (
                                  <Cancel sx={{ fontSize: 18, color: '#CBD5E1' }} />
                                )}
                              </Box>
                              <Typography sx={{ 
                                fontWeight: 600, fontSize: '0.85rem', 
                                color: v ? '#334155' : '#94A3B8'
                              }}>
                                {FEATURE_LABELS[k] || k}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
 
                        <Box sx={{ mt: 'auto' }}>
                          <Button 
                            fullWidth 
                            component={Link}
                            to="/register-owner"
                            variant="contained"
                            size="large"
                            sx={{ 
                              py: 1.8, borderRadius: 0, fontWeight: 900, fontSize: '0.9rem',
                              textTransform: 'none',
                              background: conf.gradient,
                              boxShadow: `0 4px 12px ${conf.color}30`,
                              transition: 'all 0.3s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 20px ${conf.color}40`,
                                background: conf.gradient, filter: 'brightness(1.1)'
                              }
                            }}
                          >
                            Chọn gói này
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                   </FadeUp>
                </Grid>
              )
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ──────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 12, md: 18 },
          overflow: "hidden",
          background: "linear-gradient(145deg,#040D08 0%,#0A1628 50%,#030D08 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: `linear-gradient(rgba(34,197,94,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,.3) 1px,transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <FadeUp>
            <Box sx={{ display: "inline-block", px: 3, py: 0.8, mb: 3, borderRadius: 10, border: "1px solid rgba(34,197,94,.3)", bgcolor: "rgba(34,197,94,.08)" }}>
              <Typography sx={{ fontSize: ".78rem", fontWeight: 800, color: "#4ADE80", textTransform: "uppercase", letterSpacing: 1.4 }}>
                Tham gia miễn phí ngay hôm nay
              </Typography>
            </Box>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Typography
              sx={{
                fontWeight: 950,
                fontSize: { xs: "2.2rem", md: "3.6rem" },
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                mb: 3,
                fontFamily: '"Sora","Plus Jakarta Sans",system-ui,sans-serif',
                background: "linear-gradient(160deg,#fff 20%,rgba(255,255,255,.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sẵn sàng cho trận đấu tiếp theo?
            </Typography>
          </FadeUp>
          <FadeUp delay={0.3}>
            <Button
              component={Link}
              to="/marketplace"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 7, py: 2.2, borderRadius: 3, fontWeight: 900, fontSize: "1.1rem", textTransform: "none",
                background: "linear-gradient(135deg,#16A34A,#22C55E)",
                boxShadow: "0 0 48px rgba(34,197,94,.35)",
                transition: "all .3s",
                "&:hover": { transform: "scale(1.05)", boxShadow: "0 0 72px rgba(34,197,94,.55)" },
              }}
            >
              Đặt lịch ngay
            </Button>
          </FadeUp>

          <Grid container spacing={2.5} sx={{ mt: { xs: 7, md: 11 } }}>
            {ctaItems.map((item, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Stack
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 3, borderRadius: 4, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.04)",
                    backdropFilter: "blur(12px)", transition: "all .3s",
                    "&:hover": { background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)", transform: "translateY(-4px)" },
                  }}
                >
                  <Box sx={{ color: "#22C55E" }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: ".85rem", fontWeight: 700, color: "rgba(255,255,255,.8)", letterSpacing: 0.3 }}>
                    {item.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
