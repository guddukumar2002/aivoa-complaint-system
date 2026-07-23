import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, FormControl,
  InputLabel, Select, MenuItem, Slider, Switch, FormControlLabel,
  TextField, Button, Divider, Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MemoryIcon from "@mui/icons-material/Memory";
import TuneIcon from "@mui/icons-material/Tune";
import AppLayout from "@/shared/components/AppLayout";
import { showToast } from "@/app/toastSlice";
import { useAppDispatch } from "@/app/store";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [temp, setTemp] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000/api/v1");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    // Persist to localStorage for demo persistence
    localStorage.setItem("settings_groq_model", model);
    localStorage.setItem("settings_temperature", String(temp));
    localStorage.setItem("settings_max_tokens", String(maxTokens));
    localStorage.setItem("settings_auto_analyze", String(autoAnalyze));
    localStorage.setItem("settings_api_url", apiUrl);
    
    setSuccess(true);
    dispatch(showToast({ message: "Settings saved successfully", severity: "success" }));
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <AppLayout title="Settings">
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3.5}>
          <SettingsIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>System Settings</Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Configuration updated successfully.
          </Alert>
        )}

        <Grid container spacing={3.5}>
          {/* AI Model Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                  <MemoryIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>AI Model Parameters</Typography>
                </Box>
                
                <FormControl fullWidth size="small" sx={{ mb: 3.5 }}>
                  <InputLabel>Active Groq Model</InputLabel>
                  <Select
                    value={model}
                    label="Active Groq Model"
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <MenuItem value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</MenuItem>
                    <MenuItem value="gemma2-9b-it" disabled>gemma2-9b-it (Decommissioned)</MenuItem>
                    <MenuItem value="llama3-8b-8192">llama3-8b-8192 (Fast)</MenuItem>
                  </Select>
                </FormControl>

                <Box mb={3.5}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Temperature: {temp}
                  </Typography>
                  <Slider
                    value={temp}
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    onChange={(_, v) => setTemp(v as number)}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.disabled">
                    Lower values are more factual; higher values are more creative.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Max Tokens: {maxTokens}
                  </Typography>
                  <Slider
                    value={maxTokens}
                    min={256}
                    max={4096}
                    step={128}
                    onChange={(_, v) => setMaxTokens(v as number)}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Integration & Workflow Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                  <TuneIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>System Integration</Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Backend API Endpoint Base URL"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  sx={{ mb: 3.5 }}
                />

                <Divider sx={{ my: 2 }} />

                <Box display="flex" flexDirection="column" gap={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoAnalyze}
                        onChange={(e) => setAutoAnalyze(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>Auto-Run AI Analysis Pipeline</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Trigger the full LangGraph pipeline automatically upon complaint creation.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button variant="contained" onClick={handleSave} size="medium">
            Save Configuration
          </Button>
        </Box>
      </Box>
    </AppLayout>
  );
}
