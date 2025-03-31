import { useEffect, useState, useCallback } from "react";
import { 
    Box, Typography, Paper, List, ListItem, ListItemText, Grid, Button, 
    Chip, Divider 
} from "@mui/material";
import AddExpenseModal from "../AddExpensesModal";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PaymentsIcon from "@mui/icons-material/Payments";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddMemberModal from "./AddMemberModal";

const GroupDetails = ({ groupId, groupName }) => {
    const userid = JSON.parse(localStorage.getItem("userid")); // Get current user ID
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);


    // Function to fetch group details
    const getUsersOfAGroup = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                }
            });

            const groupData = await response.json();
            setGroup(groupData);
        } catch (error) {
            // console.error("Error fetching group data:", error);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Function to fetch expenses
    const fetchExpenses = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/expenses`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`
                }
            });

            const expensesData = await response.json();
            setExpenses(expensesData);
        } catch (error) {
            // console.error("Error fetching expenses:", error);
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) {
            getUsersOfAGroup();
            fetchExpenses();
        }
    }, [groupId, getUsersOfAGroup, fetchExpenses]);

    if (loading) {
        return <Typography variant="h6">Loading group data...</Typography>;
    }

    if (!group) return <Typography variant="h6">No group found.</Typography>;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100%", p: 2 }}>
            <Grid container sx={{ flexGrow: 1, height: "100%" }} spacing={3}>

                {/* Left Section - Expenses Activity */}
                <Grid item xs={9} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2} color="black">
                        {groupName}
                    </Typography>
                    <Paper 
                        elevation={3} 
                        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 3 }}
                    >
                        {/* Activity Header with Buttons */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h5" fontWeight="bold">
                                Expenses
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<PaymentsIcon />}
                                    sx={{ borderRadius: 2 }}
                                    onClick={() => setExpenseModalOpen(true)} // Open modal
                                >
                                    Add Expense
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    startIcon={<DoneAllIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Settle Up
                                </Button>
                            </Box>
                        </Box>

                        {/* Expenses List - Improved UI */}
                        <List sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "60vh" }}>
                            {expenses.length > 0 ? (
                                expenses.map((expense) => {
                                    const paidByParticipant = expense.participants.find(p => p.user_id == expense.paid_by);
                                    const paidByName = paidByParticipant ? paidByParticipant.username : "Unknown";
                                    const displayPaidBy = expense.paid_by == userid ? "You" : paidByName;

                                    const userOwe = expense.participants.find(p => p.user_id == userid);
                                    const amountOwed = userOwe ? userOwe.amount_owed.toFixed(2) : "0.00";

                                    const totalOwedToPayer = expense.participants
                                        .filter(p => p.user_id !== expense.paid_by)
                                        .reduce((sum, p) => sum + p.amount_owed, 0)
                                        .toFixed(2);

                                    const amountYouAreOwed = expense.paid_by == userid ? (expense.amount - amountOwed).toFixed(2) : "0.00";

                                    let activityText;
                                    if (expense.paid_by == userid) {
                                        activityText = (
                                            <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                You paid <b>${expense.amount}</b> for <b>{expense.title}</b>. 
                                                You are owed <b>${amountYouAreOwed}</b>.
                                            </Typography>
                                        );
                                    } else {
                                        activityText = (
                                            <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                <b>{displayPaidBy}</b> paid <b>${expense.amount}</b> for <b>{expense.title}</b>. 
                                                You owe <b>${amountOwed}</b>.
                                            </Typography>
                                        );
                                    }

                                    return (
                                        <ListItem key={expense.id} sx={{ p: 1, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #ddd" }}>
                                            <AttachMoneyIcon sx={{ color: "#4CAF50" }} />
                                            <ListItemText primary={activityText} />
                                            {expense.paid_by == userid ? (
                                                <Chip
                                                    label={`You are owed $${amountYouAreOwed}`}
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                                                />
                                            ) : (
                                                <Chip
                                                    label={`You owe $${amountOwed}`}
                                                    color="error"
                                                    variant="outlined"
                                                    sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                                                />
                                            )}
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No recent expenses
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Section - Members */}
                <Grid item xs={3} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Paper 
                        elevation={3} 
                        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: 3 }}
                    >
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Members
                        </Typography>

                        <List sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "60vh" }}>
                            {group?.users?.length > 0 ? (
                                group?.users?.map((user, index) => (
                                    <ListItem key={index} sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
                                        <PersonIcon sx={{ mr: 1, color: "gray" }} />
                                        <ListItemText primary={user.username} />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No members found
                                </Typography>
                            )}
                        </List>
                        <Box sx={{ mt: "auto", pt: 2, display: "flex", justifyContent: "center" }}>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<AddCircleOutlineIcon />}
                                sx={{ borderRadius: 2, width: "100%" }}
                                onClick={() => setAddMemberModalOpen(true)}

                            >
                                Add Member
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Expense Modal */}
            <AddMemberModal
    open={isAddMemberModalOpen}
    onClose={() => setAddMemberModalOpen(false)}
    groupName={groupName}
    groupUsers={group.users}
    groupId={groupId}
    onUsersAdded={getUsersOfAGroup}
/>

            <AddExpenseModal open={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} groupId={groupId} members={group?.users} currentUser={userid} fetchExpenses={fetchExpenses} />
        </Box>
    );
};

export default GroupDetails;
