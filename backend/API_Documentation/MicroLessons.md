# Micro-Lessons API Documentation

## Base URL
```
http://localhost:5000/api/v1/lessons
```

---

## Endpoints

### 1. Create Lesson

**POST** `/create`

Create a new micro-lesson.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Introduction to JavaScript Variables",
  "description": "Learn about different types of variables in JavaScript",
  "content": "# JavaScript Variables\n\n## var, let, and const\n\nIn JavaScript, we have three ways to declare variables...",
  "topic": "JavaScript",
  "tags": ["javascript", "programming", "variables"],
  "difficulty": "beginner",
  "estimatedTime": 5,
  "keyPoints": [
    "Understand var, let, and const",
    "Learn variable scope",
    "Best practices for naming variables"
  ],
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "isPremium": false
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Introduction to JavaScript Variables",
    "description": "Learn about different types of variables in JavaScript",
    "topic": "JavaScript",
    "difficulty": "beginner",
    "estimatedTime": 5,
    "slug": "introduction-to-javascript-variables-abc123",
    "author": {
      "_id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "views": 0,
    "likes": 0,
    "completions": 0,
    "isPublished": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Generate AI Lesson

**POST** `/generate`

Generate a micro-lesson using AI based on topic and preferences.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "estimatedTime": 3,
  "preferences": {
    "includeExamples": true,
    "includeQuiz": false,
    "learningStyle": "visual"
  }
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "AI lesson generated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "title": "Introduction to React Hooks",
    "description": "A 3-minute micro-lesson on React Hooks",
    "content": "# React Hooks\n\nThis is an AI-generated lesson...",
    "topic": "React Hooks",
    "difficulty": "intermediate",
    "estimatedTime": 3,
    "aiGenerated": true,
    "keyPoints": [
      "Understanding React Hooks",
      "Key principles and concepts",
      "Practical applications"
    ],
    "aiSummary": "Quick overview of React Hooks fundamentals"
  }
}
```

---

### 3. Get All Lessons

**GET** `/`

Retrieve lessons with filters and pagination.

#### Query Parameters
- `topic` (string, optional): Filter by topic
- `difficulty` (string, optional): beginner | intermediate | advanced
- `duration` (string, optional): "1-5" or "5-10" (minutes)
- `tags` (string, optional): Comma-separated tags
- `isPremium` (string, optional): "true" or "false"
- `search` (string, optional): Search in title/description/content
- `page` (number, optional): Default 1
- `limit` (number, optional): Default 10

#### Example Request
```
GET /api/v1/lessons?topic=JavaScript&difficulty=beginner&page=1&limit=10
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Introduction to JavaScript Variables",
      "description": "Learn about different types of variables",
      "topic": "JavaScript",
      "difficulty": "beginner",
      "estimatedTime": 5,
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "views": 150,
      "likes": 25,
      "completions": 80
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 4. Get Lesson by ID or Slug

**GET** `/:id`

Get detailed information about a specific lesson.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson retrieved successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Introduction to JavaScript Variables",
    "description": "Learn about different types of variables in JavaScript",
    "content": "# Full lesson content here...",
    "topic": "JavaScript",
    "tags": ["javascript", "programming"],
    "difficulty": "beginner",
    "estimatedTime": 5,
    "keyPoints": ["Point 1", "Point 2"],
    "author": {
      "_id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "JavaScript instructor"
    },
    "views": 151,
    "likes": 25,
    "completions": 80
  }
}
```

---

### 5. Update Lesson

**PUT** `/:id`

Update an existing lesson (author only).

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Updated Title",
  "isPublished": true
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Updated Title",
    "isPublished": true
  }
}
```

---

### 6. Delete Lesson

**DELETE** `/:id`

Delete a lesson (author or admin only).

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

---

### 7. Like Lesson

**POST** `/:id/like`

Like a lesson.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson liked successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "likes": 26
  }
}
```

---

### 8. Complete Lesson

**POST** `/:id/complete`

Mark a lesson as completed.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson marked as completed",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "completions": 81
  }
}
```

---

### 9. Get Trending Lessons

**GET** `/trending`

Get trending lessons based on views, likes, and completions.

#### Query Parameters
- `limit` (number, optional): Default 10

#### Success Response (200)
```json
{
  "success": true,
  "message": "Trending lessons retrieved successfully",
  "data": [
    {
      "_id": "lesson1",
      "title": "Most Popular Lesson",
      "topic": "JavaScript",
      "views": 1000,
      "likes": 200
    }
  ]
}
```

---

### 10. Get Recommended Lessons

**GET** `/recommendations/me`

Get personalized lesson recommendations.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters
- `limit` (number, optional): Default 10

#### Success Response (200)
```json
{
  "success": true,
  "message": "Recommended lessons retrieved successfully",
  "data": [
    {
      "_id": "lesson1",
      "title": "Recommended Lesson",
      "topic": "React",
      "difficulty": "beginner"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "path": "title",
      "message": "Title must be at least 3 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to update this lesson"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Lesson not found"
}
```

---

## Postman Collection

### Environment Variables
```
baseUrl: http://localhost:5000/api/v1
accessToken: (auto-populated after login)
```

### Example: Create Lesson
```
POST {{baseUrl}}/lessons/create
Headers:
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
Body:
{
  "title": "Python Basics",
  "description": "Learn Python fundamentals",
  "content": "# Python Basics\n\nLesson content...",
  "topic": "Python",
  "difficulty": "beginner",
  "estimatedTime": 5
}
```

### Example: Generate AI Lesson
```
POST {{baseUrl}}/lessons/generate
Headers:
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
Body:
{
  "topic": "Machine Learning Basics",
  "difficulty": "beginner",
  "estimatedTime": 3
}
```

### Example: Get Filtered Lessons
```
GET {{baseUrl}}/lessons?topic=JavaScript&difficulty=beginner&page=1&limit=5
```

### Example: Get Trending
```
GET {{baseUrl}}/lessons/trending?limit=10
```

---

## Notes

- All lessons are visible to public (GET endpoints)
- Creating/updating/deleting requires authentication
- AI lesson generation is a placeholder (integrate with OpenAI/Claude later)
- Premium lessons require premium subscription to access
- Slug is auto-generated from title for SEO-friendly URLs
- Text search is enabled on title, description, content, and tags
