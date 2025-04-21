import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select,
  FormControl, InputLabel, List, ListItem, ListItemText,
  Box, Typography, Divider, Checkbox, OutlinedInput
} from "@mui/material";
import Swal from "sweetalert2";

const NewExpenseModal = ({ open, onClose, currentUserId }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [splits, setSplits] = useState({});
  const [errors, setErrors] = useState({});

  // Fetch all groups of the current user
  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }
      });
      const data = await response.json();
      setGroups(data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  }, []);

  // Fetch members when group is selected
  const fetchMembers = useCallback(async () => {
    if (!selectedGroupId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/groups/${selectedGroupId}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }
      });
      const data = await response.json();
      const formatted = data.users.map(user => ({
        id: String(user.ID),
        name: user.username
      }));
      setMembers(formatted);
      setPayer(String(currentUserId)); // default to self
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  }, [selectedGroupId, currentUserId]);

  useEffect(() => {
    if (open) fetchGroups();
  }, [open, fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) fetchMembers();
  }, [selectedGroupId, fetchMembers]);

  // Equal split calculation
  useEffect(() => {
    if (!amount || selectedUsers.length === 0) {
      setSplits({});
      return;
    }
    const perPerson = (parseFloat(amount) / selectedUsers.length).toFixed(2);
    const newSplits = {};
    selectedUsers.forEach(uid => {
      newSplits[uid] = perPerson;
    });
    setSplits(newSplits);
  }, [amount, selectedUsers]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setSelectedGroupId("");
    setPayer(currentUserId);
    setSelectedUsers([]);
    setSplits({});
    setErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!selectedGroupId) errs.selectedGroupId = "Please select a group";
    if (!title.trim()) errs.title = "Title is required";
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) errs.amount = "Enter a valid amount";
    if (!payer) errs.payer = "Select who paid";
    if (selectedUsers.length === 0) errs.selectedUsers = "Select users to split with";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const expenseData = {
      title,
      amount: parseFloat(amount),
      paid_by: parseInt(payer),
      group_id: parseInt(selectedGroupId),
      split_with: selectedUsers.map(id => parseInt(id))
    };

    try {
      const response = await fetch("http://localhost:8080/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        Swal.fire({
          title: "Success",
          text: "Expense added!",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "top-right",
          showConfirmButton: false,
        });
        resetForm();
        onClose();
      } else {
        throw new Error("Failed to add expense");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to submit expense", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Expense</DialogTitle>
      <DialogContent>

        {/* Select Group */}
        <FormControl fullWidth margin="dense" error={!!errors.selectedGroupId} required>
          <InputLabel id="select-group-label">Select Group</InputLabel>
          <Select
            labelId="select-group-label"
            aria-labelledby="select-group-label"
            data-testid="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            label="Select Group"
          >
            {groups.map(group => (
              <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Expense Title & Amount */}
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="dense"
          error={!!errors.title}
          helperText={errors.title}
        />
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

        {/* Payer Dropdown */}
        <FormControl fullWidth margin="dense" error={!!errors.payer} required>
          <InputLabel id="payer-select-label">Who Paid?</InputLabel>
          <Select
           labelId="payer-select-label"
           id="payer-select"
           data-testid="payer-select"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
          >
            {members.map(user => (
              <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Split Among */}
        <FormControl fullWidth margin="dense" error={!!errors.selectedUsers} required>
          <InputLabel id="split-select-label">Split With</InputLabel>
          <Select
           labelId="split-select-label"
           id="split-select"
           data-testid="split-select"
            multiple
            value={selectedUsers}
            onChange={(e) => setSelectedUsers(e.target.value)}
            input={<OutlinedInput label="Split With" />}
            renderValue={(selected) => selected.map(id => members.find(m => m.id === id)?.name).join(", ")}
          >
            {members.map(user => (
              <MenuItem key={user.id} value={user.id}>
                <Checkbox checked={selectedUsers.includes(user.id)} />
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Split Preview */}
        {Object.entries(splits).length > 0 && (
          <Box mt={2}>
            <Typography variant="h6">Breakdown</Typography>
            <Divider />
            <List>
              {Object.entries(splits).map(([id, amt]) => (
                <ListItem key={id}>
                  <ListItemText primary={`${members.find(m => m.id === id)?.name || id} owes $${amt}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Expense
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewExpenseModal;
