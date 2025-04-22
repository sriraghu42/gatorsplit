/// <reference types="cypress" />

describe("Settle Up Flow", () => {
    it("logs in, navigates to a group, opens the settle up modal, fills details, and submits", () => {
      const email = "chandana";
      const password = "chandana";
      const groupId = 20; // Adjust based on your group setup
      const settleAmount = "10";
      const settleWithUser = "raghu"; // Should exist in group and not be current user
  
      cy.visit("/login");
  
      // Intercept login request
      cy.intercept("POST", "/login").as("loginUser");
  
      // Log in
      cy.get("input[name='email']").clear().type(email);
      cy.get("input[name='password']").clear().type(password);
      cy.get("button[type='submit']").click();
  
      // Wait for login and store token
      cy.wait("@loginUser").then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        const token = response.body.token;
        cy.window().then((win) => {
          win.localStorage.setItem("authToken", token);
        });
      });
  
      // Go to group page
      cy.visit(`/groups/${groupId}`);
      cy.url().should("include", `/groups/${groupId}`);
  
      // Click the "Settle Up" button
      cy.contains("button", "Settle Up").click();
  
      // Modal appears
      cy.get("[role='dialog']").should("contain.text", "Settle Up");
  
      // Fill the amount
      cy.get("label").contains("Amount").parent().find("input").clear().type(settleAmount);
  
      // Select user to settle with
      cy.get("label").contains("Select User").parent().click();
      cy.get("ul[role='listbox']").contains(settleWithUser).click();
  
      // Intercept the settlement POST request
      cy.intercept("POST", "/api/expenses/group/settle").as("settleExpense");
  
      // Submit
      cy.get("[role='dialog']").within(() => {
        cy.contains("button", "Settle").should("be.visible").and("not.be.disabled").click();
      });
      
  
      // Wait and verify
      cy.wait("@settleExpense").then(({ response }) => {
        expect(response.statusCode).to.eq(201);
      });
  
      // Ensure modal closes
      cy.get("[role='dialog']").should("not.exist");
  
      // Optional: Verify success toast or expense item appears
      cy.contains(`You settled up $${settleAmount}`).should("exist");
    });
  });
  