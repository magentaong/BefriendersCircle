
# Befrienders Circle

**Element of Software Construction** project by Team C3T3.

A feedback driven web-based platform designed to support caregivers through training modules, access to caregiving resources, a voice-enabled AI chatbot for scheme queries, and a caregiver community forum.

___________________________________________
## Table of Contents

1. [Project Overview](#project-overview)
2. [Team Members](#team-members)
3. [Features](#features)
4. [Architecture & Tech Stack](#architecture--tech-stack)
5. [Installation & Setup](#installation--setup)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [API Documentation](#api-documentation)
9. [Folder Structure](#folder-structure)
10. [License](#license)

___________________________________________

## Project Overview

**Befrienders Circle** is a comprehensive web-based platform designed to empower caregivers in navigating caregiving challenges through accessible tools and peer support.

### Core Mission
To provide caregivers with:
- **Training Modules**: Interactive simulations for skill development
- **Resource Library**: Comprehensive database of caregiving resources and schemes
- **AI-Powered Chatbot**: Voice and text-enabled assistance for scheme queries
- **Community Forum**: Peer support and knowledge sharing platform

___________________________________________

## Team Members

- Jiang, Wenmiao (1007943)
- Koh Niann Tsyr (1008136)
- Xu Lai (1007308)
- Faustina Anne Francisco (1008209)
- Ong Shi Hui, Magenta (1007931)
- Tan Jing Yee (1008190)
- Rachel Tan Hua En (1007891)
- Bersamin Paigie Rae Carmona (1008244)

___________________________________________

## Features

### User Authentication
- Secure signup and login system
- JWT-based session management
- Password hashing with bcrypt
- User profile management

### Resource Library
- Comprehensive database of caregiving resources
- Categorized by: General, Medical, Finance, Chatbot
- Advanced filtering by tags and categories
- Detailed resource information with eligibility criteria and application steps

### AI Chatbot Interface
- **Voice-enabled queries**: Speech-to-text functionality
- **Text-based queries**: Direct text input support
- **OpenAI GPT Integration**: Powered by LangChain for intelligent responses
- **Scheme Recommendations**: Financial and healthcare subsidy information
- **Real-time Response**: Low-latency AI-powered assistance

### Community Forum
- **Topic Boards**: Organized discussion categories
- **Post Management**: Create, read, update, delete posts
- **Comment System**: Threaded discussions
- **Like/Unlike**: Social interaction features
- **Content Moderation**: Report inappropriate content
- **User Profiles**: Community member management

### Training Modules
- **Interactive Simulations**: Decision-based learning scenarios
- **Progress Tracking**: User completion and scoring
- **Home Safety Training**: Comprehensive safety modules
- **Category-based Learning**: Home-care, Medicine, Hygiene, Physical, Self-Care, Finance

### Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Tailwind CSS**: Modern styling framework
- **Accessibility**: Inclusive design principles
- **Intuitive Navigation**: User-friendly interface

___________________________________________

## Architecture & Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 7.0.3 | Build Tool & Dev Server |
| Tailwind CSS | 4.1.11 | Styling |
| React Router | 7.6.3 | Client-side Routing |
| Axios | 1.10.0 | HTTP Client |
| Three.js | 0.178.0 | 3D Graphics (Training) |
| Swiper | 11.2.10 | Carousel Components |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime Environment |
| Express.js | 4.21.2 | Web Framework |
| MongoDB | 6.17.0 | Database |
| Mongoose | 8.16.2 | ODM |
| JWT | 9.0.2 | Authentication |
| bcrypt | 6.0.0 | Password Hashing |
| OpenAI | 5.10.2 | AI Integration |
| LangChain | 0.3.30 | AI Framework |
| Multer | 2.0.2 | File Upload |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | Backend Unit & Integration Tests |
| Vitest | Frontend Component Tests |
| React Testing Library | UI Testing |
| Cypress | End-to-End Testing |
| Supertest | API Testing |

___________________________________________

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- OpenAI API key

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `server/` directory with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5050
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ASSISTANT_ID=your_openai_assistant_id
   ```

4. **Seed the database:**
   ```bash
   # Seed resources
   node Scripts/seedResources.js
   
   # Seed training data
   node Scripts/seedTraining.js
   
   # Embed resources for AI search
   node Scripts/embedResources.js
   ```

5. **Start the development server:**
   ```bash
   node index.js
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Default Ports
- **Backend**: `http://localhost:5050/`
- **Frontend**: `http://localhost:5173/`

___________________________________________

## Running the Application

### Quick Start
1. Ensure both backend and frontend servers are running
2. Open `http://localhost:5173/` in your browser
3. Create an account
4. Use newly created account to explore the platform

### Navigation Guide
- **Home**: Voice search and main navigation
- **Resources**: Browse caregiving resources and AI chatbot
- **Forum**: Community discussions and peer support
- **Training**: Interactive simulation modules
- **Profile**: User account management

___________________________________________

## Testing

### Backend Testing

**Unit Tests:**
```bash
cd server
npm test
```

**Unit Test Coverage:**
- Authentication (auth.test.js)
- Resource Management (resource.test.js)
- Forum Operations (board.test.js, post.test.js, comment.test.js, like.test.js)
- AI Integration (openAI.test.js, langchainChat.test.js)
- Training Modules (training.test.js)
- Audio Processing (audio.test.js)
- PLEASE UPDATE REMAINING UNIT TESTS

**Integration Tests:**
- API endpoint testing
- Database integration
- Authentication flow
- AI service integration
- PLEASE UPDATE REMAINING INTEGRATION TESTS


### Frontend Testing

**Component Tests:**
```bash
cd client
npm test
```

**Test Coverage:**
- Login/Registration (LoginPage.test.tsx)
- Resource Components (ResourceCard.test.tsx)
- Forum Components (PostPage.test.tsx)
- Chatbot Interface (ChatbotPanel.test.tsx)
- Category Management (CategoryComponents.test.tsx)

**End-to-End Tests:**
```bash
cd client
npm run test:e2e
```

**E2E Test Coverage:**
- User authentication flow
- Resource browsing and filtering
- Forum interactions
- Training module completion

___________________________________________

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get specific resource
- `POST /api/resources` - Create new resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

### Forum Endpoints
- `GET /api/boards` - Get forum boards
- `POST /api/boards` - Create new board
- `GET /api/post` - Get posts
- `POST /api/post` - Create new post
- `GET /api/comment` - Get comments
- `POST /api/comment` - Create new comment
- `POST /api/like` - Like/unlike content

### AI Chatbot Endpoints
- `POST /api/langchainchat` - AI-powered chat responses
- `POST /api/openai` - OpenAI integration
- `POST /api/resourcechat` - Resource-specific queries

### Training Endpoints
- `GET /api/training` - Get training modules
- `POST /api/training/progress` - Update training progress
- `GET /api/training/:id` - Get specific training module

### Audio Endpoints
- `POST /api/audio/transcribe` - Speech-to-text conversion
- `POST /api/audio/synthesize` - Text-to-speech conversion

___________________________________________

## Folder Structure

```
BefriendersCircle/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Shared components
│   │   │   ├── Forum/               # Forum-specific components
│   │   │   ├── resources/           # Resource components
│   │   │   └── training/            # Training components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── api/                     # API integration
│   │   ├── routes/                  # Routing configuration
│   │   └── content/                 # Static content data
│   ├── public/                      # Static assets
│   ├── cypress/                     # E2E testing
│   └── __tests__/                   # Component tests
├── server/                          # Backend Node.js Application
│   ├── controllers/                 # Business logic
│   ├── models/                      # Database models
│   ├── routes/                      # API routes
│   ├── middleware/                  # Express middleware
│   ├── langchain/                   # AI integration
│   ├── Scripts/                     # Database seeding scripts
│   ├── uploads/                     # File uploads
│   ├── __tests__/                   # Backend tests
│   │   ├── unit/                    # Unit tests
│   │   └── integration/             # Integration tests
│   └── utils/                       # Utility functions
└── README.md                        # Project documentation
```

___________________________________________

## License

This project is developed as part of the Element of Software Construction course at the National University of Singapore.

Team C3T3 - All rights reserved.

___________________________________________

