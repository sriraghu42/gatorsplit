import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2"; // Import SweetAlert
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, MenuItem, Select, 
    FormControl, InputLabel, List, ListItem, ListItemText, 
    Box, Typography, Divider, Checkbox, OutlinedInput
} from "@mui/material";

const AddExpenseModal = ({ open, onClose, currentUser, groupId = null, members = null, fetchExpenses }) => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [payer, setPayer] = useState(currentUser?.id || "");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [splits, setSplits] = useState({});
    const [errors, setErrors] = useState({});

    // Fetch members if not passed as props
    const fetchMembers = useCallback(async () => {
        if (!members && groupId) {
            try {
                const response = await fetch(`http://localhost:8080/api/groups/${groupId}/users`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                    }
                });
                const data = await response.json();
                const formattedData = data.users.map(member => ({
                    id: String(member.ID),
                    name: member.username
                }));
                setUsers(formattedData);
            } catch (error) {
                console.error("Error fetching group members:", error);
            }
        } else if (!members) {
            try {
                const response = await fetch("http://localhost:8080/api/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                    }
                });
                const data = await response.json();
                setUsers(data.map(user => ({ id: String(user.ID), name: user.username })));
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        } else if (members) {
            setUsers(members.map(user => ({ id: String(user.id), name: user.name })));
        }
    }, [groupId, members]);

    useEffect(() => {
        if (open) fetchMembers();
    }, [open, fetchMembers]);

    // Calculate Equal Splitting
    useEffect(() => {
        if (!amount || selectedUsers.length === 0) {
            setSplits({});
            return;
        }
        let perPerson = (amount / selectedUsers.length).toFixed(2);
        let newSplits = {};
        selectedUsers.forEach(userId => {
            newSplits[userId] = perPerson;
        });
        setSplits(newSplits);
    }, [amount, selectedUsers]);

    // Function to Reset Form
    const resetForm = () => {
        setTitle("");
        setAmount("");
        setPayer(currentUser?.id || "");
        setSelectedUsers([]);
        setSplits({});
        setErrors({});
    };

    const validateForm = () => {
        let validationErrors = {};

        if (!title.trim()) validationErrors.title = "Title is required";
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) validationErrors.amount = "Enter a valid amount";
        if (!payer) validationErrors.payer = "Please select who paid";
        if (selectedUsers.length === 0) validationErrors.selectedUsers = "Select at least one user to split with";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const expenseData = {
            title,
            amount: parseFloat(amount),
            paid_by: parseInt(payer),
            group_id: parseInt(groupId),
            split_with: selectedUsers.map(id => parseInt(id))
        };

        try {
            const response = await fetch(`http://localhost:8080/api/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                },
                body: JSON.stringify(expenseData),
            });

            if (response.ok) {
                Swal.fire({
                    title: "Success",
                    text: "Expense added successfully!",
                    icon: "success",
                    toast: true,
                    timer: 2000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    showCloseButton: true,
                });
                resetForm(); // Clear form
                onClose(); // Close modal
                fetchExpenses()
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to add expense!",
                    icon: "error",
                    toast: true,
                    position: "top-right",
                    showConfirmButton: false,
                    showCloseButton: true,
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Something went wrong!",
                icon: "error",
                toast: true,
                position: "top-right",
                showConfirmButton: false,
                showCloseButton: true,
            });
            console.error("Error:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Expense</DialogTitle>
            <DialogContent>
                <TextField 
                    fullWidth 
                    label="Expense Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    margin="dense"
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                />
                <TextField 
                    fullWidth 
                    type="number" 
                    label="Amount" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    margin="dense"
                    error={!!errors.amount}
                    helperText={errors.amount}
                    required
                />

                {/* Who Paid? Dropdown */}
                <FormControl fullWidth margin="dense" error={!!errors.payer} required>
                    <InputLabel>Who Paid?</InputLabel>
                    <Select value={payer} onChange={(e) => setPayer(e.target.value)}>
                        {users.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                {member.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Split Among Users - Multi-select */}
                <FormControl fullWidth margin="dense" error={!!errors.selectedUsers} required>
                    <InputLabel>Select Users</InputLabel>
                    <Select
                        multiple
                        value={selectedUsers}
                        onChange={(e) => setSelectedUsers(e.target.value)}
                        input={<OutlinedInput label="Select Users" />}
                        renderValue={(selected) => selected.map(id => users.find(m => m.id === id)?.name).join(", ")}
                    >
                        {users.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                                <Checkbox checked={selectedUsers.includes(member.id)} />
                                {member.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Expense Breakdown */}
                <Box mt={2}>
                    <Typography variant="h6">Breakdown</Typography>
                    <Divider />
                    <List>
                        {Object.entries(splits).map(([memberId, amount]) => (
                            <ListItem key={memberId}>
                                <ListItemText primary={`${users.find(m => m.id === memberId)?.name || "Unknown"} owes: $${amount}`} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">Add Expense</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddExpenseModal;
