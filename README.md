# The SDG Wheel - Sustainability Challenge Platform

A full-stack web application focused on SDG/climate gamification with user authentication, challenges, and interactive features.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 22+ recommended)
- MongoDB (local installation or cloud instance)
- npm or pnpm

### 1. Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB as a service or run `mongod` command
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 2. Backend Setup
```bash
cd Server
npm install
npm run dev
```

The backend will be available at: http://localhost:3001
- Health check: http://localhost:3001/api/health
- API info: http://localhost:3001/api

### 3. Frontend Setup
```bash
cd Client
npm install
npm run dev
```

The frontend will be available at: http://localhost:3000

## 🔧 Configuration

### Backend Environment Variables (.env)
The backend uses the following environment variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ODD_Wheel

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Frontend Environment Variables (.env)
The frontend uses:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📁 Project Structure

### Frontend (Client/)
- **React + Vite** setup with modern JavaScript
- **Tailwind CSS** for styling with dark/light mode support
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide React** for icons

### Backend (Server/)
- **Node.js + Express** API server
- **MongoDB + Mongoose** for data persistence
- **JWT** authentication
- **Joi** validation
- **bcryptjs** for password hashing

## 🌟 Features

### 🔐 Authentication System
- User registration with avatar upload
- Secure login with JWT tokens
- Role-based access (user/admin)
- Protected routes and dashboard

### 🎮 SDG Wheel Game
- Interactive spinning wheel with 17 SDG goals
- Real SDG icons and colors
- Smooth animations and visual effects
- Challenge selection system

### 👤 User Dashboard
- Profile management
- Progress tracking
- Points and level system
- Avatar display

### 🏆 Gamification Features
- Points and leveling system
- Leaderboards
- Badges and achievements
- Challenge completion tracking

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/leaderboard` - Get leaderboard
- `POST /api/users/spin-wheel` - Spin wheel for challenge

### Challenges & SDGs
- `GET /api/challenges` - Get all challenges
- `GET /api/odds` - Get all SDG data
- `POST /api/proofs` - Submit challenge proof

## 🎨 UI/UX Features

### Design System
- **Modern glassmorphic design** with backdrop blur effects
- **Gradient backgrounds** and hover animations
- **Responsive layout** for all screen sizes
- **Dark/light mode toggle** with theme persistence

### Interactive Elements
- **Floating navigation bar** with smooth scroll detection
- **Mouse follower effects** and particle animations
- **Smooth page transitions** with Framer Motion
- **Loading states** and error handling

## 🔍 Troubleshooting

### Common Issues

1. **Import Path Errors**
   - Make sure all imports use relative paths (`../` or `./`)
   - Check that all required components exist

2. **API Connection Issues**
   - Verify backend is running on port 3001
   - Check CORS settings in backend
   - Ensure frontend .env file has correct API URL

3. **Authentication Issues**
   - Clear localStorage if tokens are corrupted
   - Check JWT secret in backend .env
   - Verify token expiration settings

4. **Database Connection**
   - Ensure MongoDB is running
   - Check MongoDB URI in backend .env
   - Verify database permissions

### Quick Fixes

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear browser storage
# Go to Developer Tools > Application > Storage > Clear storage

# Restart both servers
# Kill existing processes and run npm run dev again
```

## 📝 Development Notes

### Code Quality
- ES6+ JavaScript with modern React patterns
- Consistent component structure and naming
- Error handling and validation throughout
- Responsive design principles

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation with Joi
- Rate limiting and CORS protection
- XSS and injection prevention

### Performance Optimizations
- Image optimization and lazy loading
- Component code splitting
- Efficient state management
- Database indexing

## 🎯 Next Steps

Potential improvements and features:
- Real-time notifications
- Social features and team challenges
- Advanced analytics dashboard
- Mobile app development
- Integration with external SDG data sources

---

**Built with ❤️ for sustainability and environmental awareness**
