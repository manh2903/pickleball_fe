import { Box, Container, Typography, Button, Grid, Stack, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Search,
  DateRange,
  LocationOn,
  VerifiedUser,
  ArrowForward,
  CheckCircle,
  Bolt,
  WorkspacePremium,
  Spa,
  Storefront,
  Cancel,
  EmojiEvents,
  TrendingUp,
  Devices,
  Star,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "@/api/subscriptionApi";
import { keyframes } from "@mui/system";
import { useEffect, useState, useRef, useMemo } from "react";

/* ── Fonts (ensure these are in index.html) ───────────────────
   <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
 ─────────────────────────────────────────────────────────── */

const marquee = keyframes`from{transform:translateX(0)}to{transform:translateX(-50%)}`;
const floatY = keyframes`0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-16px) rotate(1deg)}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(44px)}to{opacity:1;transform:translateY(0)}`;
const scaleIn = keyframes`from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}`;
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.45)}50%{box-shadow:0 0 0 10px rgba(22,163,74,0)}`;
const iconBounce = keyframes`
  0% { transform: rotate(0deg); }
  50% { transform: rotate(8deg); }
  100% { transform: rotate(0deg); }
`;
const colorJump = keyframes`
  0%, 100% { color: inherit; transform: translateY(0); }
  20% { color: #16A34A; transform: translateY(-10px); text-shadow: 0 10px 20px rgba(22,163,74,0.3); }
  40% { color: inherit; transform: translateY(0); }
`;
const strokeJump = keyframes`
  0%, 100% { WebkitTextStrokeColor: #16A34A; color: transparent; transform: translateY(0); }
  20% { WebkitTextStrokeColor: #4ADE80; color: #16A34A; transform: translateY(-10px); filter: drop-shadow(0 0 10px rgba(74,222,128,0.5)); }
  40% { WebkitTextStrokeColor: #16A34A; color: transparent; transform: translateY(0); }
`;

/* ── Observer-based FadeUp ───────────────────────────────── */
const FadeUp = ({ delay = 0, children, sx = {} }: { delay?: number; children: React.ReactNode; sx?: any }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        animation: visible ? `${slideUp} .7s cubic-bezier(.22,1,.36,1) ${delay}s forwards` : "none",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

/* ── Observer-based Counter ──────────────────────────────── */
const Counter = ({ target, duration = 1800 }: { target: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  const match = target.match(/^(\d+(?:\.\d+)?)/);
  const num = match ? parseFloat(match[1]) : 0;
  const suffix = target.replace(/^(\d+(?:\.\d+)?)/, "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = 60;
    const inc = num / total;
    const t = setInterval(() => {
      frame++;
      if (frame >= total) {
        setCount(num);
        clearInterval(t);
      } else setCount(inc * frame);
    }, duration / total);
    return () => clearInterval(t);
  }, [num, duration, active]);

  return (
    <Box component="span" ref={ref}>
      {Number.isInteger(num) ? Math.floor(count).toLocaleString() : count.toFixed(1)}
      {suffix}
    </Box>
  );
};

/* ── Animated Text Component ─────────────────────────────── */
const AnimatedHeroText = ({ text, outline = false, baseDelay = 0.1 }: { text: string; outline?: boolean; baseDelay?: number }) => {
  const letters = useMemo(() => text.split(""), [text]);
  return (
    <Box sx={{ display: "flex", gap: "0.02em" }}>
      {letters.map((char, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            display: "inline-block",
            animation: `${outline ? strokeJump : colorJump} 3s ease-in-out infinite`,
            animationDelay: `${baseDelay + i * 0.15}s`,
            WebkitTextStroke: outline ? "3px #16A34A" : "none",
            color: outline ? "transparent" : "#0F172A",
          }}
        >
          {char}
        </Box>
      ))}
    </Box>
  );
};

/* ── Data ─────────────────────────────────────────────────── */
const features = [
  {
    title: "Tìm sân dễ dàng",
    tag: "DISCOVER",
    num: "01",
    desc: "Bản đồ trực quan, lọc theo khu vực, giá tiền và tiện ích. Tìm sân trong vài giây chóng mặt với công nghệ lọc hiện đại nhất.",
    icon: <LocationOn sx={{ fontSize: 30 }} />,
    accent: "#16A34A",
    light: "#F0FDF4",
    border: "#BBF7D0",
    checks: ["Lọc theo vị trí", "Xem ảnh sân thực tế", "So sánh giá"],
  },
  {
    title: "Đặt lịch 24/7",
    tag: "BOOK",
    num: "02",
    desc: "Đặt sân bất kỳ lúc nào, thanh toán linh hoạt qua VNPay, MoMo hoặc tiền mặt — mọi lúc, mọi nơi không rắc rối.",
    icon: <DateRange sx={{ fontSize: 30 }} />,
    accent: "#0284C7",
    light: "#F0F9FF",
    border: "#BAE6FD",
    checks: ["Đặt trước 30 ngày", "Hủy miễn phí 2h", "Nhắc lịch tự động"],
  },
  {
    title: "Quản lý chuyên nghiệp",
    tag: "MANAGE",
    num: "03",
    desc: "Dashboard toàn diện cho chủ sân: lịch đặt, nhân viên, doanh thu theo thời gian thực — kiểm soát tối đa.",
    icon: <VerifiedUser sx={{ fontSize: 30 }} />,
    accent: "#D97706",
    light: "#FFFBEB",
    border: "#FDE68A",
    checks: ["Báo cáo doanh thu", "Quản lý nhân viên", "Thông báo đặt sân"],
  },
];

const stats = [
  { value: "500+", label: "Sân đấu" },
  { value: "10000+", label: "Người chơi" },
  { value: "4.9★", label: "Đánh giá" },
  { value: "34/34", label: "Tỉnh thành" },
];

const tickerItems = ["PICKLEBALL", "ĐẶT SÂN NHANH", "500+ SÂN", "TOÀN QUỐC", "24/7", "THANH TOÁN LINH HOẠT", "CỘNG ĐỒNG", "PICKLEBALL"];

const FEATURE_LABELS: Record<string, string> = {
  analytics: "Báo cáo doanh thu",
  staff_management: "Quản lý nhân viên",
  custom_coupons: "Tạo mã khuyến mãi",
};

const TIER_CONFIG: Record<string, any> = {
  free: { color: "#64748B", light: "#F8FAFC", border: "#E2E8F0", icon: <Spa sx={{ fontSize: 22 }} />, label: "STARTER" },
  pro: { color: "#16A34A", light: "#F0FDF4", border: "#86EFAC", icon: <Bolt sx={{ fontSize: 22 }} />, label: "PRO" },
  ultra: { color: "#7C3AED", light: "#F5F3FF", border: "#C4B5FD", icon: <WorkspacePremium sx={{ fontSize: 22 }} />, label: "ULTRA" },
};

const getTierKey = (name: string, i: number) => {
  const n = (name || "").toLowerCase();
  if (n.includes("ultra") || i === 2) return "ultra";
  if (n.includes("pro") || i === 1) return "pro";
  return "free";
};

const fmt = (v: any) =>
  parseFloat(v) === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const durationLabel = (m: number) => {
  if (m >= 120) return "Vĩnh viễn";
  if (m === 12) return "1 Năm";
  return `${m} Tháng`;
};

/* ═══════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => subscriptionApi.getPlans(),
  });
  const plans = Array.isArray(plansRes) ? plansRes : (plansRes as any)?.data || [];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ overflow: "hidden", bgcolor: "#FFFFFF", color: "#0F172A", fontFamily: '"DM Sans",sans-serif' }}>
      {/* TICKER */}
      <Box sx={{ bgcolor: "#15803D", py: 1, overflow: "hidden" }}>
        <Box sx={{ display: "flex", width: "max-content", animation: `${marquee} 22s linear infinite` }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 3, px: 4 }}>
              <Typography sx={{ fontWeight: 900, fontSize: ".85rem", color: "#fff", whiteSpace: "nowrap", letterSpacing: 2 }}>{t}</Typography>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "rgba(255,255,255,.8)" }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "auto", md: "90vh" },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          pt: { xs: 8, md: 0 },
          pb: { xs: 10, md: 0 },
          bgcolor: "#F9FAFB",
        }}
      >
        {/* Dot grid */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.4,
            backgroundImage: `radial-gradient(circle,#CBD5E1 1px,transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* LEFT */}
            <Grid item xs={12} md={7}>
              <FadeUp delay={0}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 4,
                    px: 2.5,
                    py: 1,
                    border: "1.5px solid #BBF7D0",
                    borderRadius: 10,
                    bgcolor: "#F0FDF4",
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#16A34A", animation: `${pulse} 2s infinite` }} />
                  <Typography sx={{ fontWeight: 900, fontSize: ".78rem", color: "#15803D", letterSpacing: 2, textTransform: "uppercase" }}>
                    #1 Pickleball Platform Việt Nam
                  </Typography>
                </Box>
              </FadeUp>

              <FadeUp delay={0.1}>
                {/* ANIMATED ĐAM MÊ */}
                <Box
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "5.5rem", sm: "7rem", md: "9rem", lg: "11rem" },
                    lineHeight: 1.1,
                    letterSpacing: "-.025em",
                    textTransform: "uppercase",
                    mb: 1.5,
                  }}
                >
                  <AnimatedHeroText text="ĐAM" />
                  <AnimatedHeroText text="MÊ" outline baseDelay={0.5} />
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "2.4rem", sm: "3rem", md: "3.8rem", lg: "4.5rem" },
                    lineHeight: 1,
                    letterSpacing: "-.01em",
                    textTransform: "uppercase",
                    color: "#94A3B8",
                    mb: 5,
                  }}
                >
                  Đặt sân dễ dàng
                </Typography>
              </FadeUp>

              <FadeUp delay={0.22}>
                <Typography sx={{ color: "#475569", lineHeight: 1.75, fontSize: "1.05rem", maxWidth: 480, mb: 5 }}>
                  Hàng nghìn sân Pickleball chất lượng cao trên toàn quốc. Đặt lịch nhanh, thanh toán linh hoạt, kết nối cộng đồng.
                </Typography>
              </FadeUp>

              <FadeUp delay={0.32}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 8 }}>
                  <Button
                    component={Link}
                    to="/marketplace"
                    size="large"
                    startIcon={<Search />}
                    endIcon={<ArrowForward sx={{ fontSize: 17 }} />}
                    sx={{
                      px: 5,
                      py: 2,
                      bgcolor: "#16A34A",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "1rem",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      borderRadius: 1.5,
                      boxShadow: "0 8px 32px rgba(22,163,74,.3)",
                      transition: "all .25s",
                      "&:hover": { bgcolor: "#15803D", transform: "translateY(-3px)", boxShadow: "0 16px 40px rgba(22,163,74,.4)" },
                    }}
                  >
                    Khám phá ngay
                  </Button>
                  <Button
                    component={Link}
                    to="/register-owner"
                    size="large"
                    sx={{
                      px: 5,
                      py: 2,
                      border: "2px solid #E2E8F0",
                      color: "#334155",
                      fontWeight: 900,
                      fontSize: "1rem",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      borderRadius: 1.5,
                      bgcolor: "#fff",
                      transition: "all .25s",
                      "&:hover": { border: "2px solid #16A34A", color: "#16A34A", bgcolor: "#F0FDF4", transform: "translateY(-3px)" },
                    }}
                  >
                    Dành cho chủ sân
                  </Button>
                </Stack>
              </FadeUp>

              {/* Stats */}
              <FadeUp delay={0.44}>
                <Box
                  sx={{
                    display: "flex",
                    width: "fit-content",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "rgba(255,255,255,.9)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,.06)",
                  }}
                >
                  {stats.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        px: { xs: 2, md: 3.5 },
                        py: 2.5,
                        borderRight: i < stats.length - 1 ? "1.5px solid #E2E8F0" : "none",
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.8rem" }, color: "#16A34A", lineHeight: 1 }}>
                        <Counter target={s.value} />
                      </Typography>
                      <Typography
                        sx={{ fontSize: ".62rem", color: "#475569", fontWeight: 700, mt: 0.5, textTransform: "uppercase", letterSpacing: 1 }}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </FadeUp>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center" }}>
              <Box sx={{ position: "relative", width: "110%" }}>
                <Box sx={{ animation: `${scaleIn} 1s cubic-bezier(.22,1,.36,1) .4s forwards`, opacity: 0 }}>
                  <Box
                    component="img"
                    src="https://cdn.shopvnb.com/uploads/images/bai_viet/tong-hop-dan-pickleball-hot-girl-8-1748226218.webp"
                    alt="Pickleball"
                    sx={{
                      width: "88%",
                      borderRadius: 0,
                      border: "4px solid #fff",
                      boxShadow: "0 40px 80px rgba(15,23,42,.15),0 0 0 1px #E2E8F0",
                      display: "block",
                      transform: "rotate(-10deg)",
                    }}
                  />
                  <Box
                    component="img"
                    src="https://thegioibackground.com/wp-content/uploads/2025/04/banner-pickleball-9.jpg"
                    alt="Pickleball"
                    sx={{
                      width: "88%",
                      borderRadius: 0,
                      border: "4px solid #fff",
                      boxShadow: "0 40px 80px rgba(15,23,42,.15),0 0 0 1px #E2E8F0",
                      display: "block",
                      transform: "rotate(10deg)",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Box sx={{ py: { xs: 12, md: 20 }, bgcolor: "#fff", borderTop: "1px solid #F1F5F9" }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 10 }}>
            <Box sx={{ width: 48, height: 3, bgcolor: "#16A34A", borderRadius: 4 }} />
            <Typography sx={{ fontWeight: 900, fontSize: ".8rem", color: "#64748B", letterSpacing: 3, textTransform: "uppercase" }}>
              Tại sao chọn chúng tôi
            </Typography>
          </Stack>

          <Grid container spacing={3} alignItems="stretch">
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i} sx={{ display: "flex" }}>
                <FadeUp delay={i * 0.12} sx={{ flex: 1, display: "flex" }}>
                  <Box
                    sx={{
                      p: { xs: 4, md: 5 },
                      border: `1.5px solid ${f.border}`,
                      borderRadius: 0,
                      bgcolor: f.light,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all .4s cubic-bezier(.22,1,.36,1)",
                      cursor: "default",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: `0 32px 60px rgba(15,23,42,.1)`,
                        "& .num": { opacity: 0.25 },
                        "& .ico": { animation: `${iconBounce} .4s forwards` },
                      },
                    }}
                  >
                    <Typography
                      className="num"
                      sx={{
                        position: "absolute",
                        top: -20,
                        right: 20,
                        fontWeight: 900,
                        fontSize: "9rem",
                        lineHeight: 1,
                        color: f.accent,
                        opacity: 0.3,
                        transition: "opacity .4s",
                        userSelect: "none",
                      }}
                    >
                      {f.num}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: ".7rem", color: f.accent, letterSpacing: 3, mb: 3.5, textTransform: "uppercase" }}>
                      — {f.tag}
                    </Typography>
                    <Box className="ico" sx={{ color: f.accent, mb: 3, width: "fit-content", transition: "all .4s cubic-bezier(.22,1,.36,1)" }}>
                      {f.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: "2rem", color: "#0F172A", lineHeight: 1.1, mb: 2, textTransform: "uppercase" }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: "#475569", lineHeight: 1.75, fontSize: ".92rem", mb: 4, flex: 1 }}>{f.desc}</Typography>

                    <Box sx={{ borderTop: "1px solid #F1F5F9", pt: 3, mt: "auto" }}>
                      <Stack spacing={1.5}>
                        {f.checks.map((c, j) => (
                          <Stack key={j} direction="row" spacing={1.5} alignItems="center">
                            <CheckCircle sx={{ fontSize: 16, color: f.accent }} />
                            <Typography sx={{ fontSize: ".85rem", color: "#475569", fontWeight: 600 }}>{c}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </FadeUp>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* DIVIDER TAPE */}
      <Box sx={{ py: 3.5, overflow: "hidden", bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <Box sx={{ display: "flex", width: "max-content", animation: `${marquee} 40s linear infinite reverse` }}>
          {[...Array(16)].map((_, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 4, px: 5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: ".85rem", color: "#475569", letterSpacing: 3, whiteSpace: "nowrap" }}>
                ĐẶT SÂN NGAY
              </Typography>
              <Box sx={{ color: "#16A34A", fontSize: ".8rem", opacity: 1 }}>◆</Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* PRICING */}
      <Box sx={{ py: { xs: 12, md: 20 }, bgcolor: "#F8FAFC" }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 6 }}>
            <Box sx={{ width: 48, height: 3, bgcolor: "#16A34A", borderRadius: 4 }} />
            <Typography sx={{ fontWeight: 900, fontSize: ".8rem", color: "#64748B", letterSpacing: 3, textTransform: "uppercase" }}>
              Gói quản trị
            </Typography>
          </Stack>

          <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 12 }}>
            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "3.5rem", md: "5.5rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-.025em",
                  textTransform: "uppercase",
                  color: "#0F172A",
                }}
              >
                LỰA CHỌN GÓI
                <br />
                <Box component="span" sx={{ color: "transparent", WebkitTextStroke: "2px #16A34A" }}>
                  QUẢN TRỊ
                </Box>
                <br />
                PHÙ HỢP
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography sx={{ color: "#64748B", fontSize: ".95rem", lineHeight: 1.7, maxWidth: 340 }}>
                Mọi gói đều bao gồm hỗ trợ kỹ thuật 24/7. Nâng cấp hoặc hủy bất cứ lúc nào.
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={3} alignItems="stretch">
            {loadingPlans ? (
              <Box sx={{ py: 10, textAlign: "center", width: "100%" }}>
                <CircularProgress sx={{ color: "#16A34A" }} />
              </Box>
            ) : (
              plans.slice(0, 3).map((plan: any, i: number) => {
                const tKey = getTierKey(plan.name, i);
                const conf = TIER_CONFIG[tKey] || TIER_CONFIG.free;
                const opts = plan.options || [];
                if (!opts.length) return null;
                const sorted = [...opts].sort((a: any, b: any) => a.price - b.price);
                const isPro = tKey === "pro";
                return (
                  <Grid item xs={12} md={4} key={plan.id} sx={{ display: "flex" }}>
                    <FadeUp delay={0.1 + i * 0.12} sx={{ flex: 1, display: "flex" }}>
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          border: isPro ? `2px solid ${conf.color}` : "1.0px solid #E2E8F0",
                          borderTop: isPro ? `4px solid ${conf.color}` : `3px solid ${conf.color}`,
                          borderRadius: 0,
                          bgcolor: "#fff",
                          position: "relative",
                          overflow: "visible",
                          minHeight: { md: 520 },
                          boxShadow: isPro ? `0 16px 48px rgba(22,163,74,.12)` : "0 2px 12px rgba(15,23,42,.04)",
                          transition: "all .3s",
                          animation: `${scaleIn} .6s cubic-bezier(.22,1,.36,1) ${0.1 + i * 0.12}s forwards`,
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: isPro ? `0 24px 60px rgba(22,163,74,.16)` : `0 32px 64px rgba(15,23,42,.1)`,
                          },
                        }}
                      >
                        {isPro && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -18,
                              left: "50%",
                              transform: "translateX(-50%)",
                              bgcolor: conf.color,
                              color: "#fff",
                              px: 2.5,
                              py: 0.6,
                              borderRadius: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography sx={{ fontWeight: 900, fontSize: ".72rem", letterSpacing: 2, textTransform: "uppercase" }}>
                              Phổ biến nhất
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ p: 4, borderBottom: "1px solid #F1F5F9", textAlign: "center" }}>
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 0,
                              bgcolor: conf.light,
                              color: conf.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 2,
                              border: `1.5px solid ${conf.border}`,
                            }}
                          >
                            {conf.icon}
                          </Box>
                          <Typography
                            sx={{ fontWeight: 900, fontSize: ".7rem", color: conf.color, letterSpacing: 3, mb: 0.5, textTransform: "uppercase" }}
                          >
                            {conf.label}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#0F172A", textTransform: "uppercase" }}>
                            {plan.name}
                          </Typography>
                          <Typography sx={{ fontSize: ".82rem", color: "#64748B", mt: 0.5, minHeight: 36 }}>{plan.description}</Typography>
                        </Box>

                        <Box sx={{ p: 3.5, flex: 1, display: "flex", flexDirection: "column" }}>
                          <Stack spacing={1.5} sx={{ mb: 4, flex: 1 }}>
                            {sorted.map((opt: any) => (
                              <Box
                                key={opt.id}
                                sx={{
                                  p: 2,
                                  borderRadius: 0,
                                  border: "1.5px solid #E2E8F0",
                                  bgcolor: "#FAFAFA",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  transition: "all .2s",
                                  "&:hover": { borderColor: conf.color, bgcolor: conf.light },
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: ".78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}
                                >
                                  {durationLabel(opt.duration_months)}
                                </Typography>
                                <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", color: conf.color }}>{fmt(opt.price)}</Typography>
                              </Box>
                            ))}
                          </Stack>

                          <Box sx={{ borderTop: "1px dashed #E2E8F0", pt: 3, mb: 4 }}>
                            <Stack spacing={1.5}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Storefront sx={{ fontSize: 15, color: conf.color }} />
                                <Typography sx={{ fontSize: ".82rem", fontWeight: 700, color: "#475569" }}>
                                  <b style={{ color: "#0F172A" }}>{sorted[0].max_venues}</b> Cơ sở ·{" "}
                                  <b style={{ color: "#0F172A" }}>{sorted[0].max_courts_per_venue}</b> Sân/Cơ sở
                                </Typography>
                              </Stack>
                              {Object.entries(sorted[0].features || {}).map(([k, v]: any) => (
                                <Stack key={k} direction="row" spacing={1.5} alignItems="center">
                                  {v ? <CheckCircle sx={{ fontSize: 16, color: conf.color }} /> : <Cancel sx={{ fontSize: 16, color: "#E2E8F0" }} />}
                                  <Typography sx={{ fontSize: ".82rem", fontWeight: 600, color: v ? "#334155" : "#CBD5E1" }}>
                                    {FEATURE_LABELS[k] || k}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>

                          <Box sx={{ mt: "auto" }}>
                            <Button
                              fullWidth
                              component={Link}
                              to="/register-owner"
                              sx={{
                                py: 1.8,
                                borderRadius: 0,
                                bgcolor: isPro ? conf.color : "transparent",
                                color: isPro ? "#fff" : conf.color,
                                border: isPro ? "none" : `2px solid ${conf.color}`,
                                fontWeight: 900,
                                fontSize: ".95rem",
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                transition: "all .25s",
                                "&:hover": {
                                  bgcolor: conf.color,
                                  color: "#fff",
                                  transform: "translateY(-2px)",
                                  boxShadow: `0 8px 24px ${conf.color}30`,
                                },
                              }}
                            >
                              Chọn gói này
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </FadeUp>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          py: { xs: 14, md: 22 },
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(145deg,#052E16 0%,#14532D 50%,#052E16 100%)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 900,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(74,222,128,.12) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <FadeUp>
            <Box
              sx={{
                display: "inline-block",
                px: 3,
                py: 0.8,
                mb: 4,
                border: "1px solid rgba(74,222,128,.3)",
                borderRadius: 10,
                bgcolor: "rgba(74,222,128,.08)",
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: ".75rem", color: "#4ADE80", letterSpacing: 2.5, textTransform: "uppercase" }}>
                Tham gia miễn phí ngay hôm nay
              </Typography>
            </Box>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: "3.5rem", md: "7rem", lg: "9rem" },
                lineHeight: 1.1,
                letterSpacing: "-.025em",
                textTransform: "uppercase",
                color: "#fff",
                mb: 3,
              }}
            >
              SẴN SÀNG
              <br />
              <Box component="span" sx={{ color: "#4ADE80" }}>
                ĐẶT LỊCH
              </Box>
              <br />
              NGAY?
            </Typography>
          </FadeUp>
          <FadeUp delay={0.2}>
            <Typography sx={{ color: "rgba(255,255,255,.7)", fontSize: "1rem", mb: 7, lineHeight: 1.7 }}>
              Tham gia cùng hơn 10,000 người chơi pickleball trên toàn Việt Nam.
            </Typography>
          </FadeUp>
          <FadeUp delay={0.3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} justifyContent="center">
              <Button
                component={Link}
                to="/marketplace"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 7,
                  py: 2.2,
                  bgcolor: "#4ADE80",
                  color: "#052E16",
                  fontWeight: 900,
                  fontSize: "1.05rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  borderRadius: 0,
                  boxShadow: "0 0 48px rgba(74,222,128,.3)",
                  transition: "all .3s",
                  "&:hover": { bgcolor: "#86EFAC", transform: "scale(1.05)", boxShadow: "0 0 72px rgba(74,222,128,.5)" },
                }}
              >
                Đặt lịch ngay
              </Button>
              <Button
                component={Link}
                to="/register-owner"
                size="large"
                sx={{
                  px: 7,
                  py: 2.2,
                  border: "2px solid rgba(255,255,255,.2)",
                  color: "rgba(255,255,255,.75)",
                  fontWeight: 900,
                  fontSize: "1.05rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  borderRadius: 0,
                  transition: "all .3s",
                  "&:hover": { border: "2px solid #4ADE80", color: "#4ADE80", transform: "scale(1.05)" },
                }}
              >
                Đăng ký chủ sân
              </Button>
            </Stack>
          </FadeUp>
          <FadeUp delay={0.4}>
            <Grid container spacing={2} sx={{ mt: { xs: 8, md: 12 } }} justifyContent="center" alignItems="stretch">
              {[
                { icon: <TrendingUp sx={{ fontSize: 22 }} />, label: "Tăng trưởng nhanh", sub: "+40% mỗi quý" },
                { icon: <Devices sx={{ fontSize: 22 }} />, label: "Đa nền tảng", sub: "Web & Mobile" },
                { icon: <Star sx={{ fontSize: 22 }} />, label: "Dịch vụ 5 sao", sub: "4.9/5 đánh giá" },
                { icon: <EmojiEvents sx={{ fontSize: 22 }} />, label: "Top 1 VN", sub: "#1 Pickleball" },
              ].map((item, i) => (
                <Grid item xs={6} md={3} key={i} sx={{ display: "flex" }}>
                  <Box
                    sx={{
                      p: 3,
                      flex: 1,
                      border: "1px solid rgba(255,255,255,.15)",
                      borderRadius: 0,
                      bgcolor: "rgba(255,255,255,.07)",
                      backdropFilter: "blur(12px)",
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "left",
                      transition: "all .3s",
                      "&:hover": { border: "1px solid rgba(74,222,128,.4)", bgcolor: "rgba(74,222,128,.1)", transform: "translateY(-4px)" },
                    }}
                  >
                    <Box sx={{ color: "#4ADE80", mb: 1.5 }}>{item.icon}</Box>
                    <Typography sx={{ fontWeight: 900, fontSize: ".95rem", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: ".72rem", color: "rgba(255,255,255,.7)", fontWeight: 600, mt: "auto" }}>{item.sub}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </FadeUp>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
