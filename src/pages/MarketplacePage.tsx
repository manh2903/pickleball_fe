import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  Fade,
  Zoom,
  Paper,
  Pagination,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { Search, LocationOn, SportsTennis, FilterList, Close, RestartAlt, Star, ChevronRight, FavoriteBorder, Verified } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { venueApi } from "@/api/venueApi";
import { locationApi } from "@/api/locationApi";
import { AMENITIES_LIST } from "@/constants/amenities";
import { getImageUrl } from "@/utils/imageUtils";

const AMENITIES_OPTIONS = AMENITIES_LIST;
const PAGE_SIZE = 8; // 2 rows × 4 cols

const VenueCard = ({ venue }: { venue: any }) => {
  const amenities = venue.amenities || [];
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          "& .venue-media": { transform: "scale(1.05)" },
        },
      }}
    >
      <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
        <CardMedia
          className="venue-media"
          component="img"
          image={getImageUrl(venue.images?.[0])}
          alt={venue.name}
          sx={{ height: "100%", transition: "transform 0.6s" }}
        />
        <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 1 }}>
          <Chip
            icon={<Verified sx={{ fontSize: "1rem !important" }} />}
            label="Đã xác thực"
            size="small"
            sx={{ fontWeight: 800, bgcolor: "rgba(255,255,255,0.95)", color: "primary.main", border: "1px solid", borderColor: "primary.light" }}
          />
        </Box>
        <IconButton sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.7)", "&:hover": { bgcolor: "white" } }}>
          <FavoriteBorder fontSize="small" />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ fontWeight: 900, mb: 0, lineHeight: 1.2, fontFamily: "Times New Roman", fontSize: "1.25rem" }}
          >
            {venue.name}
          </Typography>
        </Stack>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, color: "#64748B" }}>
          <LocationOn sx={{ fontSize: "1rem", mr: 0.5, color: "primary.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
            {venue.wardState?.ten || "..."}, {venue.provinceState?.ten_tinh || "..."}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#FEF9C3", px: 1, py: 0.25, borderRadius: 1 }}>
            <Star sx={{ fontSize: "1rem", color: "#CA8A04", mr: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#854D0E" }}>
              {venue.avg_rating || "5.0"}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            ({venue.review_count || 0} đánh giá)
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ height: 12, my: "auto" }} />
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {venue.court_count} sân
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 0.5 }}>
          {amenities.slice(0, 3).map((item: string) => (
            <Chip
              key={item}
              label={item}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
            />
          ))}
        </Stack>

        <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: -0.5 }}>
              CHỈ TỪ
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
              {new Intl.NumberFormat("vi-VN").format(venue.default_price_morning)}đ
              <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 500, color: "text.secondary" }}>
                /h
              </Typography>
            </Typography>
          </Box>
          <Button
            component={Link}
            to={`/venues/${venue.slug}`}
            variant="contained"
            endIcon={<ChevronRight />}
            sx={{
              borderRadius: 1.5,
              px: 2,
              fontWeight: 800,
              boxShadow: "0 4px 6px -1px rgba(34,197,94,0.3)",
            }}
          >
            Chi tiết
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Blank filter state
const BLANK_FILTERS = {
  search: "",
  province_id: "",
  ward_id: "",
  price_min: 0,
  price_max: 1000000,
  amenities: [] as string[],
  min_rating: 0,
};

const MarketplacePage = () => {
  // Automatically scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  // "Applied" filters → used in API query key
  const [appliedFilters, setAppliedFilters] = useState(BLANK_FILTERS);

  // "Draft" filters → edited in drawer/search bar, NOT sent to API until Apply
  const [draftFilters, setDraftFilters] = useState(BLANK_FILTERS);

  // Locations Query
  const { data: provinceRes } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => locationApi.getProvinces(),
  });
  const provinces = provinceRes?.data || [];

  const { data: wardRes, isLoading: isWardsLoading } = useQuery({
    queryKey: ["wards", draftFilters.province_id],
    queryFn: () => locationApi.getWards(draftFilters.province_id),
    enabled: !!draftFilters.province_id,
  });
  const wards = wardRes?.data || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["venues", appliedFilters, page],
    queryFn: () => venueApi.getVenues({ ...appliedFilters, page, limit: PAGE_SIZE }),
  });

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
    setDrawerOpen(false);
  }, [draftFilters]);

  const handleSearchApply = () => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  };

  const handleDraftAmenityChange = (amenity: string) => {
    setDraftFilters((prev) => {
      const newAmenities = prev.amenities.includes(amenity) ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleProvinceChange = (province_id: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      province_id,
      ward_id: "",
    }));
  };

  const resetAll = () => {
    setDraftFilters({ ...BLANK_FILTERS });
    setAppliedFilters({ ...BLANK_FILTERS });
    setPage(1);
    setDrawerOpen(false);
  };

  const totalPages = Math.ceil((data?.data?.total || 0) / PAGE_SIZE);

  const getAppliedProvinceName = () => {
    if (!appliedFilters.province_id) return "";
    const p = provinces.find((p: any) => p.ma_tinh === appliedFilters.province_id);
    return p?.ten_tinh || "";
  };

  const getAppliedWardName = () => {
    if (!appliedFilters.ward_id) return "";
    // This is tricky as wards might not be loaded for applied filter if not in draft
    // But usually for chip display it's okay
    return "Phường/Xã";
  };

  return (
    <Box sx={{ bgcolor: "#F1F5F9", minHeight: "100vh", pb: 8 }}>
      {/* Search Hero Section */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          background: "linear-gradient(135deg, #064E3B 0%, #065F46 100%)",
          color: "white",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.1)",
            filter: "blur(80px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(5, 150, 105, 0.1)",
            filter: "blur(60px)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, mb: 2, textAlign: "center", fontFamily: "Times New Roman", fontSize: { xs: "2.5rem", md: "4rem" } }}
              >
                Sân Chơi Pickleball Hub ✨
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "center", mb: 8, opacity: 0.9, fontWeight: 400, maxWidth: 700, mx: "auto", lineHeight: 1.6 }}>
                Tìm kiếm và đặt lịch hàng trăm cụm sân chuẩn quốc tế.
              </Typography>
            </Box>
          </Fade>

          <Zoom in style={{ transitionDelay: "300ms" }}>
            <Paper
              sx={{
                p: 1,
                borderRadius: 2,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                maxWidth: 1000,
                mx: "auto",
                bgcolor: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Bạn muốn chơi ở đâu? (Tên sân, địa chỉ...)"
                    variant="standard"
                    value={draftFilters.search}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" sx={{ ml: 2, mr: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ px: 2, py: 1, "& input": { fontWeight: 600, color: "#1E293B" } }}
                  />
                </Grid>
                <Grid item xs={6} md={3} sx={{ borderLeft: { md: "1px solid #E2E8F0" } }}>
                  <FormControl variant="standard" fullWidth sx={{ px: 2, pt: 0.5 }}>
                    <Autocomplete
                      id="province-autocomplete"
                      options={[{ ma_tinh: "", ten_tinh: "Tất cả khu vực" }, ...provinces]}
                      getOptionLabel={(option) => option.ten_tinh}
                      isOptionEqualToValue={(option, value) => option.ma_tinh === value.ma_tinh}
                      value={
                        draftFilters.province_id === ""
                          ? { ma_tinh: "", ten_tinh: "Tất cả khu vực" }
                          : provinces.find((p: any) => p.ma_tinh === draftFilters.province_id) || { ma_tinh: "", ten_tinh: "Tất cả khu vực" }
                      }
                      onChange={(_, newValue) => handleProvinceChange(newValue ? newValue.ma_tinh : "")}
                      disableClearable={draftFilters.province_id === ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tỉnh/Thành phố"
                          variant="standard"
                          InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                          }}
                          InputLabelProps={{
                            sx: { fontWeight: 700, color: "text.secondary" },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiInputBase-input": { fontWeight: 700, color: "#1E293B", py: "6px" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={2} sx={{ borderLeft: { md: "1px solid #E2E8F0" } }}>
                  <Button
                    fullWidth
                    size="large"
                    onClick={() => setDrawerOpen(true)}
                    sx={{ py: 1.5, fontWeight: 800, color: "#475569" }}
                    startIcon={<FilterList />}
                  >
                    Bộ lọc
                    {(draftFilters.amenities.length > 0 ||
                      draftFilters.min_rating > 0 ||
                      draftFilters.price_max < 1000000 ||
                      draftFilters.ward_id) && (
                      <Box
                        component="span"
                        sx={{ ml: 1, width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", display: "inline-block" }}
                      />
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSearchApply}
                    sx={{ py: 2, borderRadius: 1.5, fontWeight: 900, fontSize: "1rem" }}
                  >
                    TÌM KIẾM
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Zoom>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, fontFamily: "Times New Roman" }}>
              Sân đang sẵn sàng
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Có {isLoading ? "..." : data?.data?.total || 0} cơ sở · Trang {page}/{totalPages || 1}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {appliedFilters.province_id && (
              <Chip
                label={getAppliedProvinceName()}
                onDelete={() => {
                  setAppliedFilters((p) => ({ ...p, province_id: "" }));
                  setDraftFilters((p) => ({ ...p, province_id: "" }));
                  setPage(1);
                }}
                sx={{ fontWeight: 700 }}
              />
            )}
            {appliedFilters.ward_id && (
              <Chip
                label={getAppliedWardName()}
                onDelete={() => {
                  setAppliedFilters((p) => ({ ...p, ward_id: "" }));
                  setDraftFilters((p) => ({ ...p, ward_id: "" }));
                  setPage(1);
                }}
                sx={{ fontWeight: 700 }}
              />
            )}
            {appliedFilters.amenities.length > 0 && (
              <Chip
                label={`${appliedFilters.amenities.length} Tiện ích`}
                onDelete={() => {
                  setAppliedFilters((p) => ({ ...p, amenities: [] }));
                  setDraftFilters((p) => ({ ...p, amenities: [] }));
                  setPage(1);
                }}
                sx={{ fontWeight: 700 }}
              />
            )}
            {appliedFilters.search && (
              <Chip
                label={`"${appliedFilters.search}"`}
                onDelete={() => {
                  setAppliedFilters((p) => ({ ...p, search: "" }));
                  setDraftFilters((p) => ({ ...p, search: "" }));
                  setPage(1);
                }}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
        </Stack>

        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1.5, mb: 2 }} />
                <Skeleton width="80%" sx={{ mb: 1 }} />
                <Skeleton width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 12, bgcolor: "white", borderRadius: 2, border: "1px solid #E2E8F0" }}>
            <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
              Đã xảy ra lỗi khi kết nối máy chủ.
            </Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }} variant="outlined">
              Thử lại
            </Button>
          </Box>
        ) : data?.data?.venues?.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {data?.data?.venues?.map((venue: any) => (
                <Grid item xs={12} sm={6} md={3} key={venue.id}>
                  <VenueCard venue={venue} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, val) => {
                    setPage(val);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  color="primary"
                  size="large"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": { fontWeight: 800, borderRadius: 1.5 },
                    "& .Mui-selected": { boxShadow: "0 4px 6px -1px rgba(34,197,94,0.3)" },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 15, bgcolor: "white", borderRadius: 2, border: "1px dashed #CBD5E1" }}>
            <SportsTennis sx={{ fontSize: 80, color: "#E2E8F0", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.secondary", mb: 1 }}>
              Không tìm thấy kết quả nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Hãy thử thay đổi tiêu chí lọc hoặc xóa bộ lọc hiện tại.
            </Typography>
            <Button onClick={resetAll} variant="contained" startIcon={<RestartAlt />} sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 800 }}>
              Xóa tất cả bộ lọc
            </Button>
          </Box>
        )}
      </Container>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, p: 4, borderRadius: "20px 0 0 20px", display: "flex", flexDirection: "column" } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Bộ lọc nâng cao
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ bgcolor: "#F1F5F9" }}>
            <Close />
          </IconButton>
        </Box>

        <Stack spacing={5} sx={{ flexGrow: 1, overflowY: "auto" }}>
          {/* Location Detailed */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              Vị trí chi tiết
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="drawer-province-label">Tỉnh/Thành phố</InputLabel>
                <Select
                  labelId="drawer-province-label"
                  value={draftFilters.province_id}
                  label="Tỉnh/Thành phố"
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {provinces.map((p: any) => (
                    <MenuItem key={p.ma_tinh} value={p.ma_tinh}>
                      {p.ten_tinh}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!draftFilters.province_id || isWardsLoading}>
                <InputLabel id="drawer-ward-label">Phường/Xã</InputLabel>
                <Select
                  labelId="drawer-ward-label"
                  value={draftFilters.ward_id}
                  label="Phường/Xã"
                  onChange={(e) => setDraftFilters((p) => ({ ...p, ward_id: e.target.value }))}
                  sx={{ borderRadius: 3 }}
                  endAdornment={isWardsLoading && <CircularProgress size={20} />}
                >
                  <MenuItem value="">Tất cả phường/xã</MenuItem>
                  {wards.map((w: any) => (
                    <MenuItem key={w.ma} value={w.ma}>
                      {w.ten}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Divider />

          {/* Price Range */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              Khoảng giá (VNĐ/giờ)
            </Typography>
            <Slider
              value={[draftFilters.price_min, draftFilters.price_max]}
              onChange={(_, v: any) => setDraftFilters((p) => ({ ...p, price_min: v[0], price_max: v[1] }))}
              valueLabelDisplay="auto"
              min={0}
              max={2000000}
              step={50000}
              sx={{ color: "primary.main", "& .MuiSlider-thumb": { width: 24, height: 24, border: "4px solid white", boxShadow: 3 } }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, bgcolor: "#F1F5F9", px: 1.5, py: 0.5, borderRadius: 1 }}>
                {new Intl.NumberFormat("vi-VN").format(draftFilters.price_min)}đ
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, bgcolor: "#F1F5F9", px: 1.5, py: 0.5, borderRadius: 1 }}>
                {new Intl.NumberFormat("vi-VN").format(draftFilters.price_max)}đ
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Rating */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Đánh giá tối thiểu
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {[3, 4, 4.5].map((rate) => (
                <Chip
                  key={rate}
                  icon={<Star sx={{ fontSize: 18 }} />}
                  label={`${rate}+`}
                  onClick={() => setDraftFilters((p) => ({ ...p, min_rating: p.min_rating === rate ? 0 : rate }))}
                  color={draftFilters.min_rating === rate ? "primary" : "default"}
                  variant={draftFilters.min_rating === rate ? "filled" : "outlined"}
                  sx={{ fontWeight: 800, height: 40, px: 2, cursor: "pointer", transition: "all 0.2s" }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Amenities */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Tiện ích & Dịch vụ
            </Typography>
            <FormGroup sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {AMENITIES_OPTIONS.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      size="small"
                      color="primary"
                      checked={draftFilters.amenities.includes(item)}
                      onChange={() => handleDraftAmenityChange(item)}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        </Stack>

        {/* Actions — sticky bottom */}
        <Box sx={{ pt: 4, display: "flex", gap: 2, borderTop: "1px solid #E2E8F0", mt: 2 }}>
          <Button fullWidth variant="outlined" onClick={resetAll} startIcon={<RestartAlt />} sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 700 }}>
            Đặt lại
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyFilters}
            sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 900, boxShadow: "0 4px 6px -1px rgba(34,197,94,0.3)" }}
          >
            ÁP DỤNG
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MarketplacePage;
