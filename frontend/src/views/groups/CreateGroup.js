import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
  CircularProgress
} from "@mui/material";

const CreateGroup = ({ open, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users when the modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        }
      });

      const usersData = await response.json();
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      alert("Please enter a group name and select at least one user.");
      return;
    }

    const userIds = selectedUsers.map(user => user.id); 

    try {
      const response = await fetch("http://localhost:8080/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
        },
        body: JSON.stringify({ name: groupName, user_ids: userIds })
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      alert("Group created successfully!");
      setGroupName("");
      setSelectedUsers([]);
      onGroupCreated(); // Refresh the groups list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  return (
    <Modal 
        open={open} 
        onClose={onClose} 
        BackdropProps={{
            sx: { backdropFilter: "blur(8px)" } // 👈 Add blur effect here
        }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: 400
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create New Group
        </Typography>

        <TextField
          fullWidth
          label="Group Name"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <CircularProgress />
        ) : (
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.name} // Ensure correct field name
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Add Users" variant="outlined" />
            )}
          />
        )}

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} variant="contained" sx={{ ml: 2 }}>
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateGroup;
