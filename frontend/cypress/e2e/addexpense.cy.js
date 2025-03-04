/// <reference types="cypress" />

describe("Add Expense Flow", () => {
    it("logs in, navigates to a group, opens the add expense modal, fills sample data, and submits an expense", () => {
        const email = "chand"; // Replace with valid email
        const password = "haha"; // Replace with valid password
        const groupId = 9; // Adjust as needed
        const expenseTitle = "Dinner";
        const expenseAmount = "50";
        const payer = "chand"; // Adjust based on available users
        const splitUsers = ["chand", "varun"]; // Adjust as needed

        cy.visit("/login");

        // Intercept login request
        cy.intercept("POST", "/login").as("loginUser");

        // Log in
        cy.get("input[name='email']").clear().type(email);
        cy.get("input[name='password']").clear().type(password);
        cy.get("button[type='submit']").click();

        // Wait for login request
        cy.wait("@loginUser").then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.have.property("token");

            const token = interception.response.body.token;
            cy.window().then((win) => {
                win.localStorage.setItem("authToken", token);
            });

            cy.window().its("localStorage.authToken").should("eq", token);
        });

        // Ensure dashboard loads
        cy.url().should("include", "/dashboard");

        // Navigate to group page
        cy.visit(`/groups/${groupId}`);
        cy.url().should("include", `/groups/${groupId}`);

        // Click "Add Expense" button inside the Box container
        cy.contains("button", "Add Expense").click();

        // Ensure modal appears
        cy.get("[role='dialog']").should("be.visible");

        // Fill out the expense form inside the modal
        cy.get("label").contains("Expense Title").parent().find("input").clear().type(expenseTitle);
        cy.get("label").contains("Amount").parent().find("input").clear().type(expenseAmount);

        // Select payer
        cy.get("label").contains("Who Paid?").parent().click();
        cy.get("ul[role='listbox']").contains(payer).click();

        // Select users for splitting
        cy.get("label").contains("Select Users").parent().click();
        splitUsers.forEach(user => {
            cy.get("ul[role='listbox']").contains(user).click();
        });
        cy.get("body").click(); // Close dropdown

        // Wait for React state updates (prevents the submit button from staying disabled)
        cy.wait(500);

        // Intercept API request for creating expense
        cy.intercept("POST", `/api/expenses`).as("createExpense");

        // Ensure submit button is enabled before clicking
        cy.get("button").contains("Add expense").should("be.visible").click();

        // Wait for API response and verify request
        cy.wait("@createExpense").then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
            expect(interception.response.body).to.have.property("id");
            cy.log("Expense Created:", interception.response.body);
        });

        // Ensure modal closes
        cy.get("[role='dialog']").should("not.exist");

        // Verify expense appears in the UI
        cy.get(".expense-list").should("contain.text", expenseTitle).and("contain.text", `$${expenseAmount}`);
    });
});
