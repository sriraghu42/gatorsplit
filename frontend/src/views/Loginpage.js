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
  InputAdornment,
  Tabs,
  Tab,
  Container,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function LoginPage() {
  const { loginUser } = useContext(AuthContext);
  const history = useHistory();
  
  const [activeTab, setActiveTab] = useState(0); // 0: Login, 1: Register
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      history.push("/register");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!form.email || !form.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const success = await loginUser(form.email, form.password);
      if (!success) {
        setErrorMessage("Invalid email or password.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "90vh",
      backgroundColor: "#f4f6f8",
    }}
  >
      {/* <Container maxWidth="sm"> */}
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
              Login
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email or Username"
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
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
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#145ca4" },
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      {/* </Container> */}

      {/* Footer */}
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

export default LoginPage;
