import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

const AddMemberModal = ({ open, onClose, groupName, groupUsers, groupId, onUsersAdded }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open, groupUsers]);

    const fetchUsers = async () => {
        const response = await fetch(`http://localhost:8080/api/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
            }
        });
        const data = await response.json()
        const groupUserIds = groupUsers.map(user => user.ID);
        console.log(groupUserIds);
        const filtered = data.filter(user => !groupUserIds.includes(user.id));
        setAllUsers(filtered);
    }
    const handleSave = async () => {
        const userIds = selectedUsers.map(u => u.id);
        const data = await fetch(`http://localhost:8080/api/groups/${groupId}/editusers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
            },
            body: JSON.stringify(userIds)
        });

        onUsersAdded(); // Refresh group user list
        onClose(); // Close modal
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Add Members to {groupName}</DialogTitle>
            <DialogContent>
                <Typography mb={1}>Select users to add:</Typography>
                <Autocomplete
                    multiple
                    options={allUsers}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => setSelectedUsers(value)}
                    renderInput={(params) => <TextField {...params} label="Users" />}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMemberModal;
