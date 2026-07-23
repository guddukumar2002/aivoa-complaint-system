import { useCallback, useRef, useState } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
  validateFiles,
  type ValidationError,
} from "@/shared/hooks/useFileUpload";

interface Props {
  onFiles: (files: File[]) => void;
  onErrors: (errors: ValidationError[]) => void;
  disabled?: boolean;
}

export default function FileDropZone({ onFiles, onErrors, disabled }: Props) {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const process = useCallback(
    (raw: FileList | null) => {
      if (!raw) return;
      const files = Array.from(raw).slice(0, MAX_FILES_PER_UPLOAD);
      const { valid, errors } = validateFiles(files);
      if (errors.length) onErrors(errors);
      if (valid.length) onFiles(valid);
    },
    [onFiles, onErrors]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) process(e.dataTransfer.files);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    process(e.target.files);
    e.target.value = "";
  };

  const borderColor = dragging
    ? theme.palette.primary.main
    : theme.palette.divider;

  return (
    <Box
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        border: `2px dashed ${borderColor}`,
        borderRadius: 2,
        p: 4,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        bgcolor: dragging
          ? alpha(theme.palette.primary.main, 0.06)
          : alpha(theme.palette.action.hover, 0.02),
        transition: "border-color 0.2s, background-color 0.2s",
        "&:hover": disabled
          ? {}
          : { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        style={{ display: "none" }}
        onChange={onInputChange}
        disabled={disabled}
      />
      <CloudUploadIcon
        sx={{ fontSize: 40, color: dragging ? "primary.main" : "text.disabled", mb: 1 }}
      />
      <Typography variant="body1" fontWeight={500} color={dragging ? "primary.main" : "text.primary"}>
        {dragging ? "Drop files here" : "Drag & drop files or click to browse"}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        PDF, Images (JPG/PNG/GIF/WebP), Plain Text, Email (.eml), Word — max{" "}
        {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB each · up to {MAX_FILES_PER_UPLOAD} files
      </Typography>
    </Box>
  );
}
