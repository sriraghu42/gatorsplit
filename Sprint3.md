## Backend-API's

These API's are designed to manage user authentication, track expenses, and provide dashboard functionalities for financial management. These enables users to register, log in, manage personal and group expenses, and track balances efficiently. These API follows RESTful principles and requires authentication for protected endpoints.


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
