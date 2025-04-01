/// <reference types="cypress" />

describe("Create Group from /groups", () => {
    it("logs in, navigates to /groups, creates a group, and confirms it appears", () => {
      const email = "varun";
      const password = "varun";
      const newGroupName = "Road Trip Buddies";
  
      // Visit login page
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
      cy.wait(300)
      // Navigate to /groups
      cy.visit("/groups");
      cy.wait(300)
      // Intercept group creation API
      cy.intercept("POST", "/api/groups").as("createGroup");
  
      // Click "Create Group" button
      cy.contains("button", "Create Group").click(); // Adjust if label differs
  
      // Fill out the group name
      cy.get("input[label='Group Name'], input").first().type(newGroupName);

    // Open the dropdown
cy.get('input[role="combobox"]').click();

// Select first user via keyboard
cy.get('input[role="combobox"]').type('{downarrow}{enter}');

// Reopen and select second user
cy.get('input[role="combobox"]').click().type('{downarrow}{downarrow}{enter}');

// Submit
cy.contains("button", /^create$/i).should("be.visible").click();


// Confirm group creation API
cy.wait("@createGroup").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get("[role='presentation']").should("not.exist");

// Confirm group card appears
cy.contains(".MuiCard-root", newGroupName).should("exist");
    });
  });
  