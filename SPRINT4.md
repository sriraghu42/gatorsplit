# Sprint4

## Frontend Functionality  
The frontend continues to enhance user experience with smooth interactions and intuitive UI for managing groups, expenses, and balances.

### Settle Up Feature:
- Settle up balances with group members directly from the **Group screen** or **Dashboard**.
- Instantly updates UI to reflect new balances after settlement.
- SweetAlert modals used to confirm settlements and show success/failure.

### Dashboard Expense Addition:
- Add new expenses directly from the **Dashboard**, without navigating into a specific group.
- Smart auto-fill suggestions for groups and members based on recent activity.
- Expense form includes title, amount, payer, and split settings—all validated with inline error hints.

---

## Testing

### Jest Unit Testing

- `SettleUp.test.js` – Verifies settle up logic, including correct balance updates and feedback rendering.
- `DashboardAddExpense.test.js` – Tests dashboard expense form, including validation and API call success/failure flows.

### Cypress Testing

#### 1. settleUp.cy.js

- Logs in, navigates to a group or dashboard, clicks "Settle Up", confirms via SweetAlert, and checks balance updates.
- Intercepts PATCH/POST calls related to settlement to confirm API success.

#### 2. dashboardAddExpense.cy.js

- Simulates opening the dashboard add-expense modal, filling form, and submitting it.
- Verifies that expenses appear in the correct group view after creation and checks form validations.

Let me know if you'd like me to insert this into the existing Sprint3 doc or help create a new sprint file!
