import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, IconButton, LinearProgress,
  Tooltip, Typography, alpha, useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import EmailIcon from "@mui/icons-material/Email";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

interface Props {
  file: File;
  uploadId: string;
  progress: number;
  done: boolean;
  error: string | null;
  onCancel: (uploadId: string) => void;
  onRemove: (uploadId: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime === "application/pdf") return <PictureAsPdfIcon sx={{ color: "#E53935" }} />;
  if (mime.startsWith("image/")) return <ImageIcon sx={{ color: "#1E88E5" }} />;
  if (mime === "text/plain") return <TextSnippetIcon sx={{ color: "#43A047" }} />;
  if (mime === "message/rfc822") return <EmailIcon sx={{ color: "#FB8C00" }} />;
  return <InsertDriveFileIcon sx={{ color: "text.secondary" }} />;
}

export default function FilePreview({ file, uploadId, progress, done, error, onCancel, onRemove }: Props) {
  const theme = useTheme();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (file.type === "text/plain" || file.type === "message/rfc822") {
      const reader = new FileReader();
      reader.onload = (e) => setTextPreview((e.target?.result as string).slice(0, 400));
      reader.readAsText(file);
    }
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const inProgress = !done && !error;
  const borderColor = error
    ? theme.palette.error.main
    : done
    ? theme.palette.success.main
    : theme.palette.divider;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor,
        transition: "border-color 0.2s",
        bgcolor: error
          ? alpha(theme.palette.error.main, 0.04)
          : done
          ? alpha(theme.palette.success.main, 0.04)
          : "background.paper",
      }}
    >
      <CardContent sx={{ p: "12px !important" }}>
        {/* Header row */}
        <Box display="flex" alignItems="center" gap={1}>
          <FileIcon mime={file.type} />
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={500} noWrap title={file.name}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatBytes(file.size)}
            </Typography>
          </Box>
          {done && <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />}
          {error && (
            <Tooltip title={error} arrow>
              <ErrorIcon sx={{ color: "error.main", fontSize: 18 }} />
            </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={() => (inProgress ? onCancel(uploadId) : onRemove(uploadId))}
            sx={{ ml: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Progress */}
        {inProgress && (
          <LinearProgress
            variant={progress === 0 ? "indeterminate" : "determinate"}
            value={progress}
            sx={{ mt: 1, borderRadius: 1, height: 4 }}
          />
        )}
        {error && (
          <Typography variant="caption" color="error" display="block" mt={0.5}>
            {error}
          </Typography>
        )}

        {/* Preview */}
        {previewUrl && file.type.startsWith("image/") && (
          <Box
            component="img"
            src={previewUrl}
            alt={file.name}
            sx={{
              mt: 1, width: "100%", maxHeight: 160,
              objectFit: "contain", borderRadius: 1,
              bgcolor: alpha(theme.palette.action.hover, 0.04),
            }}
          />
        )}
        {previewUrl && file.type === "application/pdf" && (
          <Box
            component="iframe"
            src={previewUrl}
            title={file.name}
            sx={{ mt: 1, width: "100%", height: 200, border: "none", borderRadius: 1 }}
          />
        )}
        {textPreview && (
          <Box
            sx={{
              mt: 1, p: 1, borderRadius: 1,
              bgcolor: alpha(theme.palette.action.hover, 0.06),
              fontFamily: "monospace", fontSize: "0.7rem",
              whiteSpace: "pre-wrap", wordBreak: "break-all",
              maxHeight: 120, overflow: "auto",
              color: "text.secondary",
            }}
          >
            {textPreview}
            {file.size > 400 && "…"}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
