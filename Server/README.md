# Sustainability Platform Backend

A comprehensive Node.js backend API for a sustainability challenge platform built with Express.js and MongoDB.

## Features

- **User Management**: Registration, authentication, and profile management with JWT
- **ODD System**: Sustainable Development Goals (ODDs) with weighted selection
- **Challenge Management**: Create and manage sustainability challenges
- **Proof Submission**: Users can submit proof of completing challenges
- **Community Voting**: Vote on other users' proof submissions
- **Badge System**: Earn badges based on progress and achievements
- **Leaderboards**: Track user progress and rankings
- **Admin Panel**: Administrative controls for content management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting, bcrypt

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Configure your `.env` file with MongoDB connection string and other settings

5. Start MongoDB service (if running locally)

6. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The application will automatically connect to MongoDB using the connection string in your `.env` file. The Mongoose models will handle schema creation automatically.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/create-admin` - Create admin user (development)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get leaderboard
- `POST /api/users/spin-wheel` - Spin wheel for random challenge

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges` - Create challenge (admin)
- `GET /api/challenges/:id` - Get challenge by ID
- `PUT /api/challenges/:id` - Update challenge (admin)

### Proofs
- `GET /api/proofs` - Get all proofs
- `POST /api/proofs` - Submit proof
- `PUT /api/proofs/:id/status` - Update proof status (admin)
- `POST /api/proofs/:id/vote` - Vote for proof

### Badges
- `GET /api/badges` - Get all badges
- `POST /api/badges` - Create badge (admin)
- `GET /api/badges/user/:userId` - Get user badges

### ODDs
- `GET /api/odds` - Get all ODDs
- `POST /api/odds` - Create ODD (admin)
- `GET /api/odds/climate-focus` - Get climate-focused ODDs

## Authentication

The API uses JWT tokens for authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Data Models

### User
- Username, email, password (hashed)
- Avatar, country, level, total points
- Role-based access control

### ODD (Sustainable Development Goal)
- ODD ID (1-17), name, icon, color
- Weight for random selection
- Climate focus flag

### Challenge
- Title, description, type, difficulty
- Points value, associated ODD
- Completion tracking

### Proof
- User submission with media URL
- Status (pending/approved/rejected)
- Community voting system

### Badge
- Achievement badges linked to ODDs
- Point requirements for earning
- User badge tracking

### UserProgress
- Progress tracking per ODD
- Completed challenges and points
- Badge earning status

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- 100 requests per 15-minute window per IP
- Configurable via environment variables

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Code Style

The project follows standard Express.js patterns with:
- Model-View-Controller architecture
- Middleware for authentication and validation
- Centralized error handling
- Input validation with Joi
- Mongoose ODM for MongoDB operations

## Environment Variables

Required environment variables:

```
MONGODB_URI=mongodb://localhost:27017/sustainability_platform
JWT_SECRET=your_jwt_secret_key
PORT=3001
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.