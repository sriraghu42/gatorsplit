// SettleUpModal.js
import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, FormControl, InputLabel, Select
} from "@mui/material";
import Swal from "sweetalert2";

const SettleUpModal = ({ open, onClose, users = [], currentUser, groupId, fetchExpenses }) => {
    const [amount, setAmount] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [error, setError] = useState({});

    useEffect(() => {
        if (open) {
            setAmount("");
            setSelectedUser("");
            setError({});
        }
    }, [open]);

    const handleSettle = async () => {
        let validationErrors = {};
        if (!amount || parseFloat(amount) <= 0) validationErrors.amount = "Enter a valid amount";
        if (!selectedUser) validationErrors.user = "Please select a user";
        setError(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            from_user: parseInt(currentUser),
            to_user: parseInt(selectedUser),
            group_id: parseInt(groupId),
            amount: parseFloat(amount),
        };

        try {
            const response = await fetch("http://localhost:8080/api/settle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Swal.fire("Settled!", "Payment has been recorded.", "success");
                onClose();
                fetchExpenses();
            } else {
                Swal.fire("Error", "Failed to settle up!", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong!", "error");
        }
    };
    console.log(users, currentUser);
    const filteredUsers = users.filter(user => user.ID != currentUser);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Settle Up</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    margin="dense"
                    error={!!error.amount}
                    helperText={error.amount}
                />
                <FormControl fullWidth margin="dense" error={!!error.user}>
                    <InputLabel>Select User</InputLabel>
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        {filteredUsers.map(user => (
                            <MenuItem key={user.ID} value={user.ID}>
                                {user.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSettle} variant="contained" color="primary">Settle</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettleUpModal;
