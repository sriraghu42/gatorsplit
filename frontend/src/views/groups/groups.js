import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";  
import { List, ListItem, ListItemText, Box, Fab, Typography } from "@mui/material";
import { Add, Group, Receipt, People, Close } from "@mui/icons-material";
import GroupDetails from "./groupDetails";
import NoGroupSelected from "./noGroupSelected";

const groups = [
    {
        id: "1234",
        name: "React Devs",
        activity: ["Discussing React hooks", "Sharing new React libraries", "Code review session"],
        members: ["Alice", "Bob", "Charlie"]
    },
    {
        id: "5678",
        name: "Golang Enthusiasts",
        activity: ["Exploring Go concurrency", "Building Go APIs", "Sharing Go best practices"],
        members: ["David", "Eve", "Frank"]
    }
];

const Groups = () => {
    const { groupId } = useParams();
    const history = useHistory();
    const [selectedGroup, setSelectedGroup] = useState(groupId || null);
    const [showFloatingOptions, setShowFloatingOptions] = useState(false);

    const handleSelectGroup = (id) => {
        setSelectedGroup(id);
        history.push(`/groups/${id}`);
    };

    return (
        <Box sx={{ display: "flex", flexGrow: 1, height: "calc(100vh - 64px)", overflow: "hidden" }}>
            {/* Left Section - Groups List */}
            <Box sx={{ width: "15%", p: 2, borderRight: "1px solid #ccc", display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Groups</Typography>
                <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                    {groups.map((group) => (
                        <ListItem 
                            key={group.id} 
                            button
                            selected={selectedGroup === group.id}
                            onClick={() => handleSelectGroup(group.id)}
                            sx={{
                                backgroundColor: selectedGroup === group.id ? "#bbdefb" : "inherit",
                                "&:hover": { backgroundColor: "#e3f2fd" },
                                borderRadius: "5px",
                                mb: 1
                            }}
                        >
                            <ListItemText primary={group.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Right Section - Conditional Rendering */}
            <Box sx={{ width: "85%", height: "100%", display: "flex", flexDirection: "column" }}>
                {selectedGroup ? <GroupDetails groupId={selectedGroup} groups={groups} /> : <NoGroupSelected />}
            </Box>

            {/* Floating Action Button */}
            <Fab color="primary" sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 3 }} onClick={() => setShowFloatingOptions(!showFloatingOptions)}>
                {showFloatingOptions ? <Close /> : <Add />}
            </Fab>

            {showFloatingOptions && (
                <>
                    <Fab color="secondary" sx={{ position: "fixed", bottom: 90, right: 20, zIndex: 3 }}>
                        <Receipt />
                    </Fab>
                    <Fab color="secondary" sx={{ position: "fixed", bottom: 160, right: 20, zIndex: 3 }}>
                        <People />
                    </Fab>
                </>
            )}
        </Box>
    );
};

export default Groups;
