/// <reference types="cypress" />

describe("Register Page", () => {
    beforeEach(() => {
      cy.visit("/register"); // Adjust URL based on your routing
    });
  
    it("should load the registration page", () => {
      cy.contains("Create an Account").should("be.visible");
    });
  
    it("should register a new user successfully", () => {
      cy.intercept("POST", "http://localhost:8080/register", {
        statusCode: 200,
        body: { message: "Account created successfully!" },
      }).as("registerUser");
  
      cy.get("input[name='username']").type("testuser");
      cy.get("input[name='email']").type("testuser@example.com");
      cy.get("input[name='password']").type("Test@1234");
  
      cy.get("button[type='submit']").click();
  
      cy.wait("@registerUser");
      cy.contains("Account created successfully! You can now log in.").should("be.visible");
    });
  
    
  
   
  });
  
