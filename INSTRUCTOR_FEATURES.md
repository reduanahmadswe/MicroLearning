# 👨‍🏫 INSTRUCTOR FEATURES DOCUMENTATION

## Login Credentials
- **Email:** instructor@microlearning.com
- **Password:** instructor123456

After login, instructors are automatically redirected to `/instructor` dashboard.

---

## 🎯 INSTRUCTOR CAN DO (শিক্ষক কি কি করতে পারবে)

### 1. কন্টেন্ট তৈরি করবে (Content Creation)

#### ✅ নিজের পাঠ তৈরি করবে (Create Own Lessons)
- **Endpoint:** `POST /api/v1/lessons/create`
- **Frontend:** `/instructor/lessons/create`
- **Features:**
  - Title, Content, Topic
  - Difficulty Level (Beginner/Intermediate/Advanced)
  - Estimated Time
  - Tags
  - Video URL (Optional)
  - Quiz Questions with multiple options
  - Passing Score configuration

#### ✅ এআই এর সাহায্যে দ্রুত কন্টেন্ট বানাবে (AI-Powered Content)
- **Endpoint:** `POST /api/v1/ai/generate/lesson`
- **Features:**
  - Generate lesson from topic
  - AI generates quiz automatically
  - AI creates flashcards

#### ✅ PDF আপলোড করলে এআই মাইক্রো-লেসন বানাবে (PDF to Lessons)
- **Endpoint:** `POST /api/v1/ai/generate/lesson` (with PDF)
- **Features:**
  - Upload PDF document
  - AI extracts key concepts
  - Generates micro-lessons automatically

#### ✅ Video আপলোড করলে এআই সামারি + কুইজ বানাবে (Video Analysis)
- **Endpoint:** `POST /api/v1/ai/generate/quiz` (with video)
- **Features:**
  - Upload video
  - AI generates summary
  - AI creates quiz from video content

---

### 2. কোর্স বিক্রি করবে (Course Sales)

#### ✅ ফ্রি বা পেইড কোর্স তৈরি করবে (Create Free/Paid Courses)
- **Endpoint:** `POST /api/v1/courses`
- **Frontend:** `/instructor/courses/create`
- **Features:**
  - Set course as Free or Premium
  - Add lessons to course
  - Course description and thumbnail
  - Course structure with modules

#### ✅ দাম নিজে সেট করবে (Set Own Pricing)
- **Field:** `price` (in course creation)
- **Features:**
  - Set price in BDT/USD
  - Mark as Premium or Free
  - Discount options

#### ✅ কত মানুষ কিনছে দেখতে পারবে (View Purchase Stats)
- **Endpoint:** `GET /api/v1/courses/instructor/analytics`
- **Dashboard:** Shows enrollment count per course
- **Metrics:**
  - Total enrollments
  - Recent enrollments (last 30 days)
  - Enrollment by course

#### ✅ টাকা আয় করবে (Earn Revenue)
- **Endpoint:** `GET /api/v1/courses/instructor/analytics`
- **Field:** `totalRevenue`
- **Calculation:** `price × enrollmentCount` per course
- **Dashboard:** Shows total revenue earned

---

### 3. শিক্ষার্থীদের পারফরম্যান্স দেখবে (Student Performance)

#### ✅ কতজন তার কোর্স নিচ্ছে (View Student Enrollments)
- **Endpoint:** `GET /api/v1/courses/instructor/analytics`
- **Metrics:**
  - `totalStudents` - Unique students across all courses
  - `totalEnrollments` - Total course enrollments
  - Students per course

#### ✅ কোন পাঠ বেশি দেখছে (Most Viewed Lessons)
- **Endpoint:** `GET /api/v1/lessons/instructor/analytics`
- **Metrics:**
  - `totalViews` - Total lesson views
  - `topLessons` - Top 5 performing lessons with view counts
  - Views per lesson

#### ✅ কোথায় শিক্ষার্থীরা আটকে যাচ্ছে (Where Students Struggle)
- **Endpoint:** `GET /api/v1/courses/instructor/:courseId/students`
- **Metrics:**
  - Student progress percentage per course
  - Completed vs incomplete lessons
  - Average progress across all students
  - `completionRate` - Overall completion percentage

#### ✅ কুইজ স্কোর কেমন (Quiz Performance)
- **Endpoint:** `GET /api/v1/lessons/instructor/analytics`
- **Metrics:**
  - `totalCompletions` - How many finished lessons
  - `completionRate` - Percentage of students completing
  - Quiz attempts and scores (via quiz analytics)

---

## 🎛️ INSTRUCTOR DASHBOARD ROUTES

### Main Dashboard
- **Route:** `/instructor`
- **Features:**
  - Stats cards (Lessons, Courses, Students, Views)
  - Quick action buttons (Create Lesson, Create Course, Create Quiz)
  - Recent lessons list with edit/view options
  - Recent courses grid

### Lesson Management
- **Create:** `/instructor/lessons/create`
- **View All:** `/instructor/lessons`
- **Edit:** `/instructor/lessons/[id]/edit`

### Course Management
- **Create:** `/instructor/courses/create`
- **View All:** `/instructor/courses`
- **Edit:** `/instructor/courses/[id]/edit`
- **View Students:** `/instructor/courses/[id]/students`

### Quiz Management
- **Create:** `/instructor/quizzes/create`
- **View All:** `/instructor/quizzes`

---

## 📊 BACKEND API ENDPOINTS

### Lesson Endpoints
```
GET    /api/v1/lessons/instructor/my-lessons          - Get instructor's lessons
GET    /api/v1/lessons/instructor/analytics           - Get lesson analytics
POST   /api/v1/lessons/create                         - Create new lesson
PUT    /api/v1/lessons/:id                            - Update lesson
DELETE /api/v1/lessons/:id                            - Delete lesson
```

### Course Endpoints
```
GET    /api/v1/courses/instructor/my-courses          - Get instructor's courses
GET    /api/v1/courses/instructor/analytics           - Get course analytics
GET    /api/v1/courses/instructor/:courseId/students  - Get course students
POST   /api/v1/courses                                - Create new course
PUT    /api/v1/courses/:id                            - Update course
DELETE /api/v1/courses/:id                            - Delete course
```

### AI Endpoints (Available for instructors)
```
POST   /api/v1/ai/generate/lesson                     - Generate AI lesson
POST   /api/v1/ai/generate/quiz                       - Generate AI quiz
POST   /api/v1/ai/generate/flashcards                 - Generate AI flashcards
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Role-Based Access
- **Instructor Role:** `role: 'instructor'`
- **Auth Guard:** `authGuard('instructor', 'admin')`
- **Routes:** Only instructors and admins can access instructor endpoints

### Login Flow
1. Login with instructor credentials
2. AuthMiddleware checks user role
3. If `role === 'instructor'` → Redirect to `/instructor`
4. Token stored in localStorage
5. All API calls include auth token

---

## 📈 ANALYTICS BREAKDOWN

### Lesson Analytics Response
```typescript
{
  totalLessons: number,
  totalViews: number,
  totalLikes: number,
  totalCompletions: number,
  completionRate: number,        // Percentage
  byDifficulty: {
    beginner: number,
    intermediate: number,
    advanced: number
  },
  topLessons: [
    {
      id: string,
      title: string,
      views: number,
      completions: number,
      likes: number
    }
  ]
}
```

### Course Analytics Response
```typescript
{
  totalCourses: number,
  totalStudents: number,          // Unique students
  totalEnrollments: number,
  completedEnrollments: number,
  completionRate: number,         // Percentage
  averageProgress: number,        // Percentage
  totalRevenue: number,           // Total earnings
  recentEnrollments: number,      // Last 30 days
  courses: [
    {
      id: string,
      title: string,
      enrolledCount: number,
      price: number,
      isPublished: boolean
    }
  ]
}
```

### Course Students Response
```typescript
[
  {
    student: {
      _id: string,
      name: string,
      email: string,
      profilePicture: string
    },
    enrolledAt: Date,
    progress: number,              // Percentage
    isCompleted: boolean,
    completedLessons: string[],
    lastAccessed: Date
  }
]
```

---

## 🎨 FRONTEND COMPONENTS

### Dashboard Stats Cards
- Total Lessons
- Total Courses  
- Total Students
- Total Views

### Quick Actions
- Create Lesson (Blue card with Plus icon)
- Create Course (Green card with Video icon)
- Create Quiz (Purple card with FileQuestion icon)

### Recent Content Lists
- Recent Lessons (with view/edit buttons)
- Recent Courses (grid layout)

---

## ✅ IMPLEMENTATION STATUS

### Backend (COMPLETE)
- ✅ Instructor authentication & authorization
- ✅ Lesson CRUD endpoints
- ✅ Course CRUD endpoints
- ✅ Instructor analytics endpoints
- ✅ Student performance tracking
- ✅ Revenue calculation
- ✅ Course students endpoint

### Frontend (COMPLETE)
- ✅ Instructor dashboard UI
- ✅ Lesson creation form with video & quiz
- ✅ Stats cards with real data
- ✅ Quick action buttons
- ✅ Recent lessons list
- ✅ Recent courses grid
- ✅ AuthMiddleware redirect for instructor
- ✅ API service methods

### Pending Features
- ⏳ Course creation form UI
- ⏳ Course students view page
- ⏳ Quiz creation form UI
- ⏳ Revenue withdrawal system
- ⏳ PDF/Video upload with AI processing

---

## 🚀 HOW TO USE

1. **Login as Instructor:**
   - Email: instructor@microlearning.com
   - Password: instructor123456

2. **Create Content:**
   - Click "Create Lesson" from dashboard
   - Fill in lesson details
   - Add video URL (optional)
   - Add quiz questions
   - Submit to create

3. **View Analytics:**
   - Dashboard shows all stats automatically
   - Total lessons, courses, students, views
   - Revenue tracking

4. **Manage Students:**
   - View course enrollments
   - Track student progress
   - See completion rates

---

## 📝 NOTES

- All instructor endpoints require authentication
- Only instructors and admins can access instructor routes
- Revenue is calculated automatically based on enrollments
- Analytics update in real-time
- Quiz integration with lessons is complete
- Video integration ready for YouTube/Vimeo URLs

---

## 🔗 RELATED FILES

### Backend
- `backend/src/app/modules/course/course.route.ts`
- `backend/src/app/modules/course/course.controller.ts`
- `backend/src/app/modules/course/course.service.ts`
- `backend/src/app/modules/microLessons/lesson.route.ts`
- `backend/src/app/modules/microLessons/lesson.controller.ts`
- `backend/src/app/modules/microLessons/lesson.service.ts`

### Frontend
- `frontend/app/instructor/page.tsx`
- `frontend/app/instructor/lessons/create/page.tsx`
- `frontend/components/auth/AuthMiddleware.tsx`
- `frontend/services/api.service.ts`
