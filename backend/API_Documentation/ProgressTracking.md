# Progress Tracking API Documentation

## Base URL
```
https://microlearning-backend-reduan.onrender.com/api/v1/progress
```

---

## Endpoints

### 1. Update Progress

**POST** `/update`

Update or create progress for a lesson.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "lessonId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "progress": 75,
  "timeSpent": 180,
  "status": "in-progress",
  "score": 85,
  "mastery": 80
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lessonId | string | Yes | ID of the lesson |
| progress | number | Yes | Progress percentage (0-100) |
| timeSpent | number | Yes | Time spent in seconds |
| status | string | No | not-started, in-progress, or completed |
| score | number | No | Quiz score (0-100) |
| mastery | number | No | Understanding level (0-100) |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "_id": "progress123",
    "user": "user123",
    "lesson": "65f1a2b3c4d5e6f7g8h9i0j1",
    "status": "in-progress",
    "progress": 75,
    "timeSpent": 180,
    "lastAccessed": "2024-01-15T10:30:00.000Z",
    "mastery": 80,
    "attempts": 2,
    "score": 85
  }
}
```

---

### 2. Get My Progress

**GET** `/me`

Get all progress records for the authenticated user.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters
- `page` (number, optional): Default 1
- `limit` (number, optional): Default 20

#### Success Response (200)
```json
{
  "success": true,
  "message": "User progress retrieved successfully",
  "data": [
    {
      "_id": "progress123",
      "lesson": {
        "_id": "lesson123",
        "title": "JavaScript Variables",
        "topic": "JavaScript",
        "estimatedTime": 5,
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "difficulty": "beginner"
      },
      "status": "completed",
      "progress": 100,
      "timeSpent": 300,
      "lastAccessed": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T10:35:00.000Z",
      "mastery": 90,
      "score": 95
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 3. Get User Statistics

**GET** `/stats`

Get comprehensive statistics for the authenticated user.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalLessonsStarted": 50,
    "totalLessonsCompleted": 35,
    "totalTimeSpent": 1250,
    "averageMastery": 82,
    "currentStreak": 7,
    "longestStreak": 15,
    "xpEarned": 1750,
    "level": 18
  }
}
```

#### Statistics Explained
- **totalLessonsStarted**: Total lessons user has begun
- **totalLessonsCompleted**: Lessons completed (100% progress)
- **totalTimeSpent**: Total learning time in minutes
- **averageMastery**: Average understanding level across all lessons
- **currentStreak**: Current consecutive days of learning
- **longestStreak**: Longest streak ever achieved
- **xpEarned**: Total experience points
- **level**: Current user level (100 XP per level)

---

### 4. Get Learning Timeline

**GET** `/timeline`

Get recent learning activity timeline.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters
- `days` (number, optional): Default 30 (last 30 days)

#### Success Response (200)
```json
{
  "success": true,
  "message": "Learning timeline retrieved successfully",
  "data": [
    {
      "_id": "progress123",
      "lesson": {
        "_id": "lesson123",
        "title": "JavaScript Variables",
        "topic": "JavaScript"
      },
      "status": "completed",
      "progress": 100,
      "timeSpent": 300,
      "lastAccessed": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T10:35:00.000Z"
    },
    {
      "_id": "progress124",
      "lesson": {
        "_id": "lesson124",
        "title": "React Hooks",
        "topic": "React"
      },
      "status": "in-progress",
      "progress": 60,
      "timeSpent": 240,
      "lastAccessed": "2024-01-14T15:20:00.000Z"
    }
  ]
}
```

---

### 5. Get Lesson Progress

**GET** `/lesson/:lessonId`

Get progress for a specific lesson.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Lesson progress retrieved successfully",
  "data": {
    "_id": "progress123",
    "user": "user123",
    "lesson": {
      "_id": "lesson123",
      "title": "JavaScript Variables",
      "topic": "JavaScript",
      "estimatedTime": 5
    },
    "status": "in-progress",
    "progress": 75,
    "timeSpent": 180,
    "lastAccessed": "2024-01-15T10:30:00.000Z",
    "mastery": 80,
    "attempts": 2,
    "score": 85
  }
}
```

#### Response when no progress exists (200)
```json
{
  "success": true,
  "message": "Lesson progress retrieved successfully",
  "data": null
}
```

---

## Gamification Features

### XP Rewards
- **Lesson Completion**: 50 XP

### Streak System
- Consecutive days of learning activity
- Streak continues if you learn at least once per day
- Streak breaks if you skip a day
- Longest streak is always tracked

### Level Calculation
```
Level = floor(Total XP / 100) + 1

Example:
- 0-99 XP = Level 1
- 100-199 XP = Level 2
- 1700-1799 XP = Level 18
```

---

## Progress Status

| Status | Description |
|--------|-------------|
| not-started | Lesson never accessed |
| in-progress | Lesson started but not completed (< 100% progress) |
| completed | Lesson finished (100% progress) |

---

## Automatic Updates

### When Progress is Updated
1. **Time Spent**: Accumulated across all attempts
2. **Progress**: Takes maximum value (never decreases)
3. **Score**: Takes highest score achieved
4. **Mastery**: Takes highest mastery level
5. **Attempts**: Incremented each time
6. **Last Accessed**: Updated to current time

### When Lesson is Completed
1. **Status**: Auto-set to "completed"
2. **Completed At**: Timestamp recorded
3. **XP Awarded**: 50 XP added to user
4. **Level Updated**: If enough XP for level-up
5. **Streak Updated**: Daily streak incremented

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - No token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "path": "progress",
      "message": "Progress must be between 0 and 100"
    }
  ]
}
```

---

## Postman Examples

### Update Progress
```
POST {{baseUrl}}/progress/update
Headers:
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
Body:
{
  "lessonId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "progress": 100,
  "timeSpent": 300,
  "status": "completed",
  "score": 95,
  "mastery": 90
}
```

### Get My Progress
```
GET {{baseUrl}}/progress/me?page=1&limit=20
Headers:
  Authorization: Bearer {{accessToken}}
```

### Get Statistics
```
GET {{baseUrl}}/progress/stats
Headers:
  Authorization: Bearer {{accessToken}}
```

### Get Timeline
```
GET {{baseUrl}}/progress/timeline?days=7
Headers:
  Authorization: Bearer {{accessToken}}
```

### Get Lesson Progress
```
GET {{baseUrl}}/progress/lesson/65f1a2b3c4d5e6f7g8h9i0j1
Headers:
  Authorization: Bearer {{accessToken}}
```

---

## Integration Tips

### Starting a Lesson
```javascript
// When user starts a lesson
POST /progress/update
{
  "lessonId": "lesson123",
  "progress": 0,
  "timeSpent": 0,
  "status": "not-started"
}
```

### During Lesson (Periodic Updates)
```javascript
// Every 30 seconds or on significant progress
POST /progress/update
{
  "lessonId": "lesson123",
  "progress": 45,
  "timeSpent": 120
}
```

### Completing a Lesson
```javascript
// When user finishes
POST /progress/update
{
  "lessonId": "lesson123",
  "progress": 100,
  "timeSpent": 300,
  "status": "completed",
  "mastery": 85
}
```

### With Quiz Score
```javascript
// After quiz completion
POST /progress/update
{
  "lessonId": "lesson123",
  "progress": 100,
  "timeSpent": 300,
  "status": "completed",
  "score": 90,
  "mastery": 88
}
```

---

## Notes

- All endpoints require authentication
- Progress is automatically created if it doesn't exist
- Progress values never decrease (always takes maximum)
- Streak is calculated based on daily activity
- XP and levels are updated automatically
- Time spent is cumulative across all attempts
- Mastery represents understanding level (can be based on quiz performance)
