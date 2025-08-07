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
      cy.visit('http://localhost:5173/forum/Fatigue');
    });

  it('visit the post dashboard of fatigue topic that has post', () => {
     // Submit form
    cy.contains('button', 'tired').click();
    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/Fatigue/post_Zudq9Chc");
  })

  //2 test case for search function
  // To be fix
  /*it('search for certain topic', () => {
     // Fill in Search Bar
    cy.get('input[placeholder="Search Post..."]').type("tips");
  })*/


  it('search for certain topic but cannot and return', () => {
     // Fill in Search Bar
    cy.get('input[placeholder="Search Post..."]').type("Test");
    cy.get('input[placeholder="Search Post..."]').clear();
  })

  // Test Case for Add function
  it('want to add new topic but decide to close it', () => {
     // Fill in Add Forum
    cy.get('button img[alt="add"]').eq(0).click();
    cy.get('textarea[placeholder="..."]').type("Test");
    cy.get('button img[alt="Close"]').click();
  })

  /*it("add a new Post", () => {
      cy.get('button img[alt="add"]').eq(0).click();
      cy.get('textarea[placeholder="..."]').type("Testing");
      cy.get('button').contains(/^Create$/).click();
    });*/
  
})