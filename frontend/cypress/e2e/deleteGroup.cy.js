/// <reference types="cypress" />

describe("Delete Group", () => {
    it("logs in, deletes a group after confirmation, and verifies deletion", () => {
        const email = "chandana";
        const password = "chandana";
        const groupName = "Spring break Trip"; // Must exist before test

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

        cy.url().should("include", "/dashboard");

        // Intercept DELETE request
        cy.intercept("DELETE", "/api/groups/*").as("deleteGroup");

        // Locate group and click delete (update selector as per your UI)
        cy.contains("li", groupName)
        .should("exist")
        .within(() => {
          cy.get("button[aria-label='Delete Group']").click(); // if you add aria-label for better targeting
        });
        cy.wait(600)
      cy.get(".swal2-confirm").click(); // SweetAlert confirm
      

        // Wait for delete request
        cy.wait("@deleteGroup").then(({ response }) => {
            expect(response.statusCode).to.eq(200);
        });

        // Verify group no longer in the list
        cy.get(".group-list").should("not.contain.text", groupName);
    });
});
