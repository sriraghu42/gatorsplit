import React from "react";
import { Box, Button, Card, CardContent, Container, CssBaseline, Grid, Typography } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import logo from "../logo.jpg";
function HomePage() {
  const history = useHistory();
  const token = localStorage.getItem("authTokens");

  const checkAuthAndNavigate = () => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "You must be logged in to access this page!",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          history.push("/login");
        }
      });
      return;
    }
    history.push("/dashboard");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          padding: "80px 20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: 3,
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
             
              <Typography variant="h6" sx={{ maxWidth: 700, color: "#555" }}>
          Simplify shared expenses with ease! Whether you're splitting bills with friends, managing group trips, or tracking household costs, GatorSplit makes it effortless and fair.
        </Typography>

              <Button
                variant="contained"
                sx={{ mt: 3, px: 4, py: 1.5, fontSize: "1.2rem", bgcolor: "#1976d2", color: "white" }}
                onClick={checkAuthAndNavigate}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={11} md={4}>
              <img
                src={logo}
                alt="GatorSplit Expense Sharing"
                style={{ maxWidth: "100%", borderRadius: "8px", boxShadow: "2px 2px 10px rgba(0,0,0,0.1)" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ flexGrow: 1, backgroundColor: "#f7f9fc", py: 6 }}>
        <Container>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                title: "Create Groups",
                desc: "Set up groups to track shared expenses with ease.",
                link: "/groups",
              },
              {
                title: "Track Expenses",
                desc: "Log and manage expenses automatically.",
                link: "/expenses",
              },
              {
                title: "Settle Balances",
                desc: "View balances and send reminders for payments.",
                link: "/balances",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ boxShadow: 3, borderRadius: 3, textAlign: "center", py: 3 }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                      {feature.desc}
                    </Typography>
                    <Button variant="contained" href={feature.link} sx={{ bgcolor: "#1976d2", color: "white" }}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          padding: 3,
          bgcolor: "#1976d2",
          color: "white",
          width: "100%",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} GatorSplit. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default HomePage;
