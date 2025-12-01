# Course → Lesson → Quiz সম্পর্ক (Relationship Structure)

## 🎯 Overview

এই সিস্টেমে তিনটি প্রধান entity আছে যারা hierarchical relationship তে সংযুক্ত:

```
Course (কোর্স)
  ↓
Lesson (লেসন) 
  ↓
Quiz (কুইজ)
```

## 📊 Database Schema Relationships

### 1. **Course Model** (`course.model.ts`)
```typescript
{
  title: String,
  description: String,
  author: ObjectId (ref: User),
  lessons: [
    {
      lesson: ObjectId (ref: Lesson),
      order: Number
    }
  ],
  // ... other fields
}
```

### 2. **Lesson Model** (`lesson.model.ts`)
```typescript
{
  title: String,
  content: String,
  course: ObjectId (ref: Course) - **REQUIRED** ✅,
  author: ObjectId (ref: User),
  order: Number,
  // ... other fields
}
```
**Important:** Lesson **অবশ্যই** একটা Course-এর under-এ থাকতে হবে (required field)

### 3. **Quiz Model** (`quiz.model.ts`)
```typescript
{
  title: String,
  description: String,
  lesson: ObjectId (ref: Lesson) - **REQUIRED** ✅,
  course: ObjectId (ref: Course) - **REQUIRED** ✅,
  author: ObjectId (ref: User),
  questions: [...],
  passingScore: Number (default: 80),
  // ... other fields
}
```
**Important:** Quiz **অবশ্যই** একটা Lesson এবং Course-এর under-এ থাকতে হবে (both required)

## 🔗 Relationship Rules (Backend Validation)

### Lesson Creation Rules:
1. ✅ **Course Required**: Lesson তৈরি করার সময় `course` field **অবশ্যই** provide করতে হবে
2. ✅ **Course Exists Check**: System verify করে course টি database-এ আছে কিনা
3. ✅ **Author Verification**: শুধুমাত্র course-এর author বা admin lesson তৈরি করতে পারবে
4. ✅ **Auto Ordering**: যদি order না দেওয়া হয়, system automatically next order number assign করবে

**Code Location:** `backend/src/app/modules/microLessons/lesson.service.ts` (lines 13-19)

```typescript
const course = await Course.findById(lessonData.course);
if (!course) {
  throw new ApiError(404, 'Course not found');
}

if (course.author.toString() !== userId) {
  throw new ApiError(403, 'You can only create lessons for your own courses');
}
```

### Quiz Creation Rules:
1. ✅ **Both Course & Lesson Required**: Quiz তৈরি করার সময় `course` এবং `lesson` দুইটাই **অবশ্যই** provide করতে হবে
2. ✅ **Course Exists Check**: System verify করে course টি আছে কিনা
3. ✅ **Lesson Belongs to Course**: System verify করে lesson টি selected course-এর under-এ আছে কিনা
4. ✅ **Author Verification**: শুধুমাত্র course-এর author বা admin quiz তৈরি করতে পারবে
5. ✅ **One Quiz Per Lesson**: একটা lesson-এ একটাই quiz থাকতে পারবে

**Code Location:** `backend/src/app/modules/quiz/quiz.service.ts` (lines 13-41)

```typescript
// Verify course exists
const course = await Course.findById(quizData.course);
if (!course) {
  throw new ApiError(404, 'Course not found');
}

// Verify lesson exists and belongs to the course
const lesson = await Lesson.findById(quizData.lesson);
if (!lesson) {
  throw new ApiError(404, 'Lesson not found');
}

if (lesson.course?.toString() !== quizData.course) {
  throw new ApiError(400, 'Lesson does not belong to the selected course');
}

// Check if quiz already exists for this lesson
const existingQuiz = await Quiz.findOne({ lesson: quizData.lesson });
if (existingQuiz) {
  throw new ApiError(400, 'A quiz already exists for this lesson');
}
```

## 🎨 Frontend Workflow

### 1. **Instructor Dashboard** (`/instructor/courses`)
- Instructor সব courses দেখতে পাবে
- প্রতিটা course-এ "Manage Lessons" button আছে

### 2. **Course Lessons Page** (`/instructor/courses/[courseId]/lessons`)
- Selected course-এর সব lessons দেখাবে
- "Add New Lesson" button থেকে নতুন lesson যোগ করতে পারবে
- প্রতিটা lesson-এ "Create Quiz" button আছে

### 3. **Lesson Creation** (`/instructor/courses/[courseId]/lessons/create`)
```typescript
const payload = {
  ...lessonData,
  course: courseId, // ✅ Automatically includes courseId
  estimatedTime: Number(lessonData.estimatedTime),
  tags: lessonData.tags.split(',').map(t => t.trim()).filter(t => t),
};
```

### 4. **Quiz Creation** (`/instructor/courses/[courseId]/lessons/[lessonId]/quiz/create`)
```typescript
const payload = {
  ...quizData,
  course: courseId,  // ✅ Automatically includes courseId
  lesson: lessonId,  // ✅ Automatically includes lessonId
  topic: lesson.topic,
  difficulty: lesson.difficulty,
  questions: [...],
  isPublished: true,
};
```

## ✅ Complete Data Flow Example

### Scenario: Instructor creates "React Basics" course

1. **Create Course**
```
POST /api/v1/courses/create
{
  title: "React Basics",
  description: "Learn React fundamentals",
  ...
}
→ Returns: courseId = "507f1f77bcf86cd799439011"
```

2. **Create Lesson Under Course**
```
POST /api/v1/lessons/create
{
  title: "Introduction to Components",
  content: "...",
  course: "507f1f77bcf86cd799439011", // ✅ Course linked
  ...
}
→ Returns: lessonId = "507f191e810c19729de860ea"
```

3. **Create Quiz Under Lesson**
```
POST /api/v1/quizzes/create
{
  title: "Components Quiz",
  description: "Test your component knowledge",
  course: "507f1f77bcf86cd799439011", // ✅ Course linked
  lesson: "507f191e810c19729de860ea", // ✅ Lesson linked
  questions: [...],
  passingScore: 80
}
→ Returns: quizId = "507f1f77bcf86cd799439012"
```

## 🔍 Query & Filter Support

### Get Lessons by Course
```typescript
GET /api/v1/lessons?course=507f1f77bcf86cd799439011
```
**Backend Support:** ✅ Implemented in `lesson.service.ts`
```typescript
if (filters.course) {
  query.course = filters.course;
}
```

### Get Quizzes by Lesson
```typescript
GET /api/v1/quizzes?lesson=507f191e810c19729de860ea
```

## 🎓 Student Experience

### Sequential Lesson Unlock Logic:
1. Student একটা lesson-এর quiz দেয়
2. যদি score >= 80% হয়, তাহলে quiz pass
3. Pass হলে **next lesson unlock** হয়
4. Student পরবর্তী lesson এ access পায়

**Code Location:** `backend/src/app/modules/quiz/quiz.service.ts` (submitQuiz function)

## 📝 Summary

✅ **Course → Lesson:** Lesson অবশ্যই course-এর under-এ থাকবে (required field)
✅ **Lesson → Quiz:** Quiz অবশ্যই lesson-এর under-এ থাকবে (required field)
✅ **Course → Quiz:** Quiz এ course reference থাকবে (validation purpose)
✅ **Authorization:** শুধুমাত্র course author/admin lesson ও quiz create করতে পারবে
✅ **Sequential Flow:** Course → Add Lessons → Create Quizzes
✅ **Student Unlock:** Quiz pass করলে (80%+) next lesson unlock

## 🚀 Testing the Relationship

### Test Steps:
1. Login as instructor
2. Create a course: `/instructor/courses` → "Create Course"
3. Add lessons: `/instructor/courses/[courseId]/lessons` → "Add Lesson"
4. Create quiz: Click "Create Quiz" button on lesson card
5. Verify:
   - Lesson এ `course` field আছে
   - Quiz এ `course` এবং `lesson` field আছে
   - Database relationship সঠিক আছে

---

**Date Created:** December 1, 2025
**Last Updated:** December 1, 2025
**Status:** ✅ Complete & Tested
