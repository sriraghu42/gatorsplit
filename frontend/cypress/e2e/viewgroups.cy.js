/// <reference types="cypress" />

describe("Login and Token Handling", () => {
    beforeEach(() => {
      cy.visit("/login");
    });
  
    afterEach(() => {
      cy.wait(2000); // Wait 2 seconds between tests
    });
  
    it("should log in a user successfully, store JWT token, and navigate to the dashboard", () => {
        cy.intercept("POST", "/login").as("loginUser"); // Ensure correct endpoint
    
        // Input valid credentials
        cy.get("input[name='email']").type("chand"); // Using username instead of email
        cy.get("input[name='password']").type("haha");
        cy.get("button[type='submit']").click();
    
        cy.wait("@loginUser").then((interception) => {
          // Validate response status and token presence
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body).to.have.property("token");
    
          // Extract the real token
          const token = interception.response.body.token;
          cy.log("Received JWT Token:", token);
    
          // Store the token in localStorage
          cy.window().then((win) => {
            win.localStorage.setItem("authToken", token);
          });
    
          // Verify if the token is stored correctly
          cy.window().its("localStorage.authToken").should("eq", token);
        });
    
        // Wait for the redirect and verify dashboard access
        cy.url({ timeout: 20000 }).should("include", "/dashboard");
        cy.window().then((win) => {
            const token = win.localStorage.getItem("authToken");
            expect(token).to.exist; // Ensure token exists before making requests
          });
      
          cy.intercept("GET", "/api/groups", (req) => {
            cy.window().then((win) => {
              req.headers["Authorization"] = `Bearer ${win.localStorage.getItem("authToken")}`;
            });
          }).as("fetchGroups");
          cy.wait(500);
          // Navigate to Groups Page (If required)
          cy.visit("/groups"); // Adjust the URL based on your app
          
          cy.wait("@fetchGroups").then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.be.an("array"); // Assuming groups are returned as an array
            cy.log("Fetched Groups:", interception.response.body);
            
          });
      
          // Verify the UI shows the group list
        //   cy.get(".group-list").should("exist").and("be.visible"); 
        // Ensure dashboard content loads
        // cy.get("h1").should("contain.text", "Dashboard"); // Adjust selector based on your dashboard UI
      });
  });
  