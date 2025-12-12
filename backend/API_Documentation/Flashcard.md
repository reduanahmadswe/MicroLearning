# Flashcard API Documentation

## Overview
The Flashcard module implements a Spaced Repetition System (SRS) using the SM-2 algorithm for optimal learning retention. Users can create flashcards, generate them from lessons using AI, and review them based on scientifically-proven spaced repetition intervals.

## Base URL
```
/api/v1/flashcards
```

---

## What is Spaced Repetition (SM-2)?

### SM-2 Algorithm
The SM-2 (SuperMemo 2) algorithm is a scientifically-proven method for optimizing learning through spaced repetition. Key features:

- **Ease Factor:** Measures how easy a card is to remember (1.3 to 2.5+)
- **Interval:** Days until next review
- **Repetitions:** Number of consecutive successful reviews

### Quality Ratings (0-5)
- **0:** Complete blackout - no recall
- **1:** Incorrect response, correct one remembered
- **2:** Incorrect response, correct one seemed easy to recall
- **3:** Correct response recalled with serious difficulty
- **4:** Correct response after some hesitation
- **5:** Perfect response

### How It Works
1. **First review:** After 1 day
2. **Second review:** After 6 days
3. **Subsequent reviews:** Interval multiplied by ease factor
4. **Failed card:** Reset to 1-day interval

---

## Endpoints

### 1. Create Flashcard
Create a new flashcard manually.

**Endpoint:** `POST /api/v1/flashcards/create`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "front": "What is closure in JavaScript?",
  "back": "A closure is a function that has access to its outer function scope even after the outer function has returned. It allows a function to access variables from an enclosing scope.",
  "hint": "Think about function scope and lexical environment",
  "topic": "JavaScript",
  "lesson": "64lesson123",
  "isPublic": false,
  "frontImage": "https://example.com/image.jpg",
  "backImage": "https://example.com/answer-diagram.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Flashcard created successfully",
  "data": {
    "_id": "64flashcard123",
    "front": "What is closure in JavaScript?",
    "back": "A closure is a function that has access...",
    "hint": "Think about function scope...",
    "topic": "JavaScript",
    "lesson": "64lesson123",
    "user": "64user123",
    "easeFactor": 2.5,
    "interval": 0,
    "repetitions": 0,
    "nextReviewDate": "2024-01-15T10:00:00.000Z",
    "isPublic": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Generate Flashcards from Lesson
Generate flashcards using AI based on lesson content.

**Endpoint:** `POST /api/v1/flashcards/generate`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "lessonId": "64lesson123",
  "count": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Flashcards generated successfully",
  "data": [
    {
      "_id": "64flashcard1",
      "front": "Question 1 about JavaScript?",
      "back": "Answer 1 explaining the concept...",
      "hint": "Think about JavaScript",
      "topic": "JavaScript",
      "lesson": "64lesson123",
      "user": "64user123",
      "easeFactor": 2.5,
      "interval": 0,
      "repetitions": 0,
      "nextReviewDate": "2024-01-15T10:00:00.000Z"
    }
    // ... more flashcards
  ]
}
```

**Note:** AI generation currently uses a template. OpenAI/Claude integration is planned.

---

### 3. Get My Flashcards
Retrieve all flashcards for the current user with filters.

**Endpoint:** `GET /api/v1/flashcards/me`  
**Auth Required:** Yes

**Query Parameters:**
- `topic` (string) - Filter by topic (case-insensitive regex)
- `lesson` (string) - Filter by lesson ID
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Results per page

**Examples:**
```
GET /api/v1/flashcards/me?topic=javascript
GET /api/v1/flashcards/me?lesson=64lesson123&page=1&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "message": "Flashcards retrieved successfully",
  "data": [
    {
      "_id": "64flashcard123",
      "front": "What is closure in JavaScript?",
      "back": "A closure is a function...",
      "hint": "Think about function scope",
      "topic": "JavaScript",
      "lesson": {
        "_id": "64lesson123",
        "title": "JavaScript Functions",
        "topic": "JavaScript"
      },
      "easeFactor": 2.5,
      "interval": 6,
      "repetitions": 2,
      "nextReviewDate": "2024-01-21T10:00:00.000Z",
      "lastReviewedAt": "2024-01-15T10:00:00.000Z"
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

### 4. Get Due Flashcards
Retrieve flashcards that are due for review.

**Endpoint:** `GET /api/v1/flashcards/due`  
**Auth Required:** Yes

**Query Parameters:**
- `limit` (number, default: 20) - Maximum cards to retrieve

**Example:**
```
GET /api/v1/flashcards/due?limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Due flashcards retrieved successfully",
  "data": [
    {
      "_id": "64flashcard123",
      "front": "What is closure in JavaScript?",
      "back": "A closure is a function...",
      "hint": "Think about function scope",
      "topic": "JavaScript",
      "easeFactor": 2.5,
      "interval": 1,
      "repetitions": 1,
      "nextReviewDate": "2024-01-14T10:00:00.000Z",
      "lastReviewedAt": "2024-01-13T10:00:00.000Z"
    }
  ]
}
```

---

### 5. Review Flashcard
Submit a review for a flashcard with quality rating.

**Endpoint:** `POST /api/v1/flashcards/review`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "flashcardId": "64flashcard123",
  "quality": 5
}
```

**Quality Ratings:**
- **0:** Complete blackout
- **1:** Incorrect, correct answer remembered
- **2:** Incorrect, seemed easy to recall
- **3:** Correct with serious difficulty
- **4:** Correct after hesitation
- **5:** Perfect response

**Response (200):**
```json
{
  "success": true,
  "message": "Flashcard reviewed successfully",
  "data": {
    "flashcard": {
      "_id": "64flashcard123",
      "front": "What is closure in JavaScript?",
      "back": "A closure is a function...",
      "easeFactor": 2.6,
      "interval": 15,
      "repetitions": 3,
      "nextReviewDate": "2024-01-30T10:00:00.000Z",
      "lastReviewedAt": "2024-01-15T10:00:00.000Z"
    },
    "srsResult": {
      "easeFactor": 2.6,
      "interval": 15,
      "repetitions": 3,
      "nextReviewDate": "2024-01-30T10:00:00.000Z"
    }
  }
}
```

---

### 6. Get Flashcard Statistics
Get statistics about user's flashcard learning.

**Endpoint:** `GET /api/v1/flashcards/stats`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Flashcard statistics retrieved successfully",
  "data": {
    "total": 150,
    "dueCount": 12,
    "masteredCount": 45,
    "averageEaseFactor": 2.68
  }
}
```

**Field Definitions:**
- **total:** Total number of flashcards
- **dueCount:** Cards due for review now
- **masteredCount:** Cards with 5+ repetitions and ease factor ≥ 2.5
- **averageEaseFactor:** Average ease across all cards (higher = easier)

---

### 7. Delete Flashcard
Delete a flashcard.

**Endpoint:** `DELETE /api/v1/flashcards/:id`  
**Auth Required:** Yes (own flashcards only)

**Response (200):**
```json
{
  "success": true,
  "message": "Flashcard deleted successfully"
}
```

---

## SM-2 Algorithm Details

### Ease Factor Calculation
```
newEF = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
Minimum EF = 1.3
```

### Interval Calculation
```
If quality < 3 (failed):
  interval = 1
  repetitions = 0

If quality >= 3 (passed):
  If repetitions = 0:
    interval = 1
  Else if repetitions = 1:
    interval = 6
  Else:
    interval = oldInterval * easeFactor
  repetitions += 1
```

### Example Progression (Perfect Reviews - Quality 5)

| Review | Repetitions | Interval | Ease Factor | Next Review |
|--------|-------------|----------|-------------|-------------|
| 1      | 1           | 1 day    | 2.5         | Day 1       |
| 2      | 2           | 6 days   | 2.6         | Day 7       |
| 3      | 3           | 16 days  | 2.7         | Day 23      |
| 4      | 4           | 43 days  | 2.8         | Day 66      |

---

## XP Rewards

### Review XP
- **Quality 0:** 0 XP
- **Quality 1:** 1 XP
- **Quality 2:** 2 XP
- **Quality 3:** 3 XP
- **Quality 4:** 4 XP
- **Quality 5:** 5 XP

Users earn XP based on the quality of their review, encouraging honest self-assessment.

---

## Integration Guide

### Daily Review Workflow
```javascript
// 1. Fetch due flashcards
const dueCards = await fetch('/api/v1/flashcards/due?limit=20');

// 2. Present card to user (show front only)
displayCardFront(dueCards.data[0].front);

// 3. User tries to recall answer
// 4. Show back of card
displayCardBack(dueCards.data[0].back);

// 5. User rates their recall quality (0-5)
const quality = getUserQualityRating(); // 0-5

// 6. Submit review
await fetch('/api/v1/flashcards/review', {
  method: 'POST',
  body: JSON.stringify({
    flashcardId: dueCards.data[0]._id,
    quality: quality
  })
});

// 7. Repeat for remaining cards
```

### Creating Study Session
```javascript
// Get statistics
const stats = await fetch('/api/v1/flashcards/stats');
console.log(`You have ${stats.data.dueCount} cards to review today`);

// Get due cards
const sessionCards = await fetch(`/api/v1/flashcards/due?limit=${stats.data.dueCount}`);

// Start review session
sessionCards.data.forEach(card => {
  // Present card and collect quality rating
  reviewCard(card);
});
```

---

## Best Practices

### For Users
1. **Be Honest:** Rate quality honestly for optimal scheduling
2. **Review Daily:** Check for due cards daily
3. **Don't Procrastinate:** Overdue cards pile up quickly
4. **Use Hints Wisely:** Try to recall without hints first
5. **Quality 3+:** Aim to recall correctly even if difficult

### For Developers
1. **Preload Due Count:** Show due count on dashboard
2. **Session Limits:** Default to 20-30 cards per session
3. **Progress Tracking:** Show session progress (5/20 cards)
4. **Keyboard Shortcuts:** 1-5 for quick quality rating
5. **Mobile Friendly:** Swipe gestures for rating

---

## Mastery Indicators

### Flashcard States
- **New:** Never reviewed (repetitions = 0)
- **Learning:** Being reviewed (repetitions 1-4)
- **Mastered:** Confident recall (repetitions ≥ 5, EF ≥ 2.5)
- **Difficult:** Frequent mistakes (EF < 2.0)

### Visual Indicators
- 🆕 New (gray)
- 📚 Learning (blue)
- ✅ Mastered (green)
- ⚠️ Difficult (red)

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "field": "quality",
      "message": "Quality must be between 0 and 5"
    }
  ]
}
```

### 404 - Flashcard Not Found
```json
{
  "success": false,
  "message": "Flashcard not found"
}
```

---

## Postman Setup

### Environment Variables
```
base_url=http://localhost:5000/
access_token={{your_jwt_token}}
flashcard_id={{flashcard_id}}
lesson_id={{lesson_id}}
```

### Collections Structure
```
Flashcard APIs
├── Create Flashcard (POST)
├── Generate Flashcards (POST)
├── Get My Flashcards (GET)
├── Get Due Flashcards (GET)
├── Review Flashcard (POST)
├── Get Statistics (GET)
└── Delete Flashcard (DELETE)
```

### Sample Test Scripts

**After Create Flashcard:**
```javascript
pm.environment.set("flashcard_id", pm.response.json().data._id);
pm.test("Initial ease factor is 2.5", function() {
    pm.expect(pm.response.json().data.easeFactor).to.equal(2.5);
});
```

**After Review:**
```javascript
pm.test("Interval increased", function() {
    const interval = pm.response.json().data.srsResult.interval;
    pm.expect(interval).to.be.above(0);
});
```

---

## Future Enhancements

### Planned Features
- ✅ AI-powered flashcard generation from lessons
- ✅ Image occlusion (hide parts of images)
- ✅ Audio pronunciation for language learning
- ✅ Shared flashcard decks
- ✅ Import/export (Anki format)
- ✅ Cloze deletion cards
- ✅ Reverse cards (back → front)
- ✅ Study streaks and milestones
- ✅ Collaborative decks
- ✅ Custom SRS parameters
