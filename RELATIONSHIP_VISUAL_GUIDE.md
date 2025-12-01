# 🎓 Course-Lesson-Quiz Relationship - Visual Guide

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Instructor)                        │
│  _id, name, email, role: "instructor"                           │
└────────────────┬────────────────────────────────────────────────┘
                 │ author
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                            COURSE                                │
│  _id, title, description, author (ref: User)                    │
│  lessons: [{ lesson: ObjectId, order: Number }]                 │
│  isPremium, price, enrolledCount, rating                        │
└────────────────┬────────────────────────────────────────────────┘
                 │ course (REQUIRED)
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                            LESSON                                │
│  _id, title, content, description                               │
│  course: ObjectId (ref: Course) ← REQUIRED ✅                   │
│  author: ObjectId (ref: User)                                   │
│  order, estimatedTime, difficulty                               │
│  requiredQuizScore: 80 (default)                                │
└────────────────┬────────────────────────────────────────────────┘
                 │ lesson (REQUIRED)
                 │ course (REQUIRED)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                             QUIZ                                 │
│  _id, title, description                                        │
│  lesson: ObjectId (ref: Lesson) ← REQUIRED ✅                   │
│  course: ObjectId (ref: Course) ← REQUIRED ✅                   │
│  author: ObjectId (ref: User)                                   │
│  questions: [{ question, options, correctAnswer, ... }]         │
│  passingScore: 80 (default)                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    INSTRUCTOR WORKFLOW                           │
└──────────────────────────────────────────────────────────────────┘

Step 1: Create Course
───────────────────────────────────────────
  📚 /instructor/courses → "Create Course"
  
  Input: {
    title: "React Basics",
    description: "...",
    difficulty: "beginner"
  }
  
  Output: Course ID = "ABC123"
  
  ↓

Step 2: Add Lessons to Course
───────────────────────────────────────────
  📝 /instructor/courses/ABC123/lessons → "Add Lesson"
  
  Input: {
    title: "Components",
    content: "...",
    course: "ABC123" ← Automatically linked
  }
  
  Output: Lesson ID = "DEF456"
  
  ↓

Step 3: Create Quiz for Lesson
───────────────────────────────────────────
  ❓ /instructor/courses/ABC123/lessons/DEF456/quiz/create
  
  Input: {
    title: "Components Quiz",
    course: "ABC123" ← Automatically linked
    lesson: "DEF456" ← Automatically linked
    questions: [...]
  }
  
  Output: Quiz ID = "GHI789"
  
  ↓

Step 4: Publish & Ready
───────────────────────────────────────────
  ✅ Course → Lessons → Quizzes (Complete Hierarchy)
  
  Students can now:
  - Enroll in course
  - Take lessons sequentially
  - Pass quizzes (80%+) to unlock next lesson
```

## 🎯 Student Learning Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     STUDENT WORKFLOW                             │
└──────────────────────────────────────────────────────────────────┘

Step 1: Enroll in Course
───────────────────────────────────────────
  Student clicks "Enroll" on Course page
  
  POST /api/v1/courses/:id/enroll
  
  Creates: Enrollment {
    user: studentId,
    course: courseId,
    progress: 0,
    completedLessons: []
  }
  
  ↓

Step 2: Start Lesson 1 (Unlocked by default)
───────────────────────────────────────────
  🔓 Lesson 1: "Introduction to Components"
  
  Student reads content, watches video
  
  ↓

Step 3: Take Quiz for Lesson 1
───────────────────────────────────────────
  ❓ Quiz: "Components Quiz"
  
  POST /api/v1/quizzes/:id/submit
  
  {
    answers: [
      { questionIndex: 0, answer: "Option A" },
      { questionIndex: 1, answer: "Option B" }
    ],
    timeTaken: 180
  }
  
  ↓

Step 4: Pass Quiz (Score >= 80%)
───────────────────────────────────────────
  ✅ Score: 90% → PASS
  
  System automatically:
  - Marks lesson as completed
  - Updates progress
  - 🔓 UNLOCKS Lesson 2
  
  ↓

Step 5: Repeat for All Lessons
───────────────────────────────────────────
  Lesson 2 → Quiz 2 → Pass → Unlock Lesson 3
  Lesson 3 → Quiz 3 → Pass → Unlock Lesson 4
  ...
  
  ↓

Step 6: Complete Course
───────────────────────────────────────────
  ✅ All lessons completed
  ✅ All quizzes passed (80%+)
  
  🎓 Certificate Generated
```

## 🔐 Authorization & Validation Matrix

| Action | Who Can Do | Validation Checks |
|--------|-----------|-------------------|
| **Create Course** | Instructor, Admin | - Valid user token<br>- Required fields filled |
| **Create Lesson** | Course Author, Admin | - Course exists<br>- User is course author<br>- `course` field required |
| **Create Quiz** | Course Author, Admin | - Course exists<br>- Lesson exists<br>- Lesson belongs to course<br>- No existing quiz for lesson<br>- `course` & `lesson` required |
| **Enroll in Course** | Student, Instructor | - Course is published<br>- User not already enrolled |
| **Take Quiz** | Enrolled Student | - User enrolled in course<br>- Lesson unlocked<br>- Quiz exists |
| **Unlock Next Lesson** | System (Automatic) | - Quiz passed (score >= 80%)<br>- Previous lessons completed |

## 📊 Database Queries Examples

### Get All Lessons for a Course
```javascript
GET /api/v1/lessons?course=ABC123

// Backend Query
const lessons = await Lesson.find({ course: 'ABC123' })
  .sort({ order: 1 })
  .populate('author', 'name');
```

### Get Quiz for a Specific Lesson
```javascript
GET /api/v1/quizzes?lesson=DEF456

// Backend Query
const quiz = await Quiz.findOne({ lesson: 'DEF456' })
  .populate('lesson', 'title')
  .populate('course', 'title');
```

### Get Student's Completed Lessons
```javascript
GET /api/v1/courses/:id/enrollments/me

// Backend Query
const enrollment = await Enrollment.findOne({
  user: userId,
  course: courseId
}).populate('completedLessons');
```

## 🎨 Frontend UI Structure

```
/instructor/courses
  └── Course Card 1
      └── [Manage Lessons] Button
            ↓
  /instructor/courses/:courseId/lessons
      └── Lesson Card 1 [order: 1]
          └── [Create Quiz] Button
                ↓
      /instructor/courses/:courseId/lessons/:lessonId/quiz/create
          └── Quiz Form
              └── [Save Quiz] Button
                    ↓
      /instructor/courses/:courseId/lessons
          └── Lesson Card 1 [Quiz: ✅ Created]
      
      └── Lesson Card 2 [order: 2]
          └── [Create Quiz] Button
```

## ✅ Validation Summary

### ✅ Backend Validations (Zod Schemas)

**Lesson Creation:**
```typescript
course: z.string().required('Course ID is required')
title: z.string().min(3).max(200)
content: z.string().min(50)
estimatedTime: z.number().min(1).max(60)
```

**Quiz Creation:**
```typescript
course: z.string().required('Course ID is required')
lesson: z.string().required('Lesson ID is required')
questions: z.array().min(1).max(50)
explanation: z.string().min(10) // Each question
passingScore: z.number().min(0).max(100).default(80)
```

### ✅ Database Constraints

**Lesson Model:**
```typescript
course: { required: true, ref: 'Course' }
author: { required: true, ref: 'User' }
title: { required: true, maxlength: 200 }
```

**Quiz Model:**
```typescript
course: { required: true, ref: 'Course' }
lesson: { required: true, ref: 'Lesson' }
author: { required: true, ref: 'User' }
// One quiz per lesson (checked in service)
```

## 🎓 Key Points Summary

1. ✅ **Hierarchical Structure:** Course → Lesson → Quiz (সবসময় এই order)
2. ✅ **Required Relationships:** 
   - Lesson MUST have a course
   - Quiz MUST have both course AND lesson
3. ✅ **Authorization:** শুধুমাত্র course author এবং admin create/edit করতে পারবে
4. ✅ **Sequential Unlocking:** Quiz pass (80%+) করলে next lesson unlock
5. ✅ **One Quiz Per Lesson:** একটা lesson-এ একাধিক quiz থাকতে পারবে না
6. ✅ **Auto Ordering:** Lesson automatically order assign হয় course-এর মধ্যে

---

**Visual Guide Version:** 1.0  
**Created:** December 1, 2025  
**Status:** ✅ Active & Validated
