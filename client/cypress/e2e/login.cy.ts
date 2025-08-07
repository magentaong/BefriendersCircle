describe("Signup Flow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/login"); // Change if you're using a diff port, but should be 5173 if i'm not wrong
  });
  // NOTE: When trying to run this test, run server in dev mode, so use NODE_ENV=development node index.js
  afterEach(() => {
    cy.request("DELETE", "http://localhost:5050/api/test", {
      email: "wenxuan@gmail.com",
    });
  });

  it("Login a new caregiver account successfully", () => {
    // Fill in login form
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com");
    cy.get('input[placeholder="Password"]').type("123");

    // Submit form
    cy.get("button")
      .contains(/^Log In$/)
      .click();

    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/");
  });

  it("Shows error when invalid email format", () => {
    cy.get('input[placeholder="Email"]').type("magentagmail.com");
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("Shows error when invalid email (user haven't signed up)", () => {
    cy.get('input[placeholder="Email"]').type("magenta1@gmail.com");
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Shows error when invalid email (user haven't signed up)", () => {
    cy.get('input[placeholder="Email"]').type("magenta1@gmail.com");
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Shows error when incorrect password", () => {
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com");
    cy.get('input[placeholder="Password"]').type("password123");

    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("Shows error when both fields are empty", () => {
    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("Shows error when password field is empty", () => {
    cy.get('input[placeholder="Email"]').type("magenta@gmail.com");
    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.get('input[placeholder="Password"]:invalid').should("exist");
  });

  it("Shows error when password field is empty", () => {
    cy.get('input[placeholder="Password"]').type("magenta@gmail.com");
    cy.get("button")
      .contains(/^Log In$/)
      .click();

    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("Toggles to Register page when 'New here? Sign up", () => {
    cy.contains("New here? Sign up").click();

    cy.get('input[placeholder="Confirm Password"]:invalid').should("exist");
  });

  it("Shows error when registering (name empty)", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Email"]').type("wenxuan@gmail.com");
    cy.get('input[placeholder="Password"]').type("peepeepoopoo");
    cy.get('input[placeholder="Confirm Password"]').type("peepeepoopoo");
    cy.get("button")
      .contains(/^Register$/)
      .click();
    cy.get('input[placeholder="Username"]:invalid').should("exist");
  });

  it("Shows error when registering (email) empty)", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Username"]').type("wenxuan");
    cy.get('input[placeholder="Email"]').type(" ");
    cy.get('input[placeholder="Password"]').type("peepeepoopoo");
    cy.get('input[placeholder="Confirm Password"]').type("peepeepoopoo");
    cy.get("button")
      .contains(/^Register$/)
      .click();
    cy.get('input[placeholder="Email"]:invalid').should("exist");
  });

  it("Shows error when registering (Password empty)", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Username"]').type("wenxuan");
    cy.get('input[placeholder="Email"]').type("wenxuan@gmail.com");

    cy.get("button")
      .contains(/^Register$/)
      .click();
    cy.get('input[placeholder="Password"]:invalid').should("exist");
  });

  it("Shows error when registering (Password & Confirm Password)", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Username"]').type("wenxuan");
    cy.get('input[placeholder="Email"]').type("wenxuan@gmail.com");
    cy.get('input[placeholder="Password"]').type("pee");
    cy.get('input[placeholder="Confirm Password"]').type("poo");
    cy.get("button")
      .contains(/^Register$/)
      .click();
    cy.contains("Passwords do not match!").should("be.visible");
  });

  it("Registers a new user", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Username"]').type("wenxuan");
    cy.get('input[placeholder="Email"]').type("wenxuan@gmail.com");
    cy.get('input[placeholder="Password"]').type("peepeepoopoo");
    cy.get('input[placeholder="Confirm Password"]').type("peepeepoopoo");
    cy.get("button")
      .contains(/^Register$/)
      .click();
  });

  it("Registers a new user & onboards", () => {
    cy.contains("New here? Sign up").click();
    cy.get('input[placeholder="Username"]').type("wenxuan");
    cy.get('input[placeholder="Email"]').type("testuser@example.com");
    cy.get('input[placeholder="Password"]').type("peepeepoopoo");
    cy.get('input[placeholder="Confirm Password"]').type("peepeepoopoo");
    cy.get("button")
      .contains(/^Register$/)
      .click();
    cy.url().should("include", "/onboarding");

    cy.get("button").first().click();
    cy.get("button")
      .contains(/^Continue$/)
      .click();
  });
});
