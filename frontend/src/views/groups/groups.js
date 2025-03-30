import { useParams, useHistory } from "react-router-dom";  
import { useState, useEffect, useCallback } from "react";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { List, ListItemText, Box, Typography, CircularProgress, Paper, Avatar, Card, CardActionArea } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import GroupDetails from "./groupDetails";
import NoGroupSelected from "./noGroupSelected";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Tooltip from '@mui/material/Tooltip';

const MySwal = withReactContent(Swal);
const Groups = () => {
    const { confirmAndDeleteGroup } = useContext(AuthContext);
    const { groupId } = useParams(); // Get groupId from URL
    const history = useHistory();
    const [selectedGroup, setSelectedGroup] = useState(groupId || null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch groups from API
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

            // Only select the first group if there's a groupId in the URL
            if (!groupId && groupsData.length > 0) {
                setSelectedGroup(null); // Show NoGroupSelected instead of redirecting
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    }, [groupId]);
    
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

    // Fetch groups on component mount
    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Sync selectedGroup with groupId from URL
    useEffect(() => {
        if (groupId) {
            setSelectedGroup(groupId);
        } else {
            setSelectedGroup(null); // Show NoGroupSelected if no group is in the URL
        }
    }, [groupId, groups]);

    // Handle group selection
    const handleSelectGroup = (id) => {
        setSelectedGroup(id);
        history.push(`/groups/${id}`);
    };

    return (
        <Box sx={{ display: "flex", flexGrow: 1, height: "calc(100vh - 64px)", overflow: "hidden", p: 3 }}>
            
            {/* Left Section - Groups List */}
            <Paper 
                elevation={3} 
                sx={{ 
                    width: "23%", 
                    p: 3, 
                    borderRadius: 3, 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    bgcolor: "white",  
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" 
                }}
            >
                <Typography variant="h5" fontWeight="bold" mb={2}>Your Groups</Typography>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="textSecondary" mt={2}>Fetching groups...</Typography>
                    </Box>
                ) : (
                    <List sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "70vh", p: 0 }}>
                        {groups.length > 0 ? (
                            groups.map((group) => (
                                <Card 
                                    key={group.id} 
                                    sx={{
                                        mb: 2,
                                        borderRadius: 3,
                                        boxShadow: selectedGroup === group.id ? 4 : 1,
                                        transition: "0.3s",
                                        background: selectedGroup === group.id 
                                            ? "linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)" 
                                            : "white",
                                        "&:hover": { boxShadow: 4 }
                                    }}
                                >
                                    <CardActionArea onClick={() => handleSelectGroup(group.id)} sx={{ 
                                        p: 2, 
                                        display: "flex", 
                                        alignItems: "center",
                                        bgcolor: "white", 
                                        borderRadius: "10px",
                                    }}>
                                        <Avatar sx={{ bgcolor: "#2196f3", mr: 2, width: 40, height: 40 }}>
                                            {group.name ? group.name.charAt(0).toUpperCase() : <GroupIcon />}
                                        </Avatar>
                                        <ListItemText 
                                            primary={group.name} 
                                            primaryTypographyProps={{ fontWeight: "bold", fontSize: "1rem" }}
                                        />
                                        <Tooltip title="Delete Group" arrow> <IconButton
                                    onClick={() => deletegroup(group.id)}
                                    sx={{ ml: 1 }}
                                    edge="end"
                                    >
                                    <DeleteIcon />
                                    </IconButton></Tooltip>
                                        
                                    </CardActionArea>
                                </Card>
                            ))
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
            </Paper>

            {/* Right Section - Group Details or No Group Selected */}
            <Box sx={{ width: "77%", height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
                {selectedGroup ? <GroupDetails groupId={selectedGroup} groupName={groups.find(g => g.id === selectedGroup)?.name} /> : <NoGroupSelected />}
            </Box>
        </Box>
    );
};

export default Groups;
