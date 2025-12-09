# Quiz API Documentation

## Overview
The Quiz module provides comprehensive quiz creation, AI-based generation, submission, and scoring functionality. It supports multiple question types (MCQ, True/False, Fill-in-blank) with automatic grading and XP rewards.

## Base URL
```
/api/v1/quizzes
```

---

## Endpoints

### 1. Create Quiz
Create a new quiz manually.

**Endpoint:** `POST /api/v1/quizzes/create`  
**Auth Required:** Yes (Instructor, Admin)

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JavaScript basics including variables, functions, and control flow",
  "topic": "JavaScript",
  "difficulty": "beginner",
  "lesson": "64abc123def456789", // Optional - link to lesson
  "questions": [
    {
      "type": "mcq",
      "question": "What is the correct syntax to declare a variable in JavaScript?",
      "options": ["var x = 5;", "variable x = 5;", "v x = 5;", "dim x = 5;"],
      "correctAnswer": "var x = 5;",
      "explanation": "In JavaScript, variables are declared using var, let, or const keywords",
      "points": 1
    },
    {
      "type": "true-false",
      "question": "JavaScript is a compiled language",
      "correctAnswer": "false",
      "explanation": "JavaScript is an interpreted language, not compiled",
      "points": 1
    },
    {
      "type": "fill-blank",
      "question": "The _____ method is used to add elements to the end of an array",
      "correctAnswer": "push",
      "explanation": "The push() method adds one or more elements to the end of an array",
      "points": 1
    }
  ],
  "timeLimit": 15,
  "passingScore": 70,
  "isPremium": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "_id": "64xyz789abc123",
    "title": "JavaScript Fundamentals Quiz",
    "description": "Test your knowledge of JavaScript basics...",
    "topic": "JavaScript",
    "difficulty": "beginner",
    "questions": [...],
    "timeLimit": 15,
    "passingScore": 70,
    "author": "64user123",
    "isPublished": false,
    "isPremium": false,
    "attempts": 0,
    "averageScore": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Generate AI Quiz
Generate a quiz using AI based on topic or lesson content.

**Endpoint:** `POST /api/v1/quizzes/generate`  
**Auth Required:** Yes (Instructor, Admin)

**Request Body:**
```json
{
  "topic": "Python Lists",
  "lessonId": "64lesson123", // Optional
  "difficulty": "intermediate",
  "questionCount": 5,
  "questionTypes": ["mcq", "true-false", "fill-blank"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "_id": "64quiz456",
    "title": "Python Lists Quiz",
    "description": "Test your knowledge on Python Lists",
    "topic": "Python Lists",
    "difficulty": "intermediate",
    "questions": [
      // AI-generated questions
    ],
    "author": "64user123",
    "isPublished": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Note:** AI generation currently uses a template. Integration with OpenAI/Claude is planned.

---

### 3. Get All Quizzes
Retrieve quizzes with optional filters.

**Endpoint:** `GET /api/v1/quizzes`  
**Auth Required:** No

**Query Parameters:**
- `topic` (string) - Filter by topic (case-insensitive regex)
- `difficulty` (string) - Filter by difficulty (beginner, intermediate, advanced)
- `lesson` (string) - Filter by lesson ID
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Results per page

**Examples:**
```
GET /api/v1/quizzes?topic=javascript&difficulty=beginner
GET /api/v1/quizzes?lesson=64lesson123&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quizzes retrieved successfully",
  "data": [
    {
      "_id": "64quiz123",
      "title": "JavaScript Fundamentals Quiz",
      "topic": "JavaScript",
      "difficulty": "beginner",
      "passingScore": 70,
      "attempts": 45,
      "averageScore": 78,
      "author": {
        "_id": "64user123",
        "name": "John Doe",
        "profilePicture": "..."
      },
      "lesson": {
        "_id": "64lesson123",
        "title": "JavaScript Basics",
        "topic": "JavaScript"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 4. Get Quiz by ID
Retrieve a specific quiz with all questions.

**Endpoint:** `GET /api/v1/quizzes/:id`  
**Auth Required:** No (but required for premium quizzes)

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "_id": "64quiz123",
    "title": "JavaScript Fundamentals Quiz",
    "description": "Test your knowledge...",
    "topic": "JavaScript",
    "difficulty": "beginner",
    "questions": [
      {
        "type": "mcq",
        "question": "What is the correct syntax...",
        "options": ["var x = 5;", "variable x = 5;", ...],
        "correctAnswer": "var x = 5;",
        "explanation": "In JavaScript, variables are declared...",
        "points": 1
      }
    ],
    "timeLimit": 15,
    "passingScore": 70,
    "attempts": 45,
    "averageScore": 78,
    "isPremium": false
  }
}
```

**Error (403) - Premium Quiz:**
```json
{
  "success": false,
  "message": "Premium subscription required"
}
```

---

### 5. Submit Quiz
Submit answers and get graded results.

**Endpoint:** `POST /api/v1/quizzes/submit`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "quizId": "64quiz123",
  "answers": [
    {
      "questionIndex": 0,
      "answer": "var x = 5;"
    },
    {
      "questionIndex": 1,
      "answer": "false"
    },
    {
      "questionIndex": 2,
      "answer": "push"
    }
  ],
  "timeTaken": 450
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "attempt": {
      "_id": "64attempt123",
      "user": "64user123",
      "quiz": "64quiz123",
      "score": 100,
      "passed": true,
      "earnedPoints": 3,
      "totalPoints": 3,
      "timeTaken": 450,
      "completedAt": "2024-01-15T10:30:00.000Z",
      "answers": [
        {
          "questionIndex": 0,
          "answer": "var x = 5;",
          "isCorrect": true,
          "points": 1
        },
        {
          "questionIndex": 1,
          "answer": "false",
          "isCorrect": true,
          "points": 1
        },
        {
          "questionIndex": 2,
          "answer": "push",
          "isCorrect": true,
          "points": 1
        }
      ]
    },
    "quiz": {
      "title": "JavaScript Fundamentals Quiz",
      "passingScore": 70
    },
    "results": {
      "score": 100,
      "passed": true,
      "earnedPoints": 3,
      "totalPoints": 3,
      "correctAnswers": 3,
      "totalQuestions": 3
    }
  }
}
```

---

### 6. Get My Quiz Attempts
Retrieve all quiz attempts by the current user.

**Endpoint:** `GET /api/v1/quizzes/attempts/me`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz attempts retrieved successfully",
  "data": [
    {
      "_id": "64attempt123",
      "quiz": {
        "_id": "64quiz123",
        "title": "JavaScript Fundamentals Quiz",
        "topic": "JavaScript",
        "difficulty": "beginner",
        "passingScore": 70
      },
      "score": 100,
      "passed": true,
      "earnedPoints": 3,
      "totalPoints": 3,
      "timeTaken": 450,
      "completedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 7. Get Attempt Details
Retrieve detailed results of a specific attempt including all answers.

**Endpoint:** `GET /api/v1/quizzes/attempt/:id`  
**Auth Required:** Yes (own attempts only)

**Response (200):**
```json
{
  "success": true,
  "message": "Attempt details retrieved successfully",
  "data": {
    "_id": "64attempt123",
    "user": "64user123",
    "quiz": {
      "_id": "64quiz123",
      "title": "JavaScript Fundamentals Quiz",
      "questions": [...]
    },
    "score": 100,
    "passed": true,
    "earnedPoints": 3,
    "totalPoints": 3,
    "timeTaken": 450,
    "answers": [
      {
        "questionIndex": 0,
        "answer": "var x = 5;",
        "isCorrect": true,
        "points": 1
      }
    ],
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Question Types

### 1. Multiple Choice (MCQ)
```json
{
  "type": "mcq",
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Explanation text",
  "points": 1
}
```

### 2. True/False
```json
{
  "type": "true-false",
  "question": "Statement to evaluate",
  "correctAnswer": "true",
  "explanation": "Explanation text",
  "points": 1
}
```

### 3. Fill in the Blank
```json
{
  "type": "fill-blank",
  "question": "Text with _____ to fill",
  "correctAnswer": "answer",
  "explanation": "Explanation text",
  "points": 1
}
```

---

## Scoring System

### Score Calculation
- **Points per question:** Defined in question object (default: 1)
- **Total points:** Sum of all question points
- **Earned points:** Points from correct answers
- **Score percentage:** `(earnedPoints / totalPoints) × 100`

### XP Rewards
- **XP per point:** 10 XP
- **Passing reward:** `earnedPoints × 10` XP
- **Failing:** No XP awarded

**Example:**
- Quiz with 5 questions (1 point each)
- User gets 4 correct
- Earned points: 4
- Score: 80%
- XP awarded: 40 XP

---

## Quiz Statistics

### Quiz-Level Stats
- **attempts:** Total number of attempts across all users
- **averageScore:** Average score of all attempts (0-100)

### User-Level Stats
Available through `/api/v1/quizzes/attempts/me` endpoint.

---

## Integration Guide

### Starting a Quiz
```javascript
// 1. Fetch quiz
const quiz = await fetch('/api/v1/quizzes/64quiz123');

// 2. Store start time
const startTime = Date.now();

// 3. Display questions to user
// User answers questions...

// 4. Calculate time taken
const timeTaken = Math.floor((Date.now() - startTime) / 1000);

// 5. Submit answers
const result = await fetch('/api/v1/quizzes/submit', {
  method: 'POST',
  body: JSON.stringify({
    quizId: '64quiz123',
    answers: userAnswers,
    timeTaken
  })
});
```

### Validating Quiz Access
```javascript
// Check if user has premium for premium quizzes
const quiz = await getQuiz(quizId);
if (quiz.isPremium && !currentUser.isPremium) {
  showPremiumUpgradeModal();
  return;
}

// Check time limit
if (quiz.timeLimit) {
  startTimer(quiz.timeLimit * 60); // Convert to seconds
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "field": "questions",
      "message": "Quiz must have between 1 and 50 questions"
    }
  ]
}
```

### 403 - Premium Required
```json
{
  "success": false,
  "message": "Premium subscription required"
}
```

### 404 - Quiz Not Found
```json
{
  "success": false,
  "message": "Quiz not found"
}
```

---

## Postman Setup

### Environment Variables
```
base_url=https://microlearnignbackend.vercel.app/
access_token={{your_jwt_token}}
quiz_id={{quiz_id}}
attempt_id={{attempt_id}}
```

### Collections Structure
```
Quiz APIs
├── Create Quiz (POST)
├── Generate AI Quiz (POST)
├── Get All Quizzes (GET)
├── Get Quiz by ID (GET)
├── Submit Quiz (POST)
├── Get My Attempts (GET)
└── Get Attempt Details (GET)
```

### Sample Test Scripts

**After Create Quiz:**
```javascript
pm.environment.set("quiz_id", pm.response.json().data._id);
```

**After Submit Quiz:**
```javascript
pm.environment.set("attempt_id", pm.response.json().data.attempt._id);
pm.test("Score is calculated", function() {
    pm.expect(pm.response.json().data.results.score).to.be.a('number');
});
```

---

## Best Practices

### Quiz Creation
- Use clear, unambiguous questions
- Provide detailed explanations for learning
- Balance difficulty levels
- Set reasonable time limits (1-2 min per question)
- Set passing score based on difficulty (60-70% standard)

### Answer Checking
- Case-insensitive for text answers
- Trim whitespace
- Support multiple correct answers for fill-blank
- Provide partial credit options (future feature)

### Performance
- Cache frequently accessed quizzes
- Lazy load quiz attempts
- Paginate large result sets
- Index quiz fields (topic, difficulty, lesson)

---

## Future Enhancements

### Planned Features
- ✅ Question shuffling
- ✅ Option shuffling
- ✅ Partial credit for multi-answer questions
- ✅ Image support in questions
- ✅ Code snippet questions
- ✅ Timed individual questions
- ✅ Hints system
- ✅ Quiz categories/tags
- ✅ Peer quiz creation
- ✅ Quiz analytics dashboard
