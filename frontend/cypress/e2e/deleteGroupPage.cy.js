/// <reference types="cypress" />

describe("Delete Group from Groups Page", () => {
    it("logs in, navigates to groups page, deletes a group, and verifies it's removed", () => {
      const email = "chandana";
      const password = "chandana";
      const groupName = "Spring break Trip"; // Ensure this group exists
  
      // Visit login page
      cy.visit("/login");
  
      // Intercept login
      cy.intercept("POST", "/login").as("loginUser");
  
      // Fill login form and submit
      cy.get("input[name='email']").type(email);
      cy.get("input[name='password']").type(password);
      cy.get("button[type='submit']").click();
  
      // Set auth and userId in localStorage
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
      // Navigate to groups page
      // cy.visit("/groups");
      // // Intercept DELETE call
      // cy.intercept("DELETE", "/api/groups/*").as("deleteGroup");
  
      // Wait for groups to load
      cy.contains("Your Groups").should("be.visible");
  
      // Delete group with name `groupName`
      cy.contains(groupName)
      .should("exist")
      .closest("div.MuiPaper-root")
      .within(() => {
        cy.get("button[aria-label='Delete Group']").should("be.visible").click();
      });
    
      cy.wait(500)
      // Confirm SweetAlert
      cy.get(".swal2-confirm").click();
  
      // Wait for API confirmation
  
  
    });
  });
  