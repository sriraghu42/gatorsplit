import React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Button,
  Typography,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Tooltip from "@mui/material/Tooltip";
import { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import logo from "../logo.jpg";

export default function Navbar() {
  const history = useHistory();
  const { logoutUser } = useContext(AuthContext);
  const token = localStorage.getItem("authTokens");
  let username = "";

  if (token) {
    const decoded = jwtDecode(token);
    username = decoded.username;
  }

  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const navbarHeight = open && isMobile ? "144px" : "64px";

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          transition: "height 0.3s ease",
          height: navbarHeight,
          width: "100%",
          backgroundColor: "primary.main",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="GatorSplit Logo"
              style={{
                height: "100%",
                maxHeight: "64px", 
                width: "auto",
                cursor: "pointer",
              }}
              onClick={() => history.push(token ? "/dashboard" : "/")}
            />
          </Box>
          
          {!isMobile && token && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button onClick={() => history.push("/groups")} startIcon={<GroupIcon />} sx={{ color: "white" }}>Groups</Button>
              <Button onClick={() => history.push("/expenses")} startIcon={<ReceiptIcon />} sx={{ color: "white" }}>Expenses</Button>
              <Button onClick={() => history.push("/balances")} startIcon={<AccountBalanceIcon />} sx={{ color: "white" }}>Balances</Button>
            </Stack>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && token ? (
            <Tooltip title="Click to Logout" arrow>
              <Button variant="outlined" color="inherit" onClick={logoutUser} sx={{ borderColor: "white", color: "white" }}>
                <Typography variant="body1" sx={{ color: "white", mr: 1 }}>{username}</Typography>
                <LogoutIcon />
              </Button>
            </Tooltip>
          ) : !isMobile ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => history.push("/login")}
                startIcon={<LoginIcon />}
                sx={{ borderColor: "white", color: "white" }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => history.push("/register")}
                startIcon={<PersonAddIcon />}
                sx={{ borderColor: "white", color: "white" }}
              >
                Sign Up
              </Button>
            </Stack>
          ) : (
            <IconButton color="inherit" edge="end" onClick={() => setOpen(!open)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: navbarHeight, transition: "margin-top 0.3s ease" }} />
    </Box>
  );
}
