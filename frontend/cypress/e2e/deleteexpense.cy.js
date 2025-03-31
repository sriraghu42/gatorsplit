/// <reference types="cypress" />

describe("Delete Expense", () => {
    it("logs in, navigates to group, deletes an expense after confirmation, and verifies deletion", () => {
        const email = "chandana";
        const password = "chandana";
        const groupName = "Group1"; // Must exist with expenses

        cy.visit("/login");

        cy.intercept("POST", "/login").as("loginUser");

        // Login
        cy.get("input[name='email']").type(email);
        cy.get("input[name='password']").type(password);
        cy.get("button[type='submit']").click();

        cy.wait("@loginUser").then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            const token = response.body.token;
            cy.window().then((win) => {
                win.localStorage.setItem("authTokens", JSON.stringify(token));
            });
        });

        cy.url().should("include", "/dashboard");

        // Navigate to the specific group
        cy.contains("li", groupName).click();

        cy.url().should("include", "/groups");

        // Intercept DELETE request for expense
        cy.intercept("DELETE", "/api/expenses/*").as("deleteExpense");

        // Wait for expenses to load
        cy.wait(500); // Optional: increase if needed

        // Locate the first expense and delete it
        cy.get("li")
            .contains("paid") // adjust if needed to match expense entry
            .parents("li")
            .within(() => {
                cy.get("button[aria-label='delete']").click(); // IconButton
            });

        // Confirm SweetAlert
        cy.wait(500);
        cy.get(".swal2-confirm").click();

        // Wait for DELETE to go through
        cy.wait("@deleteExpense").then(({ response }) => {
            expect(response.statusCode).to.eq(200);
        });

        // Confirm expense is no longer in the list
        cy.get("ul").should("not.contain.text", "paid"); // Adjust if you know specific title
    });
});
