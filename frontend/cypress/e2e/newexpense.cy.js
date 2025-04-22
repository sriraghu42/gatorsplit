/// <reference types="cypress" />

describe("Add Expense Flow - Full Fill", () => {
  it("logs in, opens modal, selects group, fills all fields, and submits", () => {
    const email = "chandana";
    const password = "chandana";
    const expenseTitle = "Dinner";
        const expenseAmount = "50";
        const payer = "chandana"; // Adjust based on available users
        const splitUsers = ["chandana", "raghu"]; // Adjust as needed
        const group = "2_test";

    cy.visit("/login");

    cy.intercept("POST", "/login").as("loginUser");

    // Login
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type(password);
    cy.get("button[type='submit']").click();

    cy.wait("@loginUser").then(({ response }) => {
      const token = response.body.token;
      const userId = response.body.id;

      cy.window().then((win) => {
        win.localStorage.setItem("authToken", token);
        win.localStorage.setItem("authTokens", JSON.stringify(token));
        win.localStorage.setItem("userid", userId);
      });
    });

    // Visit dashboard and open modal
    cy.visit("/dashboard");
    cy.contains("button", "Add Expense").click();
    cy.get("[role='dialog']").should("be.visible");

    cy.get("label").contains("Select Group").parent().click();
    cy.get("ul[role='listbox']").contains(group).click();
    
    cy.get("label").contains("Title").parent().find("input").clear().type(expenseTitle);
    cy.get("label").contains("Amount").parent().find("input").clear().type(expenseAmount);

    // Select payer
    cy.get("label").contains("Who Paid?").parent().click();
    cy.get("ul[role='listbox']").contains(payer).click();

    // Select users for splitting
    cy.get("label").contains("Split With").parent().click();
    splitUsers.forEach(user => {
        cy.get("ul[role='listbox']").contains(user).click();
    });
    cy.get("body").click(); // Close dropdown
    

    // Intercept expense POST
    cy.get("button").contains("Add expense").should("be.visible").click();

    // Modal closes
    cy.get("[role='dialog']").should("not.exist");
  });
});
