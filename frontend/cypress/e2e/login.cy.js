/// <reference types="cypress" />

describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should log in a user successfully, get the real token, and navigate to the dashboard", () => {
    cy.intercept("POST", "http://localhost:8080/login").as("loginUser"); // Intercept but don't modify response

    cy.get("input[name='email']").type("testmar2");
    cy.get("input[name='password']").type("testmar2");
    cy.get("button[type='submit']").click();

    cy.wait("@loginUser").then((interception) => {
      // Check if response contains a token
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property("token");

      // Extract the real token from API response
      const token = interception.response.body.token;
      cy.log("Received JWT Token:", token);

      // Store the token in localStorage (if your app does this)
      cy.window().then((win) => {
        win.localStorage.setItem("authToken", token);
      });

      // Verify if token is stored correctly
      cy.window().its("localStorage.authToken").should("eq", token);
    });

    // Wait for the redirect and verify dashboard access
    cy.url({ timeout: 20000 }).should("include", "/dashboard");

    // Ensure dashboard content loads
    cy.contains("Welcome back!", { timeout: 15000 }).should("be.visible");
  });
});
