describe("Signup Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/login"); // Change if you're using a diff port, but should be 5173 if i'm not wrong

  });
// NOTE: When trying to run this test, run server in dev mode, so use NODE_ENV=development node index.js

  it("Login a new caregiver account successfully", () => {
    
    // Fill in login form
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com");
    cy.get('input[placeholder="Password"]').type("123");

    // Submit form
    cy.get('button').contains(/^Login$/).click();

    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/");

  });

  it("shows error when invalid email format", () => {
    
    cy.get('input[placeholder="Email"]').type("magentagmail.com"); 
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get('button').contains(/^Login$/).click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("shows error when invalid email (user haven't signed up)", () => {
    
    cy.get('input[placeholder="Email"]').type("magenta1@gmail.com"); 
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get('button').contains(/^Login$/).click();

    cy.contains("User not found").should("be.visible");
  });

  it("shows error when invalid email (user haven't signed up)", () => {
    
    cy.get('input[placeholder="Email"]').type("magenta1@gmail.com"); 
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get('button').contains(/^Login$/).click();

    cy.contains("User not found").should("be.visible");
  });

  it("shows error when incorrect password", () => {
    
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com"); 
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get('button').contains(/^Login$/).click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("shows error when both fields are empty", () => {
    

    cy.get('button').contains(/^Login$/).click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("shows error when password field is empty", () => {

    cy.get('input[placeholder="Email"]').type("magenta@gmail.com"); 
    cy.get('button').contains(/^Login$/).click();

    cy.get('input[placeholder="Password"]:invalid').should("exist");
  });

  it("shows error when password field is empty", () => {

    cy.get('input[placeholder="Password"]').type("magenta@gmail.com"); 
    cy.get('button').contains(/^Login$/).click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });
});
