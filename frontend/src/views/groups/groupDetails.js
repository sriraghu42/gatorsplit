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
import { IconButton } from "@mui/material";
import { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Tooltip from '@mui/material/Tooltip';
import AddMemberModal from "./AddMemberModal";
import SettleUpModal from "../SettleUpModal";

const MySwal = withReactContent(Swal);

const GroupDetails = ({ groupId, groupName }) => {
    const userid = JSON.parse(localStorage.getItem("userid"));
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isSettleUpModalOpen, setSettleUpModalOpen] = useState(false);

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
        } finally {
            setLoading(false);
        }
    }, [groupId]);

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
        }
    }, [groupId]);

    const handleDelete = async (expenseId) => {
        const result = await MySwal.fire({
            title: "Are you sure?",
            text: "This expense will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/api/expenses/${expenseId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`,
                    },
                });

                if (response.ok) {
                    Swal.fire("Deleted!", "Expense has been deleted.", "success");
                    setExpenses(prev => prev.filter(expenses => expenses.id !== expenseId));
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || "Failed to delete expense.");
                }
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        }
    };

    useEffect(() => {
        if (groupId) {
            getUsersOfAGroup();
            fetchExpenses();
        }
    }, [groupId, getUsersOfAGroup, fetchExpenses]);

    if (loading) return <Typography variant="h6">Loading group data...</Typography>;
    if (!group) return <Typography variant="h6">No group found.</Typography>;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100%", p: 2 }}>
            <Grid container sx={{ flexGrow: 1, height: "100%" }} spacing={3}>
                <Grid item xs={9} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
                        {groupName}
                    </Typography>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flexGrow: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="h5" fontWeight="bold">Expenses</Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button variant="contained" color="primary" startIcon={<PaymentsIcon />} onClick={() => setExpenseModalOpen(true)}>
                                    Add Expense
                                </Button>
                                <Button variant="contained" color="secondary" startIcon={<DoneAllIcon />} onClick={() => setSettleUpModalOpen(true)}>
                                    Settle Up
                                </Button>
                            </Box>
                        </Box>

                        <List sx={{ flexGrow: 1, maxHeight: "60vh", overflowY: "auto" }}>
                            {expenses.length > 0 ? (
                                expenses.map((expense) => {
                                    const paidByUser = group.users.find(u => u.ID === expense.paid_by);
                                    const participants = expense.participants || [];
                                    const otherUser = participants.find(p => p.user_id !== userid);
                                    const paidByName = paidByUser?.username || "Someone";
                                    const otherName = otherUser?.username || "Unknown";

                                    const userOwe = participants.find(p => p.user_id == userid);
                                    const amountOwed = userOwe?.amount_owed?.toFixed(2) || "0.00";
                                    const amountYouAreOwed = expense.paid_by == userid
                                        ? (expense.amount - parseFloat(amountOwed)).toFixed(2)
                                        : "0.00";

                                    let activityText;

                                    if (expense.title === "SETTLE_UP_PAYMENT") {
                                        if (expense.paid_by == userid) {
                                            activityText = (
                                                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                    You settled up <b>${expense.amount}</b> with <b>{otherName}</b>.
                                                </Typography>
                                            );
                                        } else if (otherUser?.user_id == userid) {
                                            activityText = (
                                                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                    <b>{paidByName}</b> paid <b>${expense.amount}</b> to you.
                                                </Typography>
                                            );
                                        } else {
                                            activityText = (
                                                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                    <b>{paidByName}</b> settled up <b>${expense.amount}</b> with <b>{otherName}</b>.
                                                </Typography>
                                            );
                                        }
                                    } else {
                                        if (expense.paid_by == userid) {
                                            activityText = (
                                                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                    You paid <b>${expense.amount}</b> for <b>{expense.title}</b>. You are owed <b>${amountYouAreOwed}</b>.
                                                </Typography>
                                            );
                                        } else {
                                            activityText = (
                                                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                                                    <b>{paidByName}</b> paid <b>${expense.amount}</b> for <b>{expense.title}</b>. You owe <b>${amountOwed}</b>.
                                                </Typography>
                                            );
                                        }
                                    }

                                    return (
                                        <ListItem key={expense.id} divider>
                                            <AttachMoneyIcon sx={{ color: "#4CAF50", mr: 1 }} />
                                            <ListItemText primary={activityText} />
                                            {expense.title !== "SETTLE_UP_PAYMENT" && (
                                                <Chip
                                                    label={
                                                        expense.paid_by == userid
                                                            ? `You are owed $${amountYouAreOwed}`
                                                            : `You owe $${amountOwed}`
                                                    }
                                                    color={expense.paid_by === userid ? "success" : "error"}
                                                    variant="outlined"
                                                />
                                            )}
                                            <Tooltip title="Delete expense">
                                                <IconButton color="error" onClick={() => handleDelete(expense.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary">No recent expenses</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={3} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Members</Typography>
                        <List sx={{ maxHeight: "60vh", overflowY: "auto" }}>
                            {group?.users?.length ? group.users.map((user, index) => (
                                <ListItem key={index}>
                                    <PersonIcon sx={{ mr: 1 }} />
                                    <ListItemText primary={user.username} />
                                </ListItem>
                            )) : (
                                <Typography variant="body2" color="textSecondary">No members found</Typography>
                            )}
                        </List>
                        <Box mt={2}>
                            <Button fullWidth variant="outlined" onClick={() => setAddMemberModalOpen(true)} startIcon={<AddCircleOutlineIcon />}>
                                Add Member
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modals */}
            <AddMemberModal
                open={isAddMemberModalOpen}
                onClose={() => setAddMemberModalOpen(false)}
                groupName={groupName}
                groupUsers={group.users}
                groupId={groupId}
                onUsersAdded={getUsersOfAGroup}
            />
            <AddExpenseModal
                open={isExpenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                groupId={groupId}
                members={group.users}
                currentUser={userid}
                fetchExpenses={fetchExpenses}
            />
            <SettleUpModal
                open={isSettleUpModalOpen}
                onClose={() => setSettleUpModalOpen(false)}
                users={group.users}
                currentUser={userid}
                groupId={groupId}
                fetchExpenses={fetchExpenses}
                allowGroupSelect={false}
            />
        </Box>
    );
};

export default GroupDetails;

