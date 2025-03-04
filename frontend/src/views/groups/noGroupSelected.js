import { Box, Typography } from "@mui/material";

const NoGroupSelected = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6" color="textSecondary">Select a group to view details</Typography>
        </Box>
    );
};

export default NoGroupSelected;
