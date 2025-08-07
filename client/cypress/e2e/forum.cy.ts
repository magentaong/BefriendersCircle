import 'cypress-file-upload';

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

  it('visit the post dashboard of fatigue topic that has post', () => {
     // Submit form
    cy.get('button').contains(/^Fatigue$/).click();
    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/Fatigue");
  })

  it('visit the post dashboard of family topic that does not have any post', () => {
     // Submit form
    cy.get('button').contains(/^Family$/).click();
    // Expect redirection to homepage OR onboarding after signup
    cy.url().should("include", "/Family");
  })

  //2 test case for search function

  it('search for certain topic', () => {
     // Fill in Search Bar
    cy.get('input[placeholder="Search Topics..."]').type("Family");
  })

  it('search for certain topic but cannot and return', () => {
     // Fill in Search Bar
    cy.get('input[placeholder="Search Topics..."]').type("Test");
    cy.get('input[placeholder="Search Topics..."]').clear();
  })

  // 4 test case for add new category function

  it('want to add new topic but decide to close it', () => {
     // Fill in Add Forum
    cy.get('button img[alt="add"]').eq(0).click();
    cy.get('input[placeholder="Name"]').type("Test");
    cy.get('button img[alt="Close"]').click();
  })

   it('unsuccessful add new topic as only added topic Name', () => {
     // Fill in Add Forum
    cy.get('button img[alt="add"]').eq(0).click();
    cy.get('input[placeholder="Name"]').type("Test");
    cy.get('button').contains(/^Post$/).click();
    
    cy.get('input[type="file"][required]').then(($input) => {
      const el = $input[0];                    // raw DOM element
      expect(el.validity.valueMissing).to.be.true;  // check if "valueMissing" is true
    });
  })

  it('unsuccessful add new topic as only added only topic Image', () => {
     // Fill in Add Forum
    cy.get('button img[alt="add"]').eq(0).click();
    cy.get('[data-testid="image-input"]').attachFile('Family.png');
    cy.get('img[alt="previewUrl"]').should('be.visible');       // wait for the component  
    cy.get('button').contains(/^Post$/).click()

    cy.get('input[required]').then(($input) => {
      const el = $input[0];                    // raw DOM element
      expect(el.validity.valueMissing).to.be.true;  // check if "valueMissing" is true
    });
  })

   /*it("add a new Event", () => {
      cy.get('button img[alt="add"]').eq(1).click();
      // Fill in add form
      cy.get('input[placeholder="Name"]').type("Test");
      cy.get('[data-testid="image-input"]').attachFile('Family.png');
      cy.get('img[alt="previewUrl"]').should('be.visible');       // wait for the component    
      cy.get('button').contains(/^Post$/).click();
    });*/
})