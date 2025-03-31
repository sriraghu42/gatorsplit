# Sprint3

## User Stories
[View User Stories]

## Issues Overview
•⁠  ⁠*Planned Issues:* [View Here]
•⁠  ⁠*Successfully Completed Issues:* [View Here]
•⁠  ⁠*Issues Not Completed:* [View Here]

## Demo Video: 

## Frontend Functionality 
The frontend allows users to manage groups, expenses, and threads with a smooth UI and responsive interactions.

### Group Management:
- View a list of joined groups.
- Create new groups by selecting users.
- Delete existing groups with confirmation.
- Edit group members while avoiding duplicates.

### Expense Management:
- View all expenses within a group, including payer and amount.
- Add new expenses with title, amount, and user splits.
- Delete individual expenses via a confirmation modal.

### Responsive UI Feedback:
- SweetAlert modals for confirmations and errors.
- Loading indicators and success/error messages for API responses.

### Error Handling & Edge Cases:
- Empty group or expense lists display friendly messages.
- Failed actions (e.g., deletion errors) show alerts without breaking the UI.

## Testing

### Jest Unit Testing

- deleteExpense.test.js – Tests deleting an expense and handling success/error responses.
- ConfirmAndDeleteGroup.test.js – Verifies group deletion flow with confirmation modal.
- AddMembersToTheGroup.test.js – Ensures members can be added to a group without duplicates.
- CreateGroup.test.js – Tests group creation form input, submission, and response handling.

### Cypress Testing

#### 1. deleteeGroup.cy.js

- This test logs in a user, sets the received JWT token in localStorage, and performs a secure delete operation on a group named "Spring break Trip". It ensures only authenticated users can access and perform deletions.

#### 2. deleteGroupPage.cy.js 

- The test simulates a complete user journey—logging in, navigating to the groups page, and deleting a specific group (Group1). It ensures the delete button is visible, clicks it, and confirms the deletion via SweetAlert, verifying the group's removal from the UI.

#### 3. deleteexpense.cy.js

- This test ensures that a logged-in user can successfully delete an expense from a group. It confirms the backend deletion via the intercepted DELETE /api/expenses/* call and verifies that the expense is removed from the UI, maintaining consistency between the frontend and backend.


#### 4. editMembersGroup.cy.js

- Simulates editing group members by adding new users to an existing group and confirms the UI reflects updated member list after API success.
- Validates that existing members are not duplicated when added again and ensures success message is shown only for new additions.

#### 5. createGroupFromPage.cy.js

- Verifies that clicking the "Create Group" button on the group listing page opens the group creation modal with input fields and user selection options.

- Simulates filling in group name and selecting members, submits the form, intercepts the POST /api/groups call, and confirms the new group appears in the list after successful creation.

## Backend-API's

These endpoints let users start new discussion threads in groups, retrieve all threads within a group, and view a consolidated summary of their expense balances across those threads.


## Group Endpoints (group.go)

These endpoints handle the updating group members, deleting groups of a group.

## 1. Update Group Members

**Purpose** : This API updates a group by adding new members while preventing duplicates.

**Endpoint**: PUT /groups/{group_id}/members

**Headers**:

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```
**pathparameters**:

```

group_id (integer) – ID of the group to update.

```
**Request Body**:

```
{
  "user_ids": [1, 2, 3]
}

```
**Explanation:**

user_ids (array of integers): List of user IDs to be added to the group.
Note: If a user is already a member, they will not be added again. 

## Responses:

**200 OK** – Returns a success message.
```
{
  "message": "New members added successfully"
}

```

**400 Bad Request** – Invalid group ID or invalid request body.

**500 Internal Server Error** – Error updating group members.

## 2. Delete Group

**Purpose** :This API deletes a group along with all its associated records (expenses, threads, and group users).

**Endpoint**:DELETE /groups/{group_id}

**Headers**:
``` 

  Key              Value                      Description
 ---------------------------------------------------------------
 Authorization    Bearer <TOKEN>           API Key for authentication
 Content-Type     application/json         Data format

```

**pathparameters**:
```

group_id (integer) – ID of the group to delete.

```
**Explanation:**

This endpoint removes the specified group and all related records, including:

Expense participants associated with the group's expenses.

Expenses linked to the group.

Threads associated with the group.

Group-user relationships.

## Responses:

**200 OK** – Returns a success message.
```
{
  "message": "Group deleted successfully"
}

```

**500 Internal Server Error** –Error deleting the group or its related records.



## Expense API (Expense.go)

These endpoints managing expense-related operations (such as creation, settlement, and deletion). When a group is deleted, all associated expenses (and their related records) managed by expense.go are also removed.

## 3. Delete Expense

**Purpose**: This API deletes a specific expense along with all its associated expense participants.

**Endpoint**: DELETE /expenses/{expense_id}

**Headers**:
```
Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```
**Path Parameter:**
```

expense_id (integer) – ID of the expense to delete.

```

**Explanation**:

This endpoint removes the specified expense record and all related expense participant records. 

The Expense API (implemented in `expense.go`) manages all operations related to expense management, including creating, settling, and deleting expenses. 

When an expense is deleted, its associated expense participants are also removed to ensure data consistency.

**Responses:**

**200 OK** – Returns a success message.

```

{ 

"message": "Expense deleted successfully"

}

```

**Errors:**

- **500 Internal Server Error** – Error deleting the expense or its associated expense participants.

## Thread Api (thread.go)

## 4. Create Thread

**Purpose**: Allows a user to create a new thread within a group.

**Endpoint**: POST /threads

**Headers:**

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```
**Request Body:**

```

{
  "name": "Trip Planning",
  "group_id": 1,
  "created_by": 1
}

```
**Explanation:**

**name (string)**:The name/title of the thread.

**group_id (integer)**: The ID of the group where the thread is created.

**created_by (integer)**: The user ID who is creating the thread.

**Responses:**

**201 Created**:

```

{
  "message": "Thread created successfully"
}

```
**Errors:**

**400 Bad Request**– Invalid request payload.

**500 Internal Server Error** – Error creating the thread.

## 5. Get Threads By Group

**Purpose**: Retrieves all threads within a specific group.

**Endpoint**: GET /threads/group/{group_id}

**Headers:**

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```
**Path Parameter**:

```

 group_id (integer) – ID of the group.

```

**Explanation:**

Returns an array of threads (each containing its ID and name) that belong to the specified group.

**Responses:**

**200 OK**

```

[
  {
    "thread_id": 1,
    "thread_name": "Trip Planning"
  },
  {
    "thread_id": 2,
    "thread_name": "Event Discussion"
  }
]

```

**Errors:**

**500 Internal Server Error** – Error retrieving threads.

## 6. Get User Threads With Balances

**Purpose:** Retrieves all threads a user belongs to along with the total balance for each thread.

**Endpoint:** GET /threads/user/{user_id}/balances

**Headers:**

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```

**Path Parameter:**

```

user_id (integer) – ID of the user.

```
**Explanation:**

Each thread in the response includes its ID, name, and a total_balance showing how much the user owes or is owed in that thread.

**Responses:**

**200 OK**

```

[
  {
    "thread_id": 1,
    "thread_name": "Trip Planning",
    "total_balance": 100.0
  }
]

```
**Errors:**

**500 Internal Server Error** – Error retrieving thread balances.

## 7. Get Thread Balances

**Purpose:** Retrieves total balances for all users within a specific thread.

**Endpoint:** GET /threads/{thread_id}/balances

**Headers:**

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```

**Path Parameter:**

```

thread_id (integer) – ID of the thread.

```
**Explanation:**

The response shows each user’s balance details in the thread, including the amount they owe, the amount owed to them, and their net balance.

**Responses:**

**200 OK**

```

[
  {
    "user_id": 1,
    "username": "Alice",
    "amount_owed": 50.0,
    "amount_due": 100.0,
    "net_balance": 50.0
  },
  {
    "user_id": 2,
    "username": "Bob",
    "amount_owed": 50.0,
    "amount_due": 0.0,
    "net_balance": -50.0
  }
]

```

**Errors:**

**500 Internal Server Error** – Error retrieving thread balances.

## 8. Delete Thread

**Purpose:** Deletes a specific thread and all its related records (expenses and expense participants).

**Endpoint:** DELETE /threads/{thread_id}

**Headers:**

```

Key              Value                      Description
---------------------------------------------------------------
Authorization    Bearer <TOKEN>           API Key for authentication
Content-Type     application/json         Data format

```

**Path Parameter:**

```

thread_id (integer) – ID of the thread to delete.

```
**Explanation:**

Removes the specified thread from the system, along with any expenses and expense participants linked to that thread.

**Responses:**

**200 OK**

```

{
  "message": "Thread deleted successfully"
}

```
**Errors:**

**500 Internal Server Error** – Error deleting the thread or its related  

## Unit tests

## Group Tests (group_test.go)

## 1.  TestUpdateGroupMembers

**Purpose**:  

To verify that updating group members works correctly by adding new members while ignoring duplicates.

   **Implementation Details**:  
   - A mock database is initialized using `database.SetupMockDB()`.
   - A group is created with an initial member.
   - A PUT request is sent to the `/groups/{group_id}/members` endpoint with a JSON payload containing an array of user IDs (including one that already exists and new ones).
   - The response is captured using `httptest.NewRecorder()`.
   - The test checks that the response code is 200 OK and that the returned message confirms that new members have been added.
   - It then queries the database to ensure that the group contains the correct unique set of members.

   **Expected Outcome**:  
   - If the update is successful, the status code should be 200 OK.
   - The response should include the message:  

     ```

     {
       "message": "New members added successfully"
     }

     ```
- The group should contain exactly the new set of unique members (e.g., if 
the payload is `[1, 2, 3]` with user 1 already present, the final group should 
have users 1, 2, and 3).

## 2. TestDeleteGroup

   **Purpose**:  

   To verify that a group and all its associated records (such as expenses, threads, and group users) are deleted successfully.

   **Implementation Details**:  
   - A mock database is initialized using `database.SetupMockDB()`.
   - A group is created and inserted into the database.
   - A DELETE request is sent to the `/groups/{group_id}` endpoint with the correct group ID.
   - The response is captured using `httptest.NewRecorder()`.
   - The test checks that the response code is 200 OK and that the returned message confirms the group deletion.
   - The database is queried to ensure that the group and its related records no longer exist.

   **Expected Outcome**:  
   - If deletion is successful, the status code should be 200 OK.
   - The response should include the message: 
 
     ```

     {
       "message": "Group deleted successfully"
     }

     ```
   - The group and its associated records should be completely removed from the database.

## Expense Tests (expense_test.go)

## 3.1. TestCreateExpense

   **Purpose**: 
 
   To verify that a group expense is created successfully by sending a POST request with valid details including the expense title, amount, the payer's ID, the group ID, and the user IDs sharing the expense.

   **Implementation Details**:  
   - A mock database is initialized using `database.SetupMockDB()` (via `TestMain`), ensuring all tests use an in‑memory SQLite mock DB.  
   - Test data is inserted: a group is created, and two users (e.g., Alice and Bob) are added to the database.  
   - A sample request payload is constructed with keys `"title"`, `"amount"`, `"paid_by"`, `"group_id"`, and `"split_with"`.  
   - A POST request is sent to the `/expenses` endpoint using `http.NewRequest`.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is compared against the expected output.

   **Expected Outcome**:  
   - If the expense is created successfully, the status code should be **201 Created**.  
   - The response should include the message:
  
     ```

     {
       "message": "Expense added successfully"
     }

     ```  
   - Any deviation will be logged as an error.

## 3.2.TestCreatePersonalExpense

   **Purpose**:
  
   To verify that a personal expense is created successfully by sending a POST request with valid details including the expense title, amount, the payer's ID, and an array of user IDs sharing the expense.

   **Implementation Details**:  
   - The mock database is initialized using `database.SetupMockDB()`, ensuring a clean state for the test.  
   - Two test users (e.g., Charlie and David) are created in the database.  
   - A sample request payload is prepared with keys `"title"`, `"amount"`, `"paid_by"`, and `"split_with"`.  
   - A POST request is sent to the `/personal-expense` endpoint using `http.NewRequest`.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is compared to the expected output.

   **Expected Outcome**:  
   - If the personal expense is created successfully, the status code should be **201 Created**.  
   - The response should include the message:  
     ```

     {
       "message": "Personal expense added successfully"
     }

     ```  
   - Any mismatch will be logged as an error.

## 3.3. TestDeleteExpense

   **Purpose**: 
 
   To verify that an expense and all its associated expense participant records are deleted successfully by sending a DELETE request with a valid expense ID.

   **Implementation Details**:  
   - The mock database is initialized using `database.SetupMockDB()` to ensure a clean state.  
   - Test data is inserted by creating an expense and its associated expense participant record(s).  
   - A DELETE request is sent to the `/expenses/{expense_id}` endpoint using `http.NewRequest`, where `{expense_id}` corresponds to the ID of the created expense.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is compared to the expected output.

   **Expected Outcome**:  
   - If the expense is deleted successfully, the status code should be **200 OK**.  
   - The response should include the message: 
 
     ```

     {
       "message": "Expense deleted successfully"
     }

     ```  
   - Any deviation (e.g., expense not found or deletion failure) will result in a logged error.


## Thread Tests (thread_test.go)

## 4 TestCreateThread

   **Purpose**: 
 
   To verify that a thread is created successfully by sending a POST request with valid details (thread name, group ID, and creator's user ID).

   **Implementation Details**:  

   - A mock database is initialized using `database.SetupMockDB()`.  
   - A group record is created along with a user (with a unique email).  
   - A sample request payload is constructed with keys `"name"`, `"group_id"`, and `"created_by"`.  
   - A POST request is sent to the `/threads` endpoint using `http.NewRequest`.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is compared against the expected output.  
   - The database is queried to confirm that the thread was successfully created.

   **Expected Outcome**:
  
   - If the thread is created successfully, the status code should be **201 Created**.  
   - The response should include the message: 
 
     ```

     {
       "message": "Thread created successfully"
     }

     ```  
   - The thread record should exist in the database.

---

## 5 TestGetThreadsByGroup

   **Purpose**: 
 
   To verify that all threads within a specific group are retrieved correctly.

   **Implementation Details**:  

   - A mock database is initialized using `database.SetupMockDB()`.  
   - A group is created and two thread records associated with that group are inserted into the database.  
   - A GET request is sent to the `/threads/group/{group_id}` endpoint using `http.NewRequest`, with the `group_id` set as a path parameter.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is decoded to an array of thread objects.

   **Expected Outcome**: 
 
   - If retrieval is successful, the status code should be **200 OK**.  
   - The response should be an array of threads, with a count equal to the number of threads created (in this case, 2).

---

## 6 TestGetUserThreadsWithBalances

   **Purpose**: 
 
   To verify that the API retrieves all threads a user is involved in, along with the total balance for each thread.

   **Implementation Details**: 
 
   - A mock database is initialized using `database.SetupMockDB()`.  
   - A user is created (with a unique email) in the database.  
   - A thread is created, and an expense is added to that thread with the user as the payer.  
   - An expense participant record is created for that user with a specified amount owed.  
   - A GET request is sent to the `/threads/user/{user_id}/balances` endpoint using `http.NewRequest`, with the `user_id` set as a path parameter.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is decoded to verify the thread and its total balance.

   **Expected Outcome**:
  
   - If the retrieval is successful, the status code should be **200 OK**.  
   - The response should include a thread with the correct `total_balance` (e.g., 100 if that is the sum of expense amounts).

---

## 7  TestGetThreadBalances

   **Purpose**: 
 
   To verify that the API retrieves detailed balance information for all users within a specific thread.

   **Implementation Details**:
  
   - A mock database is initialized using `database.SetupMockDB()`.  
   - Two users (each with unique emails) are created in the database.  
   - A thread is created, and an expense is added in that thread with one of the users as the payer.  
   - Expense participant records are created for both users (e.g., each owing 50 if the total expense is 100).  
   - A GET request is sent to the `/threads/{thread_id}/balances` endpoint using `http.NewRequest`, with the `thread_id` set as a path parameter.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is decoded to verify that balance details for both users are correct (e.g., one user with a net balance of 50 and the other with -50).

   **Expected Outcome**: 
 
   - If the retrieval is successful, the status code should be **200 OK**.  
   - The response should be an array of balance records with the correct details for each user.

---

## 8.TestDeleteThread

   **Purpose**: 
 
   To verify that a thread and all its associated records (expenses and expense participants) are deleted successfully.

   **Implementation Details**:  

   - A mock database is initialized using `database.SetupMockDB()`.  
   - A thread is created, and an expense is added under the thread along with an expense participant record.  
   - A DELETE request is sent to the `/threads/{thread_id}` endpoint using `http.NewRequest`, with the `thread_id` set as a path parameter.  
   - The response is captured using `httptest.NewRecorder()`, and the JSON response is compared to the expected output.  
   - The database is queried to confirm that the thread, its expenses, and expense participants have been deleted.

   **Expected Outcome**:  

   - If deletion is successful, the status code should be **200 OK**.  
   - The response should include the message:  

     ```

     {
       "message": "Thread deleted successfully"
     }

     ```  
   - The thread and its associated records should be removed from the database.



