import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function RegisterPage() {
  const { registerUser } = useContext(AuthContext);
  const history = useHistory();

  const [activeTab, setActiveTab] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [apiErrors, setApiErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) history.push("/login");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiErrors("");
    setSuccessMessage("");

    if (form.username.trim() === "" || form.email.trim() === "" || form.password.trim() === "") {
      setApiErrors("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const success = await registerUser(form.username, form.email, form.password);
      if (success) {
        setSuccessMessage("Account created successfully! You can now log in.");
      }
    } catch (error) {
      setApiErrors(error.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: 3,
          borderRadius: 3,
          backgroundColor: "white",
          padding: 3,
        }}
      >
        <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                      "& .MuiTabs-indicator": { backgroundColor: "#1976d2" },
                      "& .MuiTab-root": { fontWeight: "bold", fontSize: "16px", padding: 1 },
                    }}
                  >
                    <Tab label="Login" />
                    <Tab label="Register" />
                  </Tabs>

        <CardContent>
          
          <Typography variant="h5" textAlign="center" mb={2}>
          Create an Account
                          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2, animation: "fadeIn 0.5s" }}>
              {successMessage}
            </Alert>
          )}
          {apiErrors && (
            <Alert severity="error" sx={{ mb: 2, animation: "fadeIn 0.5s" }}>
              {apiErrors}
            </Alert>
          )}

          {!successMessage && (
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, py: 1.5, fontWeight: "bold", backgroundColor: "#1976d2" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Register"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
       <Box
              component="footer"
              sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "#1976d2",
                color: "white",
                textAlign: "center",
                py: 1.5,
                boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="body2">
                        © {new Date().getFullYear()} GatorSplit. All Rights Reserved.
                      </Typography>
            </Box>
    </Box>
  );
}

export default RegisterPage;
