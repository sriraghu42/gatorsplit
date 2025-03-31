import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AuthContext from "../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonIcon from '@mui/icons-material/Person';
import CreateGroup from "./groups/CreateGroup";
import { useHistory } from "react-router-dom";  
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Tooltip from '@mui/material/Tooltip';

const MySwal = withReactContent(Swal);
function DashboardPage() {
  const { confirmAndDeleteGroup } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const history = useHistory();
  const userid = JSON.parse(localStorage.getItem("userid"))

  useEffect(() => {
    
    // const fetchData = async () => {
    //   try {       
    //     const [usersResponse] = await Promise.all([
    //       fetch("http://localhost:8080/api/users", {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //           "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}` // ✅ Add token here
    //         }
    //       }),
    //     ]);        
  
    //     const usersData = await usersResponse.json();        
    //     const balancesData = []
        
    //     setUsers(usersData || []); // Set users from the API response
    //     const  balanceResponse=[]
    //     setBalances(balancesData || null);
       
        
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    fetchUsersAndBalances();
    fetchGroups();
    //fetchData();
  }, []);

  const fetchUsersAndBalances = async() => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/balances/${userid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }

      });
      const data = await response.json()
      setBalances({
        totalBalance: data.net_balance,
        youOwe: data.total_owed,
        youAreOwed: data.total_due
      })
      setUsers(data.users);
      console.log(data, "AKkkka")
    } catch(err) {
      console.error("Error fetching Users data and Balances:", err);
    } 
  } //list of users {their balances to current}, current totals.

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }
      });

      const groupsData = await response.json();
      setGroups(groupsData || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }
  
  const deletegroup = async (groupId) => {
    try {
        const success = await confirmAndDeleteGroup(groupId);
        if (success) {
            setGroups(prev => prev.filter(group => group.id !== groupId));
        }
      } catch (error) {
          throw new Error("Failed to delete group.");
      }
  };
  
  
  const handleSelectGroup = (id) => {
    history.push(`/groups/${id}`);
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <br />
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ color: "#1976d2" }}>
        Dashboard
      </Typography>

      {/* Balances Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 4, textAlign: "center", bgcolor: "#e3f2fd" }}>
            <CardContent>
              <AccountBalanceIcon sx={{ fontSize: 40, color: "green" }} />
              <Typography variant="h6" fontWeight="bold" color="success.main">
                Total Balance
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {balances?.totalBalance || "$0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 4, textAlign: "center", bgcolor: "#ffebee" }}>
            <CardContent>
              <AccountBalanceIcon sx={{ fontSize: 40, color: "red" }} />
              <Typography variant="h6" fontWeight="bold" color="error.main">
                You Owe
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {balances?.youOwe || "$0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 4, textAlign: "center", bgcolor: "#e8f5e9" }}>
            <CardContent>
              <AccountBalanceIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                You Are Owed
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {balances?.youAreOwed || "$0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Action Buttons */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mx: 1 }}
          startIcon={<GroupIcon />}
          onClick={() => setOpenModal(true)} 
        >
          Create Group
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mx: 1 }}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Expense
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{ mx: 1 }}
          startIcon={<DoneAllIcon />}
        >
          Settle Up
        </Button>
      </Box>

      <br>
      </br>
      <br></br>

      {/* Groups and Friends Section */}
      <Grid container spacing={4}>
        {/* Groups List */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Groups
              </Typography>
              <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                {groups.length > 0 ? (
                  groups.map((group, index) => (
                    <ListItem key={index} divider
                    secondaryAction={
                       <Tooltip title="Delete Group" arrow> <IconButton edge="end" onClick={() => deletegroup(group.id)}>
                       <DeleteIcon />
                     </IconButton> </Tooltip>
                      
                    }
                  >
                      <ListItemText primary={group.name}
                        key={group.id} 
                        button
                        onClick={() => handleSelectGroup(group.id)}
                        sx={{
                            "&:hover": { backgroundColor: "#e3f2fd" },
                            borderRadius: "5px",
                            mb: 1
                        }} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="textSecondary" align="center">
                    No groups available.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Friends List */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Friends
              </Typography>
              
              <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                
                    {users?.length > 0 ? (
                users.filter((userData) => userData.user_id != userid) .map((userData, index) => (

                  //do nnot display current user.

                  <ListItem key={index} divider sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* Left Side: Icon and Name with Gap */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PersonIcon />
                    <ListItemText primary={userData.username} />
                  </Box>
            
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end", // Ensures right text aligns correctly
                      justifyContent: "center", // Centers it with the name
                    }}
                  >
                    <Typography variant="body2" sx={{ color: userData.net_balance>=0 ? "green" : "red" }}>
                      {userData.net_balance>=0 ? "owes you" : "you owe"}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: userData.net_balance>=0 ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      ${Math.abs(userData.net_balance).toFixed(2)}
                    </Typography>
                  </Box>
              </ListItem>
                                ))
              ) : (
                <Typography color="textSecondary" align="center">
                  No users available.
                </Typography>
              )}

              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CreateGroup
        open={openModal}
        onClose={() => setOpenModal(false)}
        onGroupCreated={fetchGroups} // Refresh groups after creation
      />
 
    </Container>
  );
}

export default DashboardPage;
