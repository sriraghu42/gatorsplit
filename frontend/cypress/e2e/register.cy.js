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
  
      cy.get("input[name='username']").type("chand");
      cy.get("input[name='email']").type("chadnana@gmail.com");
      cy.get("input[name='password']").type("haha");
      cy.wait(1500);
      cy.get("button[type='submit']").click();
  
      cy.wait("@registerUser");
      cy.contains("Account created successfully! You can now log in.").should("be.visible");
     
    });
  
    
  
   
  });
  
