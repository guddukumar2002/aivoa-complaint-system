import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface Props {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  color: string;
  bg: string;
  loading?: boolean;
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, color, bg, loading, subtitle }: Props) {
  return (
    <Card sx={{ height: "100%", transition: "box-shadow 0.2s", "&:hover": { boxShadow: 4 } }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography variant="h3" fontWeight={700} color="text.primary" lineHeight={1}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2.5,
              backgroundColor: bg, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
