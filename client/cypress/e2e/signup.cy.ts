describe("Signup Flow", () => {
  beforeEach(() => {
    cy.request("DELETE", "http://localhost:5050/api/test/cleanup"); // Delete testuser accounts every time
    cy.visit("http://localhost:5173/login"); // Change if you're using a diff port, but should be 5173 if i'm not wrong

  });
// NOTE: When trying to run this test, run server in dev mode, so use NODE_ENV=development node index.js

  it("registers a new caregiver account successfully", () => {
    // Toggle to sign up
    cy.contains("Register").click();

    // Fill in signup form
    cy.get('input[placeholder="Username"]').type("user");
    cy.get('input[placeholder="Email"]').type("testuser@example.com");
    cy.get('input[placeholder="Password"]').type("testpassword123");

    // Submit form
    cy.get('button').contains(/^Register$/).click();

    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/");

  });

  it("shows error when using existing email", () => {
    cy.contains("Register").click();

    cy.get('input[placeholder="Username"]').type("magenta");
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com"); 
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get('button').contains(/^Register$/).click();

    cy.contains("Email already in use").should("be.visible");
  });

  it("shows error when fields are empty", () => {
    cy.contains("Register").click();
    cy.get('button').contains(/^Register$/).click();


    // HTML5 required fields will block submission; alternatively:
    cy.get('input[placeholder="Username"]:invalid').should("exist");
    cy.get('input[placeholder="Email"]:invalid').should("exist");
    cy.get('input[placeholder="Password"]:invalid').should("exist");
  });
});
