import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, FormControl, InputLabel, Select
} from "@mui/material";
import Swal from "sweetalert2";

const SettleUpModal = ({ 
    open, 
    onClose, 
    users = [], 
    currentUser, 
    groupId = null, 
    fetchExpenses = null,
    allowGroupSelect = false // <-- NEW PROP
}) => {
    const [amount, setAmount] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(groupId);
    const [groupUsers, setGroupUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open && allowGroupSelect) {
            fetchGroups();
        } else if (open && users.length) {
            setGroupUsers(users.filter(u => u.ID !== currentUser));
        }
        if (groupId) setSelectedGroup(groupId);
    }, [open, users, currentUser, allowGroupSelect, groupId]);

    const fetchGroups = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/users/groups", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                }
            });
            const data = await res.json();
            setGroups(data || []);
        } catch (e) {
            console.error("Failed to load groups", e);
        }
    };

    const fetchUsersOfGroup = async (groupId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/groups/${groupId}/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                }
            });
            const data = await res.json();
            const filtered = data.users.filter(user => user.ID != currentUser);
            setGroupUsers(filtered);
        } catch (e) {
            console.error("Failed to load group users", e);
        }
    };

    useEffect(() => {
        if (selectedGroup && allowGroupSelect) {
            fetchUsersOfGroup(selectedGroup);
        }
    }, [selectedGroup, allowGroupSelect]);

    const handleSettle = async () => {
        const errs = {};
        if (!amount || parseFloat(amount) <= 0) errs.amount = "Enter a valid amount";
        if (!selectedUser) errs.user = "Select a user";
        if (allowGroupSelect && !selectedGroup) errs.group = "Select a group";
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        const payload = {
            title: "SETTLE_UP_PAYMENT",
            group_id: parseInt(selectedGroup),
            amount: parseFloat(amount),
            paid_by: parseInt(currentUser),
            settled_with: parseInt(selectedUser)
        };

        try {
            const res = await fetch("http://localhost:8080/api/settle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Swal.fire("Success", "Settlement recorded!", "success");
                onClose();
                if (fetchExpenses) fetchExpenses();
            } else {
                Swal.fire("Error", "Failed to settle up.", "error");
            }
        } catch (e) {
            Swal.fire("Error", "Something went wrong!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Settle Up</DialogTitle>
            <DialogContent>
                {allowGroupSelect && (
                    <FormControl fullWidth margin="dense" error={!!errors.group}>
                        <InputLabel>Select Group</InputLabel>
                        <Select value={selectedGroup || ""} onChange={(e) => setSelectedGroup(e.target.value)}>
                            {groups.map(g => (
                                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    margin="dense"
                    error={!!errors.amount}
                    helperText={errors.amount}
                />
                <FormControl fullWidth margin="dense" error={!!errors.user}>
                    <InputLabel>Select User</InputLabel>
                    <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        {groupUsers.map(user => (
                            <MenuItem key={user.ID} value={user.ID}>
                                {user.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSettle} color="success">
                    Settle
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettleUpModal;
