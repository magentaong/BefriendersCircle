Cypress.Commands.add('loginByApi', () => {
  cy.request('POST', 'http://localhost:5050/api/auth/login', {
    email: 'magenta@gmail.com',
    password: '123'
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token); // or whatever your app uses
  });
});

describe('Forum Page', () => {
  beforeEach(() => {
      cy.loginByApi();
      cy.visit('http://localhost:5173/forum');
    });

  it('visit the post dashboard for fatigue topic', () => {
     // Submit form
    cy.get('button').contains(/^Fatigue$/).click();

    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/Fatigue");
  })

  it('search for certain topic', () => {
     // Fill in Search Bar
    cy.get('input[placeholder="Search Topics..."]').type("hi");
  })
})