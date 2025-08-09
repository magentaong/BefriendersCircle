Cypress.Commands.add('loginByApi', () => {
  cy.request('POST', 'http://localhost:5050/api/auth/login', {
    email: 'magenta@gmail.com',   
    password: '123'
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
  });
});

describe('Resource Library Page', () => {
  beforeEach(() => {
    cy.loginByApi();
    cy.visit('http://localhost:5173/resources');
    cy.wait(1000); // Allow time for fetch
  });

  it('shows header, logo, profile, and navigation links', () => {
    cy.get('h1').should('contain', 'Resource Library')
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

  // Check if progress bar updates, instead of exact width
  it('progress bar updates as carousel moves', () => {
    cy.contains('General').click();

    cy.get('div[role="progressbar"]')
      .invoke('attr', 'style')
      .then((initialStyle) => {
        cy.get('button[aria-label="carousel-right"]').click();
        cy.wait(400);

        cy.get('div[role="progressbar"]')
          .invoke('attr', 'style')
          .should((newStyle) => {
            expect(newStyle).to.not.eq(initialStyle);
          });
      });
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

  it('shows error banner if API error', () => {
    cy.intercept('POST', 'http://localhost:5050/api/openai', {
      statusCode: 500,
      body: { error: 'Failed to fetch' },
    });

    cy.visit('http://localhost:5173/resources');

    // Type in the chatbot textarea
    cy.get('textarea').first().type('test');
    // Click the search button
    cy.get('button[title="Search"]').click();

    cy.get('.bg-red-100').should('exist').and('contain.text', 'Chat interface failed to load');
    cy.contains('Retry').should('exist');
  });

  // Set to over 10 seconds
  it('shows latency warning if API is slow', () => {
    cy.intercept('POST', 'http://localhost:5050/api/openai', (req) => {
      req.reply((res) => {
        res.delay = 11000; // 11 seconds
        res.send({
          answer: null,
          verifiedResource: null,
          relatedSchemes: [],
          error: "",
          latency: true,
        });
      });
    });

    cy.visit('http://localhost:5173/resources');

    cy.get('textarea').first().type('slow test');
    cy.get('button[title="Search"]').click();

    cy.contains('The chatbot is taking longer than expected.', { timeout: 15000 }).should('exist');
    cy.contains('Restart Chatbot', { timeout: 15000 }).should('exist');
  });

  it('refreshes resource list with button', () => {
    cy.contains('General').click();
    cy.get('button').contains('Refresh Resources').click();
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
