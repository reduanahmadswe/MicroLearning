# Bookmark API Documentation

## Overview
The Bookmark module allows users to save lessons for later review, organize them into collections/folders, and add personal notes. Bookmarks help users curate their own learning library.

## Base URL
```
/api/v1/bookmarks
```

---

## Endpoints

### 1. Add Bookmark
Save a lesson to bookmarks with optional collection and notes.

**Endpoint:** `POST /api/v1/bookmarks/add`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "lessonId": "64lesson123",
  "collection": "JavaScript Fundamentals",
  "notes": "Important for interview prep - review closure section"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bookmark added successfully",
  "data": {
    "_id": "64bookmark123",
    "user": "64user123",
    "lesson": {
      "_id": "64lesson123",
      "title": "Understanding JavaScript Closures",
      "topic": "JavaScript",
      "difficulty": "intermediate",
      "duration": 15,
      "isPremium": false
    },
    "collection": "JavaScript Fundamentals",
    "notes": "Important for interview prep - review closure section",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error (400) - Already Bookmarked:**
```json
{
  "success": false,
  "message": "Lesson already bookmarked"
}
```

**Error (404) - Lesson Not Found:**
```json
{
  "success": false,
  "message": "Lesson not found"
}
```

---

### 2. Remove Bookmark
Remove a lesson from bookmarks.

**Endpoint:** `DELETE /api/v1/bookmarks/remove/:lessonId`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

---

### 3. Get My Bookmarks
Retrieve all bookmarks for the current user with optional filters.

**Endpoint:** `GET /api/v1/bookmarks/me`  
**Auth Required:** Yes

**Query Parameters:**
- `collection` (string) - Filter by collection name
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Results per page

**Examples:**
```
GET /api/v1/bookmarks/me
GET /api/v1/bookmarks/me?collection=Python Basics
GET /api/v1/bookmarks/me?page=1&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmarks retrieved successfully",
  "data": [
    {
      "_id": "64bookmark123",
      "user": "64user123",
      "lesson": {
        "_id": "64lesson123",
        "title": "Understanding JavaScript Closures",
        "topic": "JavaScript",
        "difficulty": "intermediate",
        "duration": 15,
        "isPremium": false,
        "slug": "understanding-javascript-closures",
        "thumbnail": "https://example.com/thumb.jpg"
      },
      "collection": "JavaScript Fundamentals",
      "notes": "Important for interview prep",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "64bookmark124",
      "lesson": {
        "_id": "64lesson124",
        "title": "Async/Await in JavaScript",
        "topic": "JavaScript",
        "difficulty": "advanced",
        "duration": 20,
        "isPremium": true
      },
      "collection": "JavaScript Fundamentals",
      "notes": "Study before next project",
      "createdAt": "2024-01-14T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 35,
    "totalPages": 2
  }
}
```

---

### 4. Get Bookmark by Lesson
Check if a specific lesson is bookmarked and retrieve bookmark details.

**Endpoint:** `GET /api/v1/bookmarks/lesson/:lessonId`  
**Auth Required:** Yes

**Response (200) - Bookmarked:**
```json
{
  "success": true,
  "message": "Bookmark found",
  "data": {
    "_id": "64bookmark123",
    "user": "64user123",
    "lesson": {
      "_id": "64lesson123",
      "title": "Understanding JavaScript Closures",
      "topic": "JavaScript",
      "difficulty": "intermediate",
      "duration": 15,
      "isPremium": false
    },
    "collection": "JavaScript Fundamentals",
    "notes": "Important for interview prep",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (200) - Not Bookmarked:**
```json
{
  "success": true,
  "message": "Lesson not bookmarked",
  "data": null
}
```

---

### 5. Check if Lesson is Bookmarked
Quick check to see if a lesson is bookmarked (boolean response).

**Endpoint:** `GET /api/v1/bookmarks/check/:lessonId`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmark status retrieved",
  "data": {
    "isBookmarked": true
  }
}
```

---

### 6. Update Bookmark
Update collection or notes for an existing bookmark.

**Endpoint:** `PUT /api/v1/bookmarks/update/:lessonId`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "collection": "Advanced JavaScript",
  "notes": "Updated notes - focus on practical examples"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmark updated successfully",
  "data": {
    "_id": "64bookmark123",
    "user": "64user123",
    "lesson": {
      "_id": "64lesson123",
      "title": "Understanding JavaScript Closures",
      "topic": "JavaScript",
      "difficulty": "intermediate",
      "duration": 15,
      "isPremium": false
    },
    "collection": "Advanced JavaScript",
    "notes": "Updated notes - focus on practical examples",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T14:30:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

---

### 7. Get Collections
Retrieve all collections with bookmark counts.

**Endpoint:** `GET /api/v1/bookmarks/collections`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Collections retrieved successfully",
  "data": [
    {
      "name": "Advanced JavaScript",
      "count": 8
    },
    {
      "name": "Default",
      "count": 12
    },
    {
      "name": "Interview Prep",
      "count": 15
    },
    {
      "name": "Python Basics",
      "count": 5
    }
  ]
}
```

---

### 8. Get Bookmark Statistics
Get summary statistics about user's bookmarks.

**Endpoint:** `GET /api/v1/bookmarks/stats`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmark statistics retrieved successfully",
  "data": {
    "totalBookmarks": 40,
    "collectionsCount": 4
  }
}
```

---

## Features

### Collections/Folders
- **Default Collection:** Bookmarks without a specified collection go to "Default"
- **Custom Collections:** Users can create unlimited collections
- **Organization:** Filter bookmarks by collection for easy access
- **Rename:** Update collection name for existing bookmarks

### Personal Notes
- **Max Length:** 1000 characters
- **Rich Content:** Store reminders, key points, questions
- **Editable:** Update notes anytime
- **Private:** Notes are only visible to the bookmark owner

### Duplicate Prevention
- **Unique Constraint:** Users cannot bookmark the same lesson twice
- **Compound Index:** Efficient queries on user-lesson pairs

---

## Integration Guide

### Adding Bookmark from Lesson Page
```javascript
// 1. Check if already bookmarked
const check = await fetch(`/api/v1/bookmarks/check/${lessonId}`);
const { isBookmarked } = check.data;

// 2. Show appropriate button (Bookmark / Bookmarked)
if (!isBookmarked) {
  // Show "Add Bookmark" button
  document.getElementById('bookmark-btn').onclick = async () => {
    await fetch('/api/v1/bookmarks/add', {
      method: 'POST',
      body: JSON.stringify({
        lessonId: lessonId,
        collection: selectedCollection,
        notes: userNotes
      })
    });
    // Update UI to show bookmarked state
  };
} else {
  // Show "Remove Bookmark" button
  document.getElementById('bookmark-btn').onclick = async () => {
    await fetch(`/api/v1/bookmarks/remove/${lessonId}`, {
      method: 'DELETE'
    });
    // Update UI to show unbookmarked state
  };
}
```

### Displaying Bookmarks Page
```javascript
// 1. Get collections for sidebar
const collections = await fetch('/api/v1/bookmarks/collections');
renderCollectionList(collections.data);

// 2. Get bookmarks (all or filtered)
const bookmarks = await fetch(`/api/v1/bookmarks/me?collection=${selectedCollection}`);
renderBookmarkGrid(bookmarks.data);

// 3. Show statistics
const stats = await fetch('/api/v1/bookmarks/stats');
displayStats(stats.data);
```

### Organizing with Collections
```javascript
// Create modal for collection selection
function selectCollection(lessonId, currentCollection) {
  const collections = await fetch('/api/v1/bookmarks/collections');
  
  // Show modal with collection list + "New Collection" option
  const selected = await showCollectionModal(collections.data);
  
  // Update bookmark
  await fetch(`/api/v1/bookmarks/update/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify({
      collection: selected
    })
  });
}
```

---

## Use Cases

### 1. Save for Later
Users can bookmark lessons they want to study later.

### 2. Create Learning Paths
Organize bookmarks into collections like "Week 1", "Month 1 Goals", etc.

### 3. Interview Preparation
Create collection "Interview Prep" with important lessons.

### 4. Topic-Based Organization
Collections like "JavaScript", "Python", "Data Structures".

### 5. Review Reminders
Add notes like "Review on Friday" or "Difficult - practice more".

---

## Best Practices

### For Users
1. **Organize Regularly:** Move bookmarks to appropriate collections
2. **Add Context:** Use notes to remember why you bookmarked
3. **Review Weekly:** Check bookmarks and complete old ones
4. **Clean Up:** Remove completed bookmarks periodically
5. **Be Specific:** Use descriptive collection names

### For Developers
1. **Show Bookmark Count:** Display badge on bookmark icon
2. **Quick Actions:** One-click bookmark/unbookmark
3. **Drag & Drop:** Allow dragging bookmarks between collections
4. **Search:** Add search within bookmarks
5. **Export:** Allow exporting bookmark list

---

## UI/UX Recommendations

### Bookmark Button States
```
⭐ Not Bookmarked (Outline star)
⭐ Bookmarked (Filled star)
⭐ Loading (Animated)
```

### Collection Organization
```
📁 Collection 1 (12)
📁 Collection 2 (8)
📁 Default (5)
```

### Bookmark Card
```
┌─────────────────────────────┐
│ [Thumbnail]                 │
│ Lesson Title                │
│ Topic • Difficulty • Time   │
│ 📁 Collection Name          │
│ "My notes here..."          │
│ [Remove] [Edit Notes]       │
└─────────────────────────────┘
```

---

## Error Responses

### 400 - Already Bookmarked
```json
{
  "success": false,
  "message": "Lesson already bookmarked"
}
```

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "field": "notes",
      "message": "Notes cannot exceed 1000 characters"
    }
  ]
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

---

## Postman Setup

### Environment Variables
```
base_url=http://localhost:5000
access_token={{your_jwt_token}}
lesson_id={{lesson_id}}
bookmark_id={{bookmark_id}}
collection_name={{collection_name}}
```

### Collections Structure
```
Bookmark APIs
├── Add Bookmark (POST)
├── Remove Bookmark (DELETE)
├── Get My Bookmarks (GET)
├── Get Bookmark by Lesson (GET)
├── Check Bookmark Status (GET)
├── Update Bookmark (PUT)
├── Get Collections (GET)
└── Get Statistics (GET)
```

### Sample Test Scripts

**After Add Bookmark:**
```javascript
pm.environment.set("bookmark_id", pm.response.json().data._id);
pm.test("Bookmark created with default collection", function() {
    const collection = pm.response.json().data.collection;
    pm.expect(collection).to.be.a('string');
});
```

**Check Bookmark Status:**
```javascript
pm.test("Bookmark status is boolean", function() {
    pm.expect(pm.response.json().data.isBookmarked).to.be.a('boolean');
});
```

---

## Future Enhancements

### Planned Features
- ✅ Shared collections (collaborative bookmarks)
- ✅ Tags system (multiple tags per bookmark)
- ✅ Smart collections (auto-organize by topic/difficulty)
- ✅ Bookmark import/export
- ✅ Reminders (notify to review bookmarked lessons)
- ✅ Bulk operations (move multiple bookmarks)
- ✅ Collection templates
- ✅ Nested collections (sub-folders)
- ✅ Bookmark analytics (most bookmarked lessons)
- ✅ Public collections (share with community)
