Cypress.Commands.add('loginByApi', () => {
  cy.request('POST', 'http://localhost:5050/api/auth/login', {
    email: 'magenta@gmail.com',
    password: '123'
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

describe("Fuzzy testing for add post word count", () => {
  beforeEach(() => {
    cy.loginByApi();
    cy.visit('http://localhost:5173/forum/bleh');
    cy.document().then(doc => {
      console.log(doc.documentElement.innerHTML);
    });

    cy.wait(1000); // Allow time for fetch
  });

  const fuzzCases = [
    { desc: "Empty input", value: " ", expectError: true }, 
    { desc: "Only spaces", value: "       ", expectError: true }, 
    { desc: "Valid short post", value: "I feel SUPER burntout today.", expectError: false },
    { desc: "Number of characters (279)", value: "A".repeat(279).trim(), expectError: false },
    { desc: "Number of characters (280)", value: "B".repeat(280).trim(), expectError: false },
    { desc: "Number of characters (1000)", value: "C".repeat(1000).trim(), expectError: true }, 
    { desc: "Emojis", value: "🫩🙂🙂🙂🙂😇😇😇🤣🥲☺️", expectError: false},
    { desc: "ASCII", value: "Feeling like shit, but okay!!!!!!!!!$*^#!($&#$()%^*", expectError: false} ,
    { desc: "fook off", value: "┌∩┐(◣_◢)┌∩┐", expectError: false},
    { desc: "html injection", value: "<h1> you've been hacked heheeh <h1>", expectError: false},
     { desc: "XSS", value: "<script>alert(123)</script>", expectError: false},
  ];

  fuzzCases.forEach(({ desc, value, expectError }) => {
    it(`Handles post: ${desc}`, () => {
      cy.get('.lucide-plus').closest('button').click();
      cy.get('[data-cy="post-textarea"]').clear().type(value, { delay: 0 })

      if (expectError) {
        cy.get('button').should('be.disabled');
      } else {
        cy.get('[data-cy="submit-post"]').click();
        cy.get('[data-cy="error"]').should("not.exist");
        cy.contains(value).should("exist"); 
      }
    });
  });
});
