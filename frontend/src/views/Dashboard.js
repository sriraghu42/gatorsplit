import React, { useEffect, useState, useContext } from "react";
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
  IconButton,
  Divider,
  Tooltip,
  ListItemButton
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CreateGroup from "./groups/CreateGroup";
import NewExpenseModal from "./NewExpensesModal";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AuthContext from "../context/AuthContext";

const MySwal = withReactContent(Swal);

function DashboardPage() {
  const { confirmAndDeleteGroup } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newExpensesOpen, setNewExpensesOpen] = useState(false);
  const history = useHistory();
  const userid = JSON.parse(localStorage.getItem("userid"));

  useEffect(() => {
    fetchUsersAndBalances();
    fetchGroups();
  }, []);

  const fetchUsersAndBalances = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/balances/${userid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }
      });

      const data = await response.json();
      setBalances({
        totalBalance: data.net_balance,
        youOwe: data.total_owed,
        youAreOwed: data.total_due
      });
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching Users data and Balances:", err);
    }
  };

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
  };

  const deleteGroup = async (groupId) => {
    try {
      const success = await confirmAndDeleteGroup(groupId);
      if (success) {
        setGroups(prev => prev.filter(group => group.id !== groupId));
      }
    } catch (error) {
      console.error("Failed to delete group.");
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
      <Typography variant="h4" fontWeight="bold" align="center" sx={{ color: "#1976d2", mb: 3 }}>
        Dashboard
      </Typography>

      {/* Balances Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Balance", value: balances?.totalBalance || "$0.00", color: "green", bg: "#e3f2fd" },
          { label: "You Owe", value: balances?.youOwe || "$0.00", color: "red", bg: "#ffebee" },
          { label: "You Are Owed", value: balances?.youAreOwed || "$0.00", color: "#1976d2", bg: "#e8f5e9" }
        ].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ boxShadow: 4, textAlign: "center", bgcolor: item.bg }}>
              <CardContent>
                <AccountBalanceIcon sx={{ fontSize: 40, color: item.color }} />
                <Typography variant="h6" fontWeight="bold" color={item.color}>
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mx: 1, borderRadius: 3, boxShadow: 2 }}
          startIcon={<GroupIcon />}
          onClick={() => setOpenModal(true)}
        >
          Create Group
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mx: 1, borderRadius: 3, boxShadow: 2 }}
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setNewExpensesOpen(true)}
        >
          Add Expense
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{ mx: 1, borderRadius: 3, boxShadow: 2 }}
          startIcon={<DoneAllIcon />}
        >
          Settle Up
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Groups and Friends Section */}
      <Grid container spacing={4}>
        {/* Groups List */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <GroupIcon fontSize="small" /> Groups
              </Typography>
              <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <ListItem key={group.id} divider secondaryAction={
                      <Tooltip title="Delete Group" arrow>
                        <IconButton edge="end" onClick={() => deleteGroup(group.id)} aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }>
                      <ListItemButton onClick={() => handleSelectGroup(group.id)}>
                        <ListItemText primary={group.name} />
                      </ListItemButton>
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
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <PersonIcon fontSize="small" /> Friends
              </Typography>
              <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                {users?.length > 0 ? (
                  users.filter(user => user.user_id !== userid).map((user, index) => (
                    <ListItem key={index} divider sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <PersonIcon />
                        <ListItemText primary={user.username} />
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: user.net_balance >= 0 ? "success.main" : "error.main", fontWeight: 500 }}>
                          {user.net_balance >= 0 ? "owes you" : "you owe"}
                        </Typography>
                        <Typography variant="h6" sx={{ color: user.net_balance >= 0 ? "success.main" : "error.main", fontWeight: "bold", fontSize: "1.1rem" }}>
                          ${Math.abs(user.net_balance).toFixed(2)}
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
        onGroupCreated={fetchGroups}
      />

      <NewExpenseModal
        open={newExpensesOpen}
        onClose={() => setNewExpensesOpen(false)}
        currentUserId={userid}
      />
    </Container>
  );
}

export default DashboardPage;
