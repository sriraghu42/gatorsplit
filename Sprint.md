# Sprint2



## Backend-API's
These API's are designed to manage user authentication, track expenses, and provide dashboard functionalities for financial management. These enables users to register, log in, manage personal and group expenses, and track balances efficiently. These API follows RESTful principles and requires authentication for protected endpoints.


## Authentication API (auth.go)

These endpoints handle user authentication, including registration, login, and retrieving user profile information.

## 1. User Registration

**Purpose** : Allows a new user to create an account.

**Endpoint**: POST /register

**Request Body**:

```
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

## Responses:

**201 Created** – Account successfully created.

**400 Bad Request** – Missing required fields.

## 2. User Login

**Purpose** : Allows a new user to create an account.

**Endpoint**: POST /login

**Request Body**:

```
{
  "username": "string",
  "password": "string"
}
```

## Responses:

**200 Ok** – Returns a JWT token.

**401 Unauthorized** – Invalid credentials.

**Example Response:**:

```
{
  "token": "jwt_token_string"
}
```



## Dashboard API (dashboard.go)

These endpoints provide a summary of a user's financial balances.

## 3. Get User Dashboard Balances

**Purpose**: Retrieves the total amount a user owes, is owed, and net balance.

**Endpoint**: GET /dashboard/{user_id}

**Path Parameter:**

```

user_id (integer) – ID of the user.

```
**Headers**
```
Key                 Value                      Description

Authorization.    Bearer <TOKEN>            API Key for authentication

Content-Type      application/json          Data format
```
**Responses:**

**200 OK** – Returns user balances.

**400 Bad Request** – Invalid user ID.

**Example Response:**

```
{
  "total_owed": 100.0,
  "total_due": 50.0,
  "net_balance": -50.0,
  "users": [
    {
      "user_id": 1,
      "username": "John",
      "amount_owed": 50.0,
      "amount_due": 20.0,
      "net_balance": -30.0
    }
  ]
}
```

## Expense APIs

## 4. Create a Personal Expense

**Purpose** :This API creates an expense shared between users without being part of a group.

 **Endpoint**:POST /expenses/personal

**Headers**
```
Key                 Value                      Description

Authorization.    Bearer <TOKEN>            API Key for authentication

Content-Type      application/json          Data format
```
 **Request Body**

```

{
  "title": "Dinner",
  "amount": 50.75,
  "paid_by": 1,
  "split_with": [1, 2, 3]
}
```
## Explanation
**title (string):** Name of the expense.

**amount (float):** Total amount of the expense.

**paid_by (integer):** User ID who paid.

**split_with (array of integers):** List of user IDs who share the expense.

**Responses :** Success (201)
```

{
  "message": "Personal expense added successfully"
}
```
**Errors**

**400** : "Invalid request payload"

## 5. Create a Group Expense

**Purpose**: This API adds an expense to a group or thread.

**Endpoint**: POST /expenses

**Headers**:
```

Key                Value                       Description

Authorization     Bearer <TOKEN>            API Key for authentication

Content-Type      application/json          Data format

```
**Request Body**
```

{
  "title": "Hotel Stay",
  "amount": 120.00,
  "paid_by": 2,
  "group_id": 5,
  "split_with": [2, 3, 4]
}

```

## Explanation

**title (string):** Name of the expense.

**amount (float):** Total cost.

**paid_by (integer):** User ID who paid.

**group_id (integer):** Group ID (if applicable).

**split_with (array of integers):** User IDs sharing the expense.

**Responses**: Success (201)

```

{
  "message": "Expense added successfully"
}

```

**Errors**

**400**  "Invalid request payload"  Ensure all required fields are provided


## Group APIs
## 6. Create a Group

**Purpose**:
This API creates a group and adds users to it.

**Endpoint**:POST /groups

**Headers**
```
Key                 Value                      Description

Authorization.    Bearer <TOKEN>            API Key for authentication

Content-Type      application/json          Data format
```

**Request Body**

```
{
  "name": "Weekend Trip",
  "user_ids": [1, 2, 3]
}
```

## Explanation

**name (string):** Group name.

**user_ids (array):** List of users to add.

**Responses** Success (201)

```
{
  "message": "Group created successfully"
}
```
**Errors**


**400 :** "Group name is required" Provide a valid group name


## 7. Get Group Users
 **Purpose:** This API retrieves all users in a specific group.

**Endpoint** : GET /groups/{id}/users

**Path Parameters**

```
Parameter  Type      Description

 id        Int          Group ID

```

**Responses** Success (200)

```
{
  "group_name": "Trip Buddies",
  "users": [
    {
      "id": 1,
      "name": "Alice"
    },
    {
      "id": 2,
      "name": "Bob"
    }
  ]
}
```

**Errors**

**404** : "Group not found". Ensure id is correct

## 8.Get group balances

**Purpose**:The GetGroupBalances endpoint retrieves the total balances within a specific group, detailing how much each user owes, is owed, and their net balance. 

**Endpoint:** GET /group/{group_id}/balances

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

The function extracts group_id from the request URL.

Executes a SQL query using WITH statements to:

Calculate the total amount each user owes.

Calculate the total amount each user is owed.

Compute the net balance (amount_due - amount_owed).

If no data is found, returns an empty list.

Otherwise, returns a JSON array with each user’s balance details.


## 9 Delete a Group

**Purpose** Deletes a group and all associated records.

**Endpoint** : DELETE /groups/{group_id}

**Path Parameters**

```

Parameter    Type               Description

group_id      Int           The unique ID of the group

```
**Responses** Success (200)
```

{
  "message": "Group deleted successfully"
}

```

**Errors**

**404**: "Group not found"   Ensure group_id exists




## Unit tests

## 1. Authentication Tests (auth_test.go)
**1.Test Case: TestRegister**

**Purpose:** To verify that user registration works correctly by sending a POST request with user details.

**Implementation Details:**

A mock database is initialized (database.SetupMockDB()).

A sample request body with username, email, and password is created.

The request is sent to the /register endpoint using http.NewRequest.

The response is captured using httptest.NewRecorder().

The test verifies that the response code is 201 Created.

**Expected Outcome:**

If registration is successful, the status code should be 201.

If the response does not match expectations, an error is logged.

**2.Test Case: TestLogin**

**Purpose:** To verify user authentication with correct credentials.

**Implementation Details:**

A mock user is created with a hashed password in the database.

A login request with valid credentials is sent to the /login endpoint.

The response is captured and validated for a 200 OK status.

**Expected Outcome:**

If login is successful, the response should return 200 OK.

If authentication fails, the response will indicate an error.

## 2. Dashboard Tests (dashboard_test.go)
**1. Test Case: TestGetDashboardBalances**

**Purpose:** : To validate the balance retrieval functionality from the dashboard.

**Implementation Details:**

A mock database is set up.

Test users (user1 and user2) are inserted into the database.

An expense is created where user1 pays for user2.

The API is called using a GET request to /api/dashboard/balances/{user_id}.

The response JSON is checked to ensure it contains a total_owed field.

**Expected Outcome:**

The response should return 200 OK.

The total_owed field should be present in the response.

## 3.Database tests(Database_test.go)


**1.Test Case:** SetupMockDB

**Purpose:**

Initializes an in-memory SQLite database for testing.

Ensures that all database operations are performed in isolation.

**Implementation Details:**

Calls gorm.Open(sqlite.Open(":memory:")) to create an in-memory database.

Runs AutoMigrate() to apply schema migrations for the following models:

User

Group

GroupUser

Thread

Expense

ExpenseParticipant

Assigns the mock database to the global database.DB instance.

**Expected Outcome:**

The database should be initialized without errors.

All tables should be created successfully.

**2.Test Case: TestDatabaseConnection**

**Purpose:**

Validates that the database connection is properly initialized.

**Implementation Details:**

Calls SetupMockDB() to initialize the mock database.

Checks if database.DB is nil.

If database.DB is nil, the test fails with t.Fatal("Mock database was not initialized").

**Expected Outcome:**

If the database is correctly initialized, the test should pass.

If the database is not initialized, the test should fail with an appropriate error message.

## 4. Group Tests (group_test.go)

**1.Test Case: TestCreateGroup**

**Purpose:** To verify if a group can be created successfully.

**Implementation Details:**

A mock database is initialized.

A POST request with group details (name and user_ids) is sent to /groups.

The response is validated for a 200 OK status.

**Expected Outcome:**

If the group creation is successful, the API should return 200 OK.

**2. TestCase: TestGetUserGroups**

**Purpose:** To ensure user groups are retrieved correctly.

**Implementation Details:**

A test group and associated users are created.

A GET request is sent to /users/groups with a mock user context.

The response is checked to ensure it contains at least one group.

**Expected Outcome:**

The response should contain at least one group.

The API should return 200 OK.

**3. Test Case: TestDeleteGroup**

**Purpose:** To check if a group can be deleted successfully.

**Implementation Details:**

A test group is created in the mock database.

A DELETE request is sent to /groups/{group_id}.

The response is validated for a 200 OK status.

**Expected Outcome:**

If the group deletion is successful, the API should return 200 OK.


## 5. Expense Tests (expense_test.go)
**1.Test Case: TestCreateExpense**

**Purpose:** To verify that a group expense can be successfully created.

**Implementation Details:** 

A mock database is initialized using database.SetupMockDB().

A test group (Trip Friends) and users (Alice and Bob) are inserted into the 
database.

A POST request is sent to /expenses with the following details:

```
{
  "title": "Dinner Bill",
  "amount": 100.0,
  "paid_by": 1,
  "group_id": 1,
  "split_with": [1, 2]
}
```
**The response is recorded and validated for:**

HTTP status code 201 Created.

**Expected JSON response**

```

{

 "message": "Expense added successfully"

 }.

```

**Expected Outcome:**

If expense creation is successful, the API should return 201 Created.

If the response message does not match, an error is logged.

**2.Test Case: TestCreatePersonalExpense**

**Purpose:** To verify that a personal expense can be created successfully.

**Implementation Details:**

A mock database is set up.

Test users (Charlie and David) are created.


A POST request is sent to /personal-expense with the following details:
```
{
  "title": "Movie Tickets",
  "amount": 50.0,
  "paid_by": 1,
  "split_with": [1, 2]
}
```
**The response is checked for:**
HTTP status code 201 Created.

**Expected JSON response**

```
 { 

"message": "Personal expense added successfully"

 }.

```

**Expected Outcome:**

If personal expense creation is successful, the API should return 201 Created.

If the response message does not match, an error is logged.



