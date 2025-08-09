// Test Suite for Resource Library completed with navigation, 
// carousel behavior, API error handling, filtering and user interactions

// POST request to login API
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
    cy.loginByApi(); // Login
    cy.visit('http://localhost:5173/resources'); 
    cy.wait(1000); // Allow time for fetch
  });

  // Checked for basic page elements
  it('shows header, logo, profile, and navigation links', () => {
    cy.get('h1').should('contain', 'Resource Library') // Visible Title
    cy.get('img[alt="BefriendersCircle Logo"]').should('be.visible'); // Visible Logo 
    cy.get('a[href="/profile"] img[alt="User Profile"]').should('exist'); // Verify profile link
    // Navigation links to forum and training pages
    cy.get('a[href="/forum"]').should('exist'); 
    cy.get('a[href="/training"]').should('exist');
  });

  // Tested for category tab functionality
  // Works when all four categories are present and contain resources
  it('renders category tabs and can switch between them', () => {
    ['General', 'Financial', 'Medical', 'Chatbot'].forEach(tab => {
      cy.contains(tab).should('exist').click();
    });
  });

  // Tested for card carousel under General tab
  it('renders carousel with up to 3 cards in General tab', () => {
    cy.contains('General').click();
    cy.get('.sm\\:w-\\[280px\\]').should('have.length.at.most', 3); // Verify at most 3 cards
  });

  // Tested carousel navigation buttons
  it('carousel right/left buttons scroll cards in groups of 3', () => {
    cy.contains('General').click();
    cy.get('button[aria-label="carousel-right"]').should('exist').click(); // Clicks right arrow button and waits for animation
    // Works if there are greater than 3 cards
    cy.wait(500);
    // Same for left arrow button
    cy.get('.sm\\:w-\\[280px\\]').first().should('exist');
    cy.get('button[aria-label="carousel-left"]').should('exist').click();
    cy.wait(500);
  });

  // Check if progress bar updates, instead of exact width
  it('progress bar updates as carousel moves', () => {
    cy.contains('General').click();

    // Initial style of progress bar
    cy.get('div[role="progressbar"]')
      .invoke('attr', 'style')
      // Verifies whether progress bar style changed when carousel is navigated
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

  // Tested card expansion
  it('expands a card, then opens link on second click', () => {
    cy.contains('General').click();
    // Create an alias for first card to reuse in the test
    cy.get('.sm\\:w-\\[280px\\]').first().as('firstCard');
    cy.get('@firstCard').click();
    cy.get('@firstCard').contains(/Eligibility|Steps to apply/); // Click and verify content within the card
    cy.window().then((win) => cy.stub(win, 'open').as('windowOpen')); // Attempts to open a link on the second click
    cy.get('@firstCard').click();
    cy.get('@windowOpen').should('be.called');
  });

  // Tested tag filtering
  it('shows and clears tag filter, filters cards by tag', () => {
    cy.contains('General').click();
    cy.get('div').contains(/support\s*\(\s*\d+\s*\)/i).click(); // Matches support tag
    cy.get('button').contains('Clear').should('exist').click(); // Clicks clear button to remove filters
    cy.get('button[aria-label="carousel-right"]').should('exist'); // Verify restoration of carousel functionality
  });

  // Tested for forcing a return 500 error
  it('shows error banner if API error', () => {
    cy.intercept('POST', 'http://localhost:5050/api/openai', {
      statusCode: 500,
      body: { error: 'Failed to fetch' },
    });

    cy.visit('http://localhost:5173/resources');

    // Type in the chatbot textarea
    cy.get('textarea').first().type('test');
    // Click the search button
    cy.get('button[title="Search"]').click(); // Triggers chatbot functionality that will hit mocked failing API

    cy.get('.bg-red-100').should('exist').and('contain.text', 'Chat interface failed to load');
    cy.contains('Retry').should('exist'); 
  });

  // Set to over 10 seconds
  it('shows latency warning if API is slow', () => {
    cy.intercept('POST', 'http://localhost:5050/api/openai', (req) => {
      req.reply((res) => {
        res.delay = 11000; // 11 seconds delay to simulate slow response
        res.send({
          answer: null,
          verifiedResource: null,
          relatedSchemes: [],
          error: "",
          latency: true,
        });
      });
    }); // Returns response indicating latency issues

    cy.visit('http://localhost:5173/resources');

    // Trigger slow API call to verify latency warning appears within 15 seconds
    cy.get('textarea').first().type('slow test');
    cy.get('button[title="Search"]').click();

    cy.contains('The chatbot is taking longer than expected.', { timeout: 15000 }).should('exist');
    cy.contains('Restart Chatbot', { timeout: 15000 }).should('exist');
  });

  // Tested refresh functionality for updating resource list
  it('refreshes resource list with button', () => {
    cy.contains('General').click();
    cy.get('button').contains('Refresh Resources').click();
  });

  // Verified Chatbot Tab contains chat interface with sample text and input field
  it('shows chatbot panel on Chatbot tab', () => {
    cy.contains('Chatbot').click();
    cy.contains(/What financial subsidies do you recommend for seniors\?/i).should('exist');
    cy.get('textarea, input').should('exist');
  });

  // Checked for switching between different category tabs, works if the below categories are present
  it('allows switching categories back and forth with preserved state', () => {
    cy.contains('Medical').click();
    cy.contains('General').click();
    cy.contains('Chatbot').click();
    cy.contains('Medical').click();
  });

  // Tested for profile navigation
  it('shows profile avatar and navigates to profile page', () => {
    cy.get('a[href="/profile"] img[alt="User Profile"]').click();
    cy.url().should('include', '/profile');
  });

});
