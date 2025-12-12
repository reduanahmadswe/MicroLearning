<div align="center">

# 🎓 MicroLearning Platform

### AI-Powered Micro-Learning Platform for Modern Education

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://microlearning-beta.vercel.app) • [Documentation](./backend/API_Documentation) • [Report Bug](https://github.com/reduanahmadswe/MicroLearning/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**MicroLearning** is a modern, AI-powered education platform that delivers bite-sized learning experiences through micro-lessons, interactive quizzes, gamification, and real-time collaboration. Built with cutting-edge technologies, it provides an engaging and effective learning environment for students worldwide.

### 🎯 Project Goals

- **Micro-Lessons**: Deliver 5-10 minute focused learning sessions
- **Gamification**: XP points, levels, badges, and leaderboards
- **AI Integration**: Intelligent tutoring and content generation
- **Social Learning**: Community forums, study groups, and peer interaction
- **Progress Tracking**: Comprehensive analytics and personalized dashboards
- **Accessibility**: Multi-device support with responsive design

### 📊 Platform Statistics

- 🎓 **5,000+** Active Students
- 📚 **150+** Expert Courses
- 👨‍🏫 **50+** Certified Instructors
- ⭐ **4.9/5** Average Rating
- 🌍 **40+** Countries Worldwide

---

## ✨ Key Features

### 🎓 Core Learning Features
- **Micro-Lessons**: Short, focused lessons (5-10 minutes)
- **Interactive Quizzes**: MCQ, True/False, Fill-in-the-blanks with instant feedback
- **Flashcards**: Spaced repetition for better retention
- **Video Streaming**: HLS-based adaptive streaming
- **Progress Tracking**: Real-time progress monitoring and analytics
- **Certificates**: Blockchain-verified completion certificates

### 🎮 Gamification
- **XP System**: Earn points for completed lessons and quizzes
- **Levels**: Progress from Beginner to Expert
- **Badges**: 50+ achievement badges to unlock
- **Leaderboards**: Global and friend rankings
- **Streaks**: Daily learning streak tracking
- **Challenges**: Weekly and monthly competitions

### 🤖 AI-Powered Features
- **AI Voice Tutor**: 24/7 doubt solving with voice interaction
- **Smart Recommendations**: Personalized course suggestions
- **Adaptive Learning**: Difficulty adjustment based on performance
- **Content Generation**: AI-assisted quiz and lesson creation
- **Automated Grading**: Instant quiz evaluation

### 👥 Social & Community
- **Community Forum**: Discussion boards and Q&A
- **Study Groups**: Collaborate with peers
- **Friends System**: Connect and compete
- **Live Streams**: Real-time instructor sessions
- **Activity Feed**: Track friend progress
- **Bookmarks**: Save favorite content

### 💳 Monetization
- **Freemium Model**: Basic courses free, premium paid
- **Subscription Plans**: Monthly/yearly unlimited access
- **Course Marketplace**: Individual course purchases
- **Payment Integration**: SSLCommerz gateway
- **Instructor Revenue**: Earnings dashboard

### 🛠️ Admin & Instructor Tools
- **Content Management**: Create/edit courses, lessons, quizzes
- **Analytics Dashboard**: User engagement and retention metrics
- **Badge Management**: Create custom achievements
- **User Management**: Role-based access control
- **Platform Monitoring**: Real-time system health

---

## 🛠️ Technology Stack

### Frontend
```
Next.js 16.0        - React framework with App Router
React 19            - UI library
TypeScript          - Type safety
Tailwind CSS        - Styling
Redux Toolkit       - State management
Zustand             - Lightweight state management
shadcn/ui           - UI components
Socket.io Client    - Real-time features
React Query         - Data fetching
Framer Motion       - Animations
```

### Backend
```
Node.js 22.16       - Runtime environment
Express.js          - Web framework
TypeScript          - Type safety
MongoDB 8.0         - NoSQL database
Mongoose            - ODM
Redis               - Caching & sessions
Socket.io           - Real-time communication
BullMQ              - Job queue
JWT                 - Authentication
Bcrypt              - Password hashing
```

### AI & External Services
```
OpenAI API          - AI content generation
Deepseek API        - Alternative AI provider
OpenRouter          - Unified AI API
Cloudinary          - Media hosting
SSLCommerz          - Payment gateway
Nodemailer          - Email service
```

### DevOps & Deployment
```
Vercel              - Frontend hosting
Render              - Backend hosting
MongoDB Atlas       - Database hosting
GitHub Actions      - CI/CD pipeline
Docker              - Containerization (optional)
```

---

## 📁 Project Structure

```
MicroLearning/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/      # Authentication
│   │   │   │   ├── user/      # User management
│   │   │   │   ├── course/    # Course management
│   │   │   │   ├── lesson/    # Lesson management
│   │   │   │   ├── quiz/      # Quiz system
│   │   │   │   ├── badge/     # Gamification
│   │   │   │   ├── forum/     # Community
│   │   │   │   └── ...
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   ├── workers/           # Background jobs
│   │   ├── scripts/           # Seed scripts
│   │   └── server.ts          # Entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend application
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Public routes
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   └── ...
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Student dashboard
│   │   ├── courses/           # Course pages
│   │   ├── quiz/              # Quiz interface
│   │   ├── admin/             # Admin panel
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Auth components
│   │   └── ...
│   ├── store/                 # Redux store
│   ├── services/              # API services
│   ├── lib/                   # Utilities
│   ├── types/                 # TypeScript types
│   ├── .env.local             # Environment variables
│   ├── package.json
│   └── next.config.mjs
│
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22.16 or higher
- **npm** or **yarn**: Latest version
- **MongoDB**: v8.0 or MongoDB Atlas account
- **Redis** (optional): For caching and sessions
- **Git**: For version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/reduanahmadswe/MicroLearning.git
cd MicroLearning
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

---

## 🔧 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/microlearning
# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/microlearning

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# AI Provider (Choose one)
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-chat

# SSLCommerz Payment
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_LIVE=false

# Email (Gmail recommended)
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=MicroLearning Platform

# Frontend URL
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 💻 Development

### Running Backend

```bash
cd backend

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Backend will run on: `http://localhost:5000`

### Running Frontend

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Frontend will run on: `http://localhost:3000`

### Running Both Concurrently

You can run both servers simultaneously in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

### Seeding Database

```bash
cd backend

# Seed admin user
npm run seed:admin

# Seed demo data
npm run seed:demo

# Seed all comprehensive data
npm run seed:all
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push to main

**Manual deployment:**
```bash
cd frontend
vercel --prod
```

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`
5. Add environment variables
6. Deploy

### Environment Variables for Production

**Render (Backend):**
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_ACCESS_SECRET=strong-secret
JWT_REFRESH_SECRET=strong-secret
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-key
FRONTEND_URL=https://your-frontend.vercel.app
```

**Vercel (Frontend):**
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

---

## 📚 API Documentation

Comprehensive API documentation is available in the [API_Documentation](./backend/API_Documentation) directory.

### Key API Endpoints

#### Authentication
```
POST   /api/v1/auth/register          - User registration
POST   /api/v1/auth/login             - User login
POST   /api/v1/auth/google            - Google OAuth
POST   /api/v1/auth/refresh-token     - Refresh access token
POST   /api/v1/auth/logout            - User logout
```

#### Courses
```
GET    /api/v1/courses                - Get all courses
GET    /api/v1/courses/:id            - Get course details
POST   /api/v1/courses                - Create course (Instructor)
PUT    /api/v1/courses/:id            - Update course (Instructor)
DELETE /api/v1/courses/:id            - Delete course (Instructor)
POST   /api/v1/courses/:id/enroll     - Enroll in course
```

#### Lessons
```
GET    /api/v1/lessons/:id            - Get lesson details
POST   /api/v1/lessons/:id/complete   - Mark lesson complete
GET    /api/v1/lessons/:id/next       - Get next lesson
```

#### Quizzes
```
GET    /api/v1/quiz/:id               - Get quiz
POST   /api/v1/quiz/submit            - Submit quiz attempt
GET    /api/v1/quiz/:id/results       - Get quiz results
```

#### AI Tutor
```
POST   /api/v1/ai-tutor/chat          - Chat with AI tutor
POST   /api/v1/ai-tutor/voice         - Voice interaction
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Coding Standards

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation when needed

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/reduanahmadswe">
        <img src="https://avatars.githubusercontent.com/u/143122014?v=4" width="100px;" alt="Reduan Ahmad"/><br />
        <sub><b>Reduan Ahmad</b></sub>
      </a><br />
      <sub>CEO & Founder</sub>
    </td>
    <td align="center">
      <a href="https://github.com/mohammadalinayeem">
        <img src="https://avatars.githubusercontent.com/u/85398213?v=4" width="100px;" alt="Mohammad Ali Nayeem"/><br />
        <sub><b>Mohammad Ali Nayeem</b></sub>
      </a><br />
      <sub>Co-Founder & Managing Director</sub>
    </td>
    <td align="center">
      <a href="https://github.com/abdullahalnoman003">
        <img src="https://avatars.githubusercontent.com/u/141672697?v=4" width="100px;" alt="Abdullah Al Noman"/><br />
        <sub><b>Abdullah Al Noman</b></sub>
      </a><br />
      <sub>CTO</sub>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/di21cbkyf/image/upload/v1765551133/photo_2025-12-12_20-39-08_azqxom.jpg" width="100px;" alt="Faizun Nur"/><br />
      <sub><b>Faizun Nur</b></sub><br />
      <sub>Head of Education</sub>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenAI](https://openai.com/) - AI capabilities

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

Made with ❤️ by the MicroLearning Team

[Website](https://microlearning-beta.vercel.app) • [GitHub](https://github.com/reduanahmadswe/MicroLearning) • [LinkedIn](https://linkedin.com/in/reduanahmadswe)

</div>
