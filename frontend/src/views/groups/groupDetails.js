import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText, Grid, IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const GroupDetails = ({ groupId }) => {
    const [group, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    //const group = groups.find((g) => g.id === groupId);

    useEffect(() => {
        const fetchGroupdata = async() => {
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
        fetchGroupdata();
    })

    if (!group) return <Typography variant="h6">No group found.</Typography>;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100%" }}>
            <Grid container sx={{ flexGrow: 1, height: "100%" }}>
                
                {/* Left Section - 85% (Group Name & Activity) */}
                <Grid item xs={9} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Paper 
                        elevation={3} 
                        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
                    >
                        <Typography variant="h4" fontWeight="bold" mb={2}>
                            {group.name}
                        </Typography>

                        <Typography variant="h6" fontWeight="bold" mb={1}>
                            Activity
                        </Typography>
                        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                            {group?.activity?.map((act, index) => (
                                <ListItem key={index} sx={{ p: 0.5 }}>
                                    <ListItemText primary={`• ${act}`} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Section - 15% (Group Members) */}
                <Grid item xs={3} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Paper 
                        elevation={3} 
                        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
                    >
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                            Members
                        </Typography>
                        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                            {group?.members?.map((member, index) => (
                                <ListItem key={index} sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
                                    <PersonIcon sx={{ mr: 1, color: "gray" }} />
                                    <ListItemText primary={member} />
                                </ListItem>
                            ))}

                            {/* Add New Member Button */}
                            <ListItem sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
                                <IconButton color="primary">
                                    <AddCircleOutlineIcon />
                                </IconButton>
                                <ListItemText primary="Add Member" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default GroupDetails;
