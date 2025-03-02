import { Box, Typography, Paper, List, ListItem, ListItemText, Grid, IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const GroupDetails = ({ groupId, groups }) => {
    const group = groups.find((g) => g.id === groupId);

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
                            {group.activity.map((act, index) => (
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
                            {group.members.map((member, index) => (
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
