Cypress.Commands.add('loginByApi', () => { // bruh i give up why does this part not work
  cy.request('POST', 'http://localhost:5050/api/auth/login', {
    email: 'magenta@gmail.com',   
    password: '123'
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
  });
});

describe('Resource Library Page', () => {
  beforeEach(() => {
    // cy.loginByApi();
    cy.visit('http://localhost:5173/resources');
    cy.wait(1000); // Allow time for fetch
  });

  it('shows header, logo, profile, and navigation links', () => {
    cy.get('header').contains('Resource Library');
    cy.get('img[alt="BefriendersCircle Logo"]').should('be.visible');
    cy.get('a[href="/profile"] img[alt="User Profile"]').should('exist');
    cy.get('a[href="/forum"]').should('exist');
    cy.get('a[href="/training"]').should('exist');
  });

  it('renders category tabs and can switch between them', () => {
    ['General', 'Financial', 'Medical', 'Chatbot'].forEach(tab => {
      cy.contains(tab).should('exist').click();
    });
  });

  it('renders carousel with up to 3 cards in General tab', () => {
    cy.contains('General').click();
    cy.get('.sm\\:w-\\[280px\\]').should('have.length.at.most', 3);
  });

  it('carousel right/left buttons scroll cards in groups of 3', () => {
    cy.contains('General').click();
    cy.get('button[aria-label="carousel-right"]').should('exist').click();
    cy.wait(500);
    cy.get('.sm\\:w-\\[280px\\]').first().should('exist');
    cy.get('button[aria-label="carousel-left"]').should('exist').click();
    cy.wait(500);
  });

  it('progress bar updates as carousel moves', () => {
    cy.contains('General').click();
    cy.get('div[role="progressbar"]').invoke('attr', 'style').should('contain', 'width: 33');
    cy.get('button[aria-label="carousel-right"]').click();
    cy.wait(400);
    cy.get('div[role="progressbar"]').invoke('attr', 'style').should('contain', 'width: 66');
    cy.get('button[aria-label="carousel-right"]').click();
    cy.wait(400);
    cy.get('div[role="progressbar"]').invoke('attr', 'style').should('contain', 'width: 100');
  });

  it('expands a card, then opens link on second click', () => {
    cy.contains('General').click();
    cy.get('.sm\\:w-\\[280px\\]').first().as('firstCard');
    cy.get('@firstCard').click();
    cy.get('@firstCard').contains(/Eligibility|Steps to apply/);
    cy.window().then((win) => cy.stub(win, 'open').as('windowOpen'));
    cy.get('@firstCard').click();
    cy.get('@windowOpen').should('be.called');
  });

  it('shows and clears tag filter, filters cards by tag', () => {
    cy.contains('General').click();
    cy.get('div').contains(/support\s*\(\s*\d+\s*\)/i).click();
    cy.get('button').contains('Clear').should('exist').click();
    cy.get('button[aria-label="carousel-right"]').should('exist');
  });

  it('shows empty state when no resources in a tab', () => {
    cy.contains('Financial').click();
    cy.contains(/No resources found/i).should('exist');
    cy.get('button').contains(/Refresh Resources/i).should('exist');
  });

  it('shows error banner if API error', () => {
    // Stub network for error
    cy.intercept('GET', '/api/resources*', { statusCode: 500, body: { error: 'Failed to fetch' } });
    cy.visit('http://localhost:5173/resources');
    cy.contains('Retry').should('exist');
    cy.get('.bg-red-100').contains('Failed to fetch').should('exist');
  });

  it('shows latency warning if API is slow', () => {
    // This assumes you set the latency flag based on slow fetch
    cy.window().then(win => {
      win.localStorage.setItem('simulateLatency', '1'); // Or however you simulate
    });
    cy.visit('http://localhost:5173/resources');
    cy.contains('The chatbot is taking longer than expected.').should('exist');
    cy.contains('Restart Chatbot').should('exist');
  });

  it('refreshes resource list with button', () => {
    cy.contains('General').click();
    cy.get('button').contains('Refresh Resources').click();
    // You could intercept and wait for API to be called
    // cy.wait('@resourceFetch');
  });

  it('shows chatbot panel on Chatbot tab', () => {
    cy.contains('Chatbot').click();
    cy.contains(/What financial subsidies do you recommend for seniors\?/i).should('exist');
    cy.get('textarea, input').should('exist');
  });

  it('allows switching categories back and forth with preserved state', () => {
    cy.contains('Medical').click();
    cy.contains('General').click();
    cy.contains('Chatbot').click();
    cy.contains('Medical').click();
  });

  it('shows profile avatar and navigates to profile page', () => {
    cy.get('a[href="/profile"] img[alt="User Profile"]').click();
    cy.url().should('include', '/profile');
  });

});
