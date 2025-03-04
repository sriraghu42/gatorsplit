// /// <reference types="cypress" />

// describe("Login Page", () => {
//   beforeEach(() => {
//     cy.visit("/login");
//   });

//   it("should log in a user successfully, get the real token, and navigate to the dashboard", () => {
//     cy.intercept("POST", "http://localhost:8080/login").as("loginUser"); // Intercept but don't modify response

//     cy.get("input[name='email']").type("chand");
//     cy.get("input[name='password']").type("haha");
//     cy.get("button[type='submit']").click();

//     cy.wait("@loginUser").then((interception) => {
//       // Check if response contains a token
//       expect(interception.response.statusCode).to.eq(200);
//       expect(interception.response.body).to.have.property("token");

//       // Extract the real token from API response
//       const token = interception.response.body.token;
//       cy.log("Received JWT Token:", token);

//       // Store the token in localStorage (if your app does this)
//       cy.window().then((win) => {
//         win.localStorage.setItem("authToken", token);
//       });

//       // Verify if token is stored correctly
//       cy.window().its("localStorage.authToken").should("eq", token);
//     });

//     // Wait for the redirect and verify dashboard access
//     cy.url({ timeout: 20000 }).should("include", "/dashboard");

//     // Ensure dashboard content loads
   
//   });
// });


/// <reference types="cypress" />

describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("/login");
  });
  afterEach(() => {
    cy.wait(3000); // Wait for 2 seconds between tests
  });

  it("should show a SweetAlert error message for invalid credentials", () => {
    cy.intercept("POST", "http://localhost:8080/login", {
      statusCode: 401,
      body: { message: "Invalid credentials" },
    }).as("failedLogin");
  
    cy.get("input[name='email']").type("wronguser");
    cy.get("input[name='password']").type("wrongpassword");
    cy.get("button[type='submit']").click();
  
    cy.wait("@failedLogin");
  
    // Wait for SweetAlert to appear
    cy.get(".swal2-popup", { timeout: 10000 }) // Adjust timeout if needed
      .should("be.visible")
      .and("contain.text", "Invalid credentials"); // Ensure the message appears
  });
  
  it("should log in a user successfully, store JWT token, and navigate to the dashboard", () => {
    cy.intercept("POST", "/login").as("loginUser"); // Ensure correct endpoint

    // Input valid credentials
    cy.get("input[name='email']").type("chand"); // Using username instead of email
    cy.get("input[name='password']").type("haha");
    cy.wait(600)
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

    // Ensure dashboard content loads
    // cy.get("h1").should("contain.text", "Dashboard"); // Adjust selector based on your dashboard UI
  });

 

});
