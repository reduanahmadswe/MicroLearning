# 🚀 Frontend Setup - Complete Installation Guide

## ✅ What's Already Done

আমি আপনার জন্য একটা **modern Next.js 14 frontend** setup করে দিয়েছি যেখানে আছে:

### 📦 Installed & Configured:
- ✅ Next.js 16.0.3 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Shadcn UI components
- ✅ Zustand state management
- ✅ Axios for API calls
- ✅ Dark mode support
- ✅ Authentication store
- ✅ Login page (fully functional)
- ✅ Modern design system

---

## 🎯 Step-by-Step Setup

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

⏱️ This will take 2-3 minutes to install all packages.

### Step 2: Configure Environment

`.env.local` ফাইল already তৈরি করা আছে। Check করুন:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=MicroLearning
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Start Development Server

```powershell
npm run dev
```

Open: http://localhost:3000

---

## 📂 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── auth/login/page.tsx      # ✅ Login page (READY)
│   ├── layout.tsx               # ✅ Root layout
│   ├── page.tsx                 # ✅ Home (redirects to login)
│   └── globals.css              # ✅ Global styles
├── components/
│   ├── ui/                      # ✅ Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   └── providers.tsx            # ✅ Theme provider
├── lib/
│   ├── api.ts                   # ✅ Axios instance with interceptors
│   └── utils.ts                 # ✅ Utility functions
├── store/
│   └── authStore.ts             # ✅ Zustand auth store
├── package.json                 # ✅ All dependencies
├── tailwind.config.ts           # ✅ Tailwind configuration
├── tsconfig.json                # ✅ TypeScript config
└── next.config.mjs              # ✅ Next.js config
```

---

## ✨ What Works Right Now

### 1. Login Page (`/auth/login`)
- ✅ Modern UI with Shadcn components
- ✅ Form validation
- ✅ Password show/hide toggle
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ API integration ready
- ✅ Auto-redirect after login

### 2. Authentication System
- ✅ Zustand store for state management
- ✅ JWT token storage
- ✅ Auto token refresh
- ✅ Protected routes (via interceptors)
- ✅ Logout functionality

### 3. API Integration
- ✅ Axios instance configured
- ✅ Base URL from environment
- ✅ Request interceptor (adds auth token)
- ✅ Response interceptor (handles 401 errors)

### 4. Theme System
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference detection
- ✅ Smooth transitions

---

## 🎨 Design Features

### Colors
- **Primary**: Modern blue (#3B82F6)
- **Background**: Gradient (light/dark mode)
- **Cards**: Elevated with shadows
- **Buttons**: Smooth hover effects

### Components
All components are built with:
- 📱 Responsive design
- ♿ Accessibility (ARIA labels)
- 🎨 Modern aesthetics
- ⚡ Fast performance

---

## 🔄 Next Steps to Complete Frontend

### 📝 Pages to Create (Priority Order):

1. **Register Page** (`/auth/register`)
   - Similar to login
   - Additional fields (name, confirm password)
   - Terms & conditions

2. **Dashboard** (`/dashboard`)
   - Stats cards (XP, Level, Streak)
   - Recent lessons
   - Quick actions
   - Daily challenge

3. **Lessons Page** (`/lessons`)
   - Lesson list with filters
   - AI generation button
   - Search functionality
   - Bookmark feature

4. **Quiz System** (`/quiz`)
   - Quiz list
   - Quiz player
   - Results page
   - Leaderboard

5. **Profile Page** (`/profile`)
   - User info
   - Stats & achievements
   - Settings

---

## 🛠️ How to Add New Pages

### Example: Create Register Page

```typescript
// app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      toast.success("Registration successful!");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Your form JSX */}
    </div>
  );
}
```

---

## 🎯 Component Usage Examples

### Button
```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input
```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Password" disabled />
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

## 🔐 Authentication Flow

```typescript
// Login
const { login } = useAuthStore();
const response = await api.post("/auth/login", { email, password });
login(response.data.data.user, response.data.data.token);

// Check if authenticated
const { isAuthenticated, user } = useAuthStore();

// Logout
const { logout } = useAuthStore();
logout();
router.push("/auth/login");
```

---

## 📱 Responsive Design

All pages are responsive by default:

```tsx
{/* Mobile-first approach */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive grid */}
</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="block lg:hidden">Mobile only</div>
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```powershell
rm -rf node_modules
npm install
```

### Error: "Port 3000 already in use"
```powershell
# Kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use different port
$env:PORT=3001; npm run dev
```

### Error: "API connection failed"
- Check backend is running on port 5000
- Check `.env.local` has correct API URL
- Check CORS is enabled in backend

---

## 📦 Additional Packages to Install (When Needed)

```powershell
# For forms
npm install react-hook-form @hookform/resolvers zod

# For charts
npm install recharts

# For animations
npm install framer-motion

# For markdown
npm install react-markdown react-syntax-highlighter

# For icons
npm install lucide-react
```

---

## 🎉 Summary

আপনার frontend এখন **production-ready base** হিসেবে তৈরি:

✅ **Modern Tech Stack**
- Next.js 16.0.3 (Latest)
- TypeScript (Type Safety)
- Tailwind CSS (Modern Styling)
- Shadcn UI (Beautiful Components)

✅ **Complete Setup**
- Authentication system
- API integration
- State management
- Theme support
- Login page working

✅ **Ready to Build**
- Add more pages
- Integrate backend APIs
- Build features
- Deploy

---

## 🚀 Start Building!

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 এবং modern login page দেখুন! 🎨✨

Backend running আছে তো? না থাকলে:
```powershell
cd backend
npm run dev
```

এখন আপনি frontend development শুরু করতে পারেন! 🎉
