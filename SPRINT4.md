# Sprint4

## User Stories
[View User Stories](https://github.com/sriraghu42/gatorsplit/issues?q=is%3Aissue%20%20label%3Asprint4%20label%3AUserStory)

## Issues Overview
•⁠  ⁠*Planned Issues:* [View Here](https://github.com/sriraghu42/gatorsplit/issues?q=is%3Aissue%20%20label%3Asprint4)
•⁠  ⁠*Successfully Completed Issues:* [View Here](https://github.com/sriraghu42/gatorsplit/issues?q=is%3Aissue%20state%3Aclosed%20%20label%3Asprint4)

## Demo Video: 

[Demo Video]()

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

## Backend-API's

The API enables comprehensive retrieval of all group expenses with detailed context—including payer information and individual participant obligations—and supports the recording of direct settlements between members. It additionally computes and delivers each member’s aggregate amounts owed, amounts due, and resulting net balance for the group.

## Group Endpoints (group.go)

These endpoints handle the balances and details  of a group.

## 1. Get group balances

**Purpose**:The GetGroupBalances endpoint retrieves the total balances within a specific group, detailing how much each user owes, is owed, and their net balance. 

**Endpoint:** 
```

 GET /group/{group_id}/balances

```

**Path Parameter:**

group_id (integer) – The ID of the group for which balances need to be retrieved.

**Responses:**

200 OK – Returns the list of users with their balance details.

400 Bad Request – Invalid group ID.


**Successful Response Example:**

```

[
  {
    "user_id": 1,
    "username": "Alice",
    "amount_owed": 50.0,
    "amount_due": 20.0,
    "net_balance": -30.0
  },
  {
    "user_id": 2,
    "username": "Bob",
    "amount_owed": 30.0,
    "amount_due": 50.0,
    "net_balance": 20.0
  }
]
```

**Response Fields:**

**user_id:** The unique ID of the user.

**username:** The name of the user.

**amount_owed:** The total amount the user owes within the group.

**amount_due:** The total amount the user is owed within the group.

**net_balance:** The final balance (amount_due - amount_owed).

**Implementation Details**

The function extracts **group_id** from the request URL.

Executes a SQL query using WITH statements to:

Calculate the total amount each user owes.

Calculate the total amount each user is owed.

Compute the net balance (amount_due - amount_owed).

If no data is found, returns an empty list.

Otherwise, returns a JSON array with each user’s balance details.

## 2. Get Group Expenses With Details 

**Purpose** :The GetGroupExpensesWithDetails endpoint returns all expenses for a given group, including each expense’s core fields, any associated thread metadata, and the list of participants (with their username and owed amount) for each expense.

**Endpoint**:
``` 

GET /groups/{group_id}/expenses
 
```

**pathparameters**:

```

group_id (integer) – The ID of the group whose expenses you want to fetch.

```

## Responses:

**200 OK** –  Returns a JSON array of expense objects (empty array if there are no expenses).

**Successful Response Example**

```

[
  {
    "id": 1,
    "title": "trip Expense",
    "amount": 200.0,
    "paid_by": 1,
    "group_id": 1,
    "thread_id": 1,
    "thread_name": "Y block",
    "participants": [
      {
        "user_id": 2,
        "username": "Yeswanth",
        "amount_owed": 100.0
      }
    ]
  }
]


```

**Response Fields :**

**id** – Unique ID of the expense.

**title** – Description or title of the expense.

**amount**  – Total amount for this expense.

**paid_by** – User ID of who paid.

**group_id** – ID of the group this expense belongs to.

**thread_id**  –  ID of an associated discussion thread.

**thread_name**  –  Name of that thread.

**participants**  – List of who owes on this expense:

**user_id** – ID of the participant.

**username**  – Their username.

**amount_owed**  – How much they owe for this expense.

## Implementation Details

Extract group_id from URL via mux.Vars.

**Fetch expenses:**

```

SELECT e.id, e.title, e.amount, e.paid_by, e.group_id, e.thread_id, t.name AS thread_name
FROM expenses e
LEFT JOIN threads t ON e.thread_id = t.id
WHERE e.group_id = ?
Populates a slice of anonymous structs with these fields.

```
For each expense, run a second query to load its participants:

```

SELECT ep.user_id, u.username, ep.amount_owed
FROM expense_participants ep
JOIN users u      ON ep.user_id = u.id
WHERE ep.expense_id = ?
Attach the participants slice to each expense entry.

```

**Encode JSON:**

If no expenses found, len(expenses)==0, returns an empty array ([]).

Otherwise, returns the populated expense list.


## Expense API (Expense.go)

These endpoints managing expense-related operations (such as creation, settlement, and deletion). When a group is deleted, all associated expenses (and their related records) managed by expense.go are also removed.

## 3. Settle group Expense

## **Purpose**  

The **Settle Group Expense** endpoint records a one-to‑one settlement expense between two users within a specified group. It creates an expense entry for the payer and adds a single participant record for the user who owes the amount.

## **Endpoint**  

```

POST /groups/{group_id}/expenses/settle

```

## **Path Parameter**  

```

 group_id (integer) – The ID of the group in which the settlement is to be recorded.

```
## **Request Body**  

```


{
  "title": "Dinner Split",
  "amount": 120.50,
  "paid_by": 2,
  "settled_with": 3,
  "group_id": 1
}

```

### **Request Fields**  
- **title** (string) – A short description of the settlement.  
- **amount** (float) – The amount to be settled (must be greater than 0).  
- **paid_by** (uint) – The user ID who paid the expense.  
- **settled_with** (uint) – The user ID who owes the amount.  
- **group_id** (uint) – The group ID for this settlement.

## **Responses**  
- **201 Created** – Settlement recorded successfully.  
- **400 Bad Request** – Invalid JSON payload or missing/invalid fields.  
- **500 Internal Server Error** – Error creating the expense or participant in the database.

## **Successful Response Example**  
```json
{
  "message": "Settlement recorded successfully"
}
```

## **Response Fields**  
- **message** (string) – Confirmation that the settlement was recorded.

## **Implementation Details**  
1. **Decode & validate**  
   - Read the JSON body into a request struct.  
   - Ensure `amount > 0`, `paid_by` and `settled_with` are non‑zero, and `group_id` is provided.  
2. **Create Expense**  
   - Insert a new `Expense` record with the given title, amount, payer, and group ID.  
3. **Create Participant**  
   - Insert a new `ExpenseParticipant` record linking the expense to the `settled_with` user, setting `amount_owed` equal to the full amount.  
4. **Respond**  
   - On success: return HTTP 201 with a JSON message.  
   - On validation error: return HTTP 400.  
   - On database error: return HTTP 500.


## Unit tests

## Group Tests (group_test.go)

## 1. TestGetGroupBalances

**Purpose:**  
To verify that the `GetGroupBalances` handler correctly computes each user’s total owed amount, amount due, and net balance within a group based on multiple expenses and participants.

**Implementation Details:**  
- Initialize an in‑memory SQLite database via `database.SetupMockDB()`.  
- Create two users (Alice and Bob) with unique emails and passwords.  
- Insert a `Group` record.  
- Create **Expense 1**: Alice pays \$100; add an `ExpenseParticipant` entry so Bob owes \$100.  
- Create **Expense 2**: Bob pays \$40; add an `ExpenseParticipant` entry so Alice owes \$40.  
- Build and send an HTTP **GET** request to `/groups/{group_id}/balances`, setting the `group_id` URL variable via `mux.SetURLVars`.  
- Capture the response with `httptest.NewRecorder()`.  
- Assert the HTTP status is **200 OK**.  
- Decode the JSON response into a slice of structs matching the balance schema.  
- Map the results by `user_id` for easy lookup.  
- Verify for **Alice**:  
  - `amount_owed` == 40  
  - `amount_due`  == 100  
  - `net_balance` == 60  
- Verify for **Bob**:  
  - `amount_owed` == 100  
  - `amount_due`  == 40  
  - `net_balance` == -60  

**Expected Outcome:**  
- **Status Code:** `200 OK`  
- **Response Body:**  
  ```json
  [
    {
      "user_id": 1,
      "username": "alice",
      "amount_owed": 40.0,
      "amount_due": 100.0,
      "net_balance": 60.0
    },
    {
      "user_id": 2,
      "username": "bob",
      "amount_owed": 100.0,
      "amount_due": 40.0,
      "net_balance": -60.0
    }
  ]
  ```  


## 2. TestGetGroupExpensesWithDetails

**Purpose:**  

To ensure the `GetGroupExpensesWithDetails` handler correctly returns all expenses for a group, including each expense’s core fields, any associated thread metadata, and the full list of participants (with username and owed amount).

**Implementation Details:**  
- Initialize an in‑memory SQLite database via `database.SetupMockDB()`.  
- Create two users (payer and participant) with unique emails and passwords.  
- Insert a `Group` record.  
- Insert a `Thread` record linked to that group.  
- Insert an `Expense` record tied to the group and thread.  
- Insert an `ExpenseParticipant` record linking the expense to the participant user.  
- Build and send an HTTP GET request to `/groups/{group_id}/expenses`, setting the `group_id` URL variable via `mux.SetURLVars`.  
- Capture the response with `httptest.NewRecorder()`.  
- Assert that the status code is **200 OK**.  
- Decode the JSON response into a slice of anonymous structs matching the handler’s output schema.  
- Verify exactly one expense is returned.  
- Compare each returned field (`id`, `title`, `amount`, `paid_by`, `group_id`, `thread_id`, `thread_name`) against the inserted values.  
- Verify the `participants` array contains exactly one entry with the correct `user_id`, `username`, and `amount_owed`.

**Expected Outcome:**  
- HTTP status code **200 OK**.  
- JSON response matching the inserted data:
  ```json
  [
    {
      "id": 1,
      "title": "Test Expense",
      "amount": 200.0,
      "paid_by": 1,
      "group_id": 1,
      "thread_id": 1,
      "thread_name": "Test Thread",
      "participants": [
        {
          "user_id": 2,
          "username": "participant",
          "amount_owed": 100.0
        }
      ]
    }
  ]
  ```




## Expense Tests (expense_test.go)

## 3. TestSettleGroupExpense

**Purpose:**  
To verify that the `SettleGroupExpense` handler correctly records a one‑to‑one settlement expense and creates the associated participant entry.

**Implementation Details:**  
- Initialize an in‑memory mock database via `database.SetupMockDB()`.  
- Insert a `Group` record to associate the settlement with.  
- Build a JSON payload containing:
  ```json
  {
    "title":        "Dinner Split",
    "amount":       120.50,
    "paid_by":      2,
    "settled_with": 3,
    "group_id":     <group.ID>
  }
  ```  
- Send an HTTP **POST** request to the `/groups/{group_id}/expenses/settle` endpoint with that payload.  
- Capture the response using `httptest.NewRecorder()`.  
- Assert the HTTP status is **201 Created**.  
- Decode the JSON body and confirm it contains:

  ```

  { "message": "Settlement recorded successfully" }

  ```  
- Query the `expenses` table to find an entry matching `title = "Dinner Split"` and `paid_by = 2`; verify:
  - `Amount` equals `120.50`  
  - `GroupID` matches the created group’s ID  
- Query the `expense_participants` table for `expense_id` and `user_id = 3`; verify:
  - `AmountOwed` equals `120.50`

**Expected Outcome:**  
- **Status Code:** `201 Created`  
- **Response Body:**
  ```

  {
    "message": "Settlement recorded successfully"
  }

  ```  
- A matching `Expense` record exists with the correct amount and group association.  
- A matching `ExpenseParticipant` record exists with the correct user and owed amount.

