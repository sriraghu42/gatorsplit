/// <reference types="cypress" />

describe("Add Member to Group", () => {
    const email = "varun";
    const password = "varun";
  
    it("logs in, navigates to group, opens Add Member modal, selects users, and saves", () => {
      cy.visit("/login");
  
      // Intercept login request
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
  
      // Navigate to groups page (adjust if needed)
      cy.visit("/groups");
      cy.wait(300);
  
      // Click on a group (adjust the name to match your test group)
      cy.contains(".MuiCard-root", "Road Trip Buddies").click();
  
      // Open Add Member modal
      cy.contains("button", "Add Member").click();
  
      // Wait for modal and open autocomplete
      cy.get('input[role="combobox"]').should("be.visible").click();
  
      // Type to load options
      cy.get('input[role="combobox"]').type("a", { delay: 100 });
  
      // Wait for dropdown options and select first
      cy.get('ul[role="listbox"] li').should("have.length.gte", 1).first().click();
  
      // Click Save button
      cy.contains("button", /^save$/i).click();
  
      // Modal should close
    //   cy.get("[role='dialog']").should("not.exist");
  
    //   // Member list should now be updated (optional check)
    //   cy.get("ul").should("contain", "a"); // Adjust to match username
    });
  });
  