/// <reference types="cypress" />

describe("Login and Create Group", () => {
    it("logs in, opens the create group modal, fills in the group name, selects members, and submits", () => {
        const email = "chand"; // Replace with valid email
        const password = "haha"; // Replace with valid password
        const groupName = "Spring break Trip"; // Change as needed
        const selectedUsers = ["chand", "varun"]; // Adjust based on available users

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

        // Click "Create Group" button to open the modal
        cy.contains("button", "Create Group").click();

        // Ensure modal appears
        cy.get("[role='presentation']").should("be.visible");

        // Fill in the group name
        cy.get("label").contains("Group Name").parent().find("input")
            .should("be.visible")
            .clear()
            .type(groupName);

        // Wait for users to load
        cy.wait(500);

        // Open the user selection dropdown
        // cy.get("label").contains("Add Users").parent().find("input").click();

        // Select users from the dropdown
        selectedUsers.forEach(user => {
            
            cy.get("label").contains("Add Users").parent().find("input").click();
            cy.get("ul[role='listbox']").contains(user).click();
            
            
           
        });

        cy.wait(500);
        // Ensure selected users are displayed
        // selectedUsers.forEach(user => {
        //     cy.get(".MuiChip-label").should("contain.text", user);
        // });
        

        // cy.get("body").click();// Close dropdown

        cy.get("button[label='create']")
            .should("exist")
            .should("be.visible")
            .should("be.enabled")
            .debug() // Debug to verify Cypress sees the button
            .click({ force: true });

        // Intercept API request for creating group
        cy.intercept("POST", "/api/groups").as("createGroup");
        // cy.get("button").contains("Create").should("be.visible").click();

        // Click the "Create" button
       
        // Wait for API response and verify request
        cy.wait("@createGroup").then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
            expect(interception.response.body).to.have.property("id");
            cy.log("Group Created:", interception.response.body);
        });

        // Ensure modal closes
        cy.get("[role='presentation']").should("not.exist");

        // Verify the new group appears in the UI
        cy.get(".group-list").should("contain.text", groupName);
    });
});
