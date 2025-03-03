/// <reference types="cypress" />

describe("Authentication Management", () => {
    beforeEach(() => {
      cy.visit("/login");
    });
  
    afterEach(() => {
      cy.wait(2000); // Wait for 2 seconds between tests
    });
  
    // it("should prevent access to protected routes without authentication", () => {
    //   cy.visit("/dashboard");
    //   cy.url().should("include", "/login"); // Redirects unauthorized users
  
    //   cy.visit("/groups");
    //   cy.url().should("include", "/login");
    // });
  
    // it("should log in a user, persist session after refresh, and access protected routes", () => {
    //   cy.intercept("POST", "/login").as("loginUser");
  
    //   cy.get("input[name='email']").type("chand");
    //   cy.get("input[name='password']").type("haha");
    //   cy.get("button[type='submit']").click();
  
    //   cy.wait("@loginUser").then((interception) => {
    //     expect(interception.response.statusCode).to.eq(200);
    //     expect(interception.response.body).to.have.property("token");
  
    //     const token = interception.response.body.token;
    //     cy.window().then((win) => {
    //       win.localStorage.setItem("authToken", token);
    //     });
  
    //     cy.window().its("localStorage.authToken").should("eq", token);
    //   });
  
    //   cy.url().should("include", "/dashboard");
  
    //   // Refresh and check persistence
    //   cy.reload();
    //   cy.window().its("localStorage.authToken").should("exist");
    //   cy.url().should("include", "/dashboard");
    // });
  
   
    it("should log out a user and restrict access to protected routes", () => {
      cy.intercept("POST", "/login").as("loginUser");
  
      cy.get("input[name='email']").type("chand");
      cy.get("input[name='password']").type("haha");
      cy.get("button[type='submit']").click();
  
      cy.wait("@loginUser").then((interception) => {
        const token = interception.response.body.token;
        cy.window().then((win) => {
          win.localStorage.setItem("authToken", token);
        });
      });
  
      cy.url().should("include", "/dashboard");
  
      // Perform logout
      cy.get("button#logout").click(); // Adjust selector based on your UI
  
      // Ensure logout clears storage and redirects
      cy.window().its("localStorage.authToken").should("not.exist");
      cy.url().should("include", "/login");
  
      // Try accessing dashboard again
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });
  
    
  });
  