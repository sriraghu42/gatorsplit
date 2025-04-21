import { useParams, useHistory } from "react-router-dom";
import { useState, useEffect, useCallback, useContext } from "react";
import {
  List, ListItemText, Box, Typography, CircularProgress,
  Paper, Avatar, Card, CardActionArea, Button,
  IconButton, Tooltip
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupDetails from "./groupDetails";
import CreateGroup from "./CreateGroup";
import NoGroupSelected from "./noGroupSelected";
import AuthContext from "../../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const Groups = () => {
  const { confirmAndDeleteGroup } = useContext(AuthContext);
  const { groupId } = useParams();
  const history = useHistory();
  const [selectedGroup, setSelectedGroup] = useState(groupId || null);
  const [groups, setGroups] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
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

      if (!groupId && groupsData.length > 0) {
        setSelectedGroup(null); // Default state
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

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

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    setSelectedGroup(groupId || null);
  }, [groupId]);

  const handleSelectGroup = (id) => {
    setSelectedGroup(id);
    history.push(`/groups/${id}`);
  };

  return (
    <Box sx={{ display: "flex", flexGrow: 1, height: "calc(100vh - 64px)", overflow: "hidden", p: 3 }}>
      {/* Left Section */}
      <Paper
        elevation={4}
        sx={{
          width: "25%",
          p: 3,
          borderRadius: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f9f9f9",
          border: "1px solid #ddd"
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Your Groups
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, flexDirection: "column" }}>
            <CircularProgress />
            <Typography variant="body2" color="textSecondary" mt={2}>
              Fetching groups...
            </Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "70vh", p: 0 }}>
            {groups.length > 0 ? (
              groups.map((group) => {
                const isSelected = selectedGroup === group.id;

                return (
                  <Card
                    key={group.id}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      boxShadow: isSelected ? 6 : 1,
                      background: isSelected ? "linear-gradient(135deg, #e3f2fd, #90caf9)" : "#fff",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleSelectGroup(group.id)}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 3,
                        "&:hover": {
                          bgcolor: "#f0f4f8"
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#1976d2", mr: 2, width: 40, height: 40 }}>
                        {group.name ? group.name.charAt(0).toUpperCase() : <GroupIcon />}
                      </Avatar>
                      <ListItemText
                        primary={group.name}
                        primaryTypographyProps={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          color: isSelected ? "primary.main" : "text.primary"
                        }}
                      />
                      <Tooltip title="Delete Group" arrow>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroup(group.id);
                          }}
                          sx={{ ml: 1, color: "error.main" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActionArea>
                  </Card>
                );
              })
            ) : (
              <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="body1" color="textSecondary">No groups found</Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Create a new group to start managing expenses.
                </Typography>
              </Box>
            )}
          </List>
        )}

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            startIcon={<GroupIcon />}
            sx={{ borderRadius: 2 }}
            onClick={() => setOpenModal(true)}
          >
            Create Group
          </Button>
        </Box>
      </Paper>

      {/* Right Section */}
      <Box sx={{ width: "75%", height: "100%", p: 3 }}>
        {selectedGroup ? (
          <GroupDetails
            groupId={selectedGroup}
            groupName={groups.find(g => g.id === selectedGroup)?.name}
          />
        ) : (
          <NoGroupSelected />
        )}
      </Box>

      <CreateGroup
        open={openModal}
        onClose={() => setOpenModal(false)}
        onGroupCreated={fetchGroups}
      />
    </Box>
  );
};

export default Groups;
