import { useState } from "react";
import {
  Box, CircularProgress, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Tooltip, Typography, alpha, useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import EmailIcon from "@mui/icons-material/Email";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./uploadApi";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import type { UploadedDocument } from "@/shared/types";

function DocIcon({ mime }: { mime: string }) {
  if (mime === "application/pdf") return <PictureAsPdfIcon sx={{ color: "#E53935" }} />;
  if (mime.startsWith("image/")) return <ImageIcon sx={{ color: "#1E88E5" }} />;
  if (mime === "text/plain") return <TextSnippetIcon sx={{ color: "#43A047" }} />;
  if (mime === "message/rfc822") return <EmailIcon sx={{ color: "#FB8C00" }} />;
  return <InsertDriveFileIcon sx={{ color: "text.secondary" }} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  complaintId: string;
}

export default function DocumentList({ complaintId }: Props) {
  const theme = useTheme();
  const { data: docs = [], isLoading } = useGetDocumentsQuery(complaintId);
  const [deleteDoc, { isLoading: deleting }] = useDeleteDocumentMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UploadedDocument | null>(null);

  const baseUrl =
    (import.meta as { env: Record<string, string> }).env.VITE_API_BASE_URL ??
    "http://localhost:8000/api/v1";

  const handleDeleteClick = (doc: UploadedDocument) => {
    setDeleteTarget(doc);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteDoc({ complaintId, documentId: deleteTarget.id });
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!docs.length) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        No documents uploaded yet.
      </Typography>
    );
  }

  return (
    <>
      <List disablePadding>
        {docs.map((doc) => (
          <ListItem
            key={doc.id}
            disableGutters
            sx={{
              borderRadius: 1,
              mb: 0.5,
              px: 1,
              "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.06) },
            }}
            secondaryAction={
              <Box display="flex" gap={0.5}>
                <Tooltip title="Download" arrow>
                  <IconButton
                    size="small"
                    component="a"
                    href={`${baseUrl}/complaints/${complaintId}/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download document ${doc.file_name}`}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(doc)}
                    disabled={deleting}
                    aria-label={`Delete document ${doc.file_name}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DocIcon mime={doc.mime_type} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500} noWrap title={doc.file_name}>
                  {doc.file_name}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(doc.file_size)}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.file_name || "this document"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
