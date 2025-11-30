# 🎓 MicroLearning Frontend - Modern Next.js Application

A modern, AI-powered micro-learning platform built with Next.js 16.0.3, TypeScript, Tailwind CSS, and Shadcn UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running on `http://localhost:5000`

### Installation

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Tech Stack

### Core
- **Next.js 16.0.3** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Beautiful component library

### State Management
- **Zustand** - Lightweight state management
- **Persist middleware** - Local storage persistence

### UI Components
- **Radix UI** - Accessible components
- **Lucide Icons** - Modern icon library
- **Framer Motion** - Smooth animations
- **Sonner** - Toast notifications
- **Recharts** - Data visualization

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### API & Data
- **Axios** - HTTP client
- **React Query** (to be added) - Data fetching

---

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Main dashboard
│   ├── lessons/           # Micro lessons
│   ├── quiz/              # Quiz system
│   ├── courses/           # Courses
│   ├── profile/           # User profile
│   ├── leaderboard/       # Leaderboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   ├── features/         # Feature-specific components
│   └── providers.tsx     # Context providers
├── lib/                  # Utilities
│   ├── api.ts           # Axios instance
│   └── utils.ts         # Helper functions
├── store/               # State management
│   └── authStore.ts     # Auth state
├── hooks/               # Custom hooks
├── types/               # TypeScript types
└── public/              # Static assets
```

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red

### Theme
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference

### Typography
- Font: Inter (Google Fonts)
- Scale: Tailwind default

---

## 🔑 Features to Implement

### ✅ Phase 1 - Core Setup (DONE)
- [x] Next.js 16.0.3 setup
- [x] Tailwind CSS + Shadcn UI
- [x] Authentication store
- [x] API configuration
- [x] Dark mode support
- [x] Login page

### ✅ Phase 2 - Authentication (DONE)
- [x] Register page
- [x] Password reset (Forgot password + Reset password)
- [x] Email verification
- [x] Auth middleware
- [x] Protected routes
- [x] Dashboard page

### 📝 Phase 3 - Dashboard
- [ ] Dashboard layout
- [ ] Navigation sidebar
- [ ] User profile dropdown
- [ ] Notifications
- [ ] Stats cards
- [ ] Recent activity

### 📚 Phase 4 - Learning Features
- [ ] Micro lessons list
- [ ] AI lesson generator
- [ ] Lesson viewer (Markdown support)
- [ ] Text-to-speech player
- [ ] Quiz system
- [ ] Flashcards with SRS
- [ ] Progress tracking

### 🎮 Phase 5 - Gamification
- [ ] XP and level system
- [ ] Badges and achievements
- [ ] Leaderboard (global, friends, topic)
- [ ] Daily challenges
- [ ] Streak tracker

### 👥 Phase 6 - Social Features
- [ ] User profiles
- [ ] Friend system
- [ ] Discussion forum
- [ ] Comments on lessons
- [ ] Activity feed

### 🎓 Phase 7 - Courses
- [ ] Course browser
- [ ] Course details page
- [ ] Course enrollment
- [ ] Learning paths
- [ ] Progress tracking

### 📊 Phase 8 - Analytics
- [ ] Personal analytics dashboard
- [ ] Learning insights
- [ ] Performance charts
- [ ] Recommendations

### 🛒 Phase 9 - Marketplace
- [ ] Premium courses
- [ ] Payment integration (SSLCommerz)
- [ ] Purchase history
- [ ] Creator dashboard

### ⚙️ Phase 10 - Settings
- [ ] Profile settings
- [ ] Learning preferences
- [ ] Email preferences
- [ ] Privacy settings

---

## 🎯 Component Library

### Basic UI Components (Shadcn)
- ✅ Button
- ✅ Input
- ✅ Card
- [ ] Badge
- [ ] Avatar
- [ ] Dialog
- [ ] Dropdown
- [ ] Tabs
- [ ] Tooltip
- [ ] Progress
- [ ] Slider
- [ ] Switch
- [ ] Select

### Custom Components
- [ ] Navbar
- [ ] Sidebar
- [ ] Footer
- [ ] LessonCard
- [ ] QuizCard
- [ ] BadgeDisplay
- [ ] XPProgress
- [ ] StreakCounter
- [ ] LeaderboardTable
- [ ] CourseCard
- [ ] UserAvatar
- [ ] LoadingSpinner
- [ ] EmptyState

---

## 🔧 Environment Variables

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=MicroLearning
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📱 Responsive Design

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

All components are fully responsive using Tailwind CSS breakpoints.

---

## 🧪 Testing

```powershell
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

---

## 🚀 Deployment

### Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build
```powershell
npm run build
npm start
```

---

## 📖 API Integration

### Authentication
```typescript
// Login
POST /auth/login
Body: { email, password }

// Register
POST /auth/register
Body: { email, password, name }

// Get current user
GET /auth/me
Headers: { Authorization: Bearer <token> }
```

### Lessons
```typescript
// Get all lessons
GET /micro-lessons

// Get lesson by ID
GET /micro-lessons/:id

// Generate AI lesson
POST /ai/generate-lesson
Body: { topic, difficulty }
```

See `backend/API_Documentation/` for complete API docs.

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: "your-color",
      // ...
    }
  }
}
```

### Add Custom Font
Edit `app/layout.tsx`:
```typescript
import { YourFont } from "next/font/google";
const yourFont = YourFont({ subsets: ["latin"] });
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow ESLint rules
- Use Prettier for formatting
- Use meaningful variable names

### Component Structure
```typescript
// 1. Imports
import { ... } from "...";

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
export default function Component({ props }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => { ... }, []);
  
  // 6. Handlers
  const handleClick = () => { ... };
  
  // 7. Render
  return <div>...</div>;
}
```

### File Naming
- Components: `PascalCase.tsx`
- Utils: `camelCase.ts`
- Hooks: `use*.ts`
- Types: `*.types.ts`

---

## 🐛 Common Issues

### Issue: "Module not found"
**Solution**: Run `npm install`

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or use different port:
```powershell
# Use different port
$env:PORT=3001; npm run dev
```

### Issue: "API connection failed"
**Solution**: Ensure backend is running on port 5000

---

## 📞 Support

For issues or questions, please:
1. Check existing documentation
2. Search GitHub issues
3. Create a new issue with details

---

## ✨ Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up `.env.local` file
3. ✅ Start backend server
4. ✅ Run frontend: `npm run dev`
5. 🚀 Start building features!

---

**Happy Coding! 🎉**
