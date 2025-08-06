Cypress.Commands.add('loginByApi', () => {
  cy.request('POST', 'http://localhost:5050/api/auth/login', {
    email: 'faustina.af@gmail.com',
    password: 'please'
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

// NOTE: When trying to run this test, run server in dev mode, so use NODE_ENV=development node index.js
// ello windows users, use '$env:NODE_ENV="development"; node index.js' for powershell instead :)

describe('Home Safety Simulation', () => {
  beforeEach(() => {
    cy.loginByApi();
    cy.visit('/training/home-safety')
  })

  // Test 1: 
  it("this is a tmr problem", () => {
    
  })
})