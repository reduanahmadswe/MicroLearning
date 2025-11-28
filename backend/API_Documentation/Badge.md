# Badge & Achievement API Documentation

## Overview
The Badge & Achievement system gamifies learning by rewarding users for reaching milestones. Badges are earned based on various criteria including streaks, lesson completions, quiz scores, XP milestones, and flashcard mastery.

## Base URL
```
/api/v1/badges
```

---

## Badge Rarity System

### Rarity Levels
- **Common** (gray): Easy to earn, frequent milestones
- **Rare** (blue): Moderate difficulty, regular engagement required
- **Epic** (purple): Challenging, significant commitment
- **Legendary** (gold): Extremely difficult, elite achievements

---

## Default Badges

### Streak Badges 🔥
| Badge | Description | Criteria | Rarity | XP Reward |
|-------|-------------|----------|--------|-----------|
| Week Warrior | 7-day streak | 7 days | Common | 50 |
| Month Master | 30-day streak | 30 days | Rare | 200 |
| Century Scholar | 100-day streak | 100 days | Legendary | 1000 |

### Lesson Completion Badges 📚
| Badge | Description | Criteria | Rarity | XP Reward |
|-------|-------------|----------|--------|-----------|
| First Steps | First lesson | 1 lesson | Common | 10 |
| Knowledge Seeker | 50 lessons | 50 lessons | Rare | 100 |
| Learning Legend | 200 lessons | 200 lessons | Epic | 500 |

### Quiz Perfection Badges 🎯
| Badge | Description | Criteria | Rarity | XP Reward |
|-------|-------------|----------|--------|-----------|
| Quiz Novice | First perfect score | 1 × 100% | Common | 25 |
| Quiz Master | 10 perfect scores | 10 × 100% | Rare | 150 |
| Perfect Scholar | 50 perfect scores | 50 × 100% | Legendary | 800 |

### XP Milestone Badges ⭐
| Badge | Description | Criteria | Rarity | XP Reward |
|-------|-------------|----------|--------|-----------|
| Rising Star | 1,000 XP | 1,000 XP | Common | 100 |
| XP Enthusiast | 10,000 XP | 10,000 XP | Epic | 500 |
| XP Legend | 50,000 XP | 50,000 XP | Legendary | 2000 |

### Flashcard Mastery Badges 🧩
| Badge | Description | Criteria | Rarity | XP Reward |
|-------|-------------|----------|--------|-----------|
| Memory Maker | Master 10 cards | 10 mastered | Common | 50 |
| Recall Champion | Master 100 cards | 100 mastered | Epic | 300 |

---

## Endpoints

### 1. Get All Badges
Retrieve all available badges.

**Endpoint:** `GET /api/v1/badges`  
**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "message": "Badges retrieved successfully",
  "data": [
    {
      "_id": "64badge123",
      "name": "Week Warrior",
      "description": "Maintain a 7-day learning streak",
      "icon": "🔥",
      "criteria": {
        "type": "streak",
        "threshold": 7
      },
      "rarity": "common",
      "xpReward": 50,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "64badge124",
      "name": "Quiz Master",
      "description": "Score 100% on 10 quizzes",
      "icon": "🧠",
      "criteria": {
        "type": "quiz_perfect",
        "threshold": 10
      },
      "rarity": "rare",
      "xpReward": 150,
      "isActive": true
    }
  ]
}
```

---

### 2. Get Badge by ID
Retrieve details of a specific badge.

**Endpoint:** `GET /api/v1/badges/:id`  
**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "message": "Badge retrieved successfully",
  "data": {
    "_id": "64badge123",
    "name": "Week Warrior",
    "description": "Maintain a 7-day learning streak",
    "icon": "🔥",
    "criteria": {
      "type": "streak",
      "threshold": 7
    },
    "rarity": "common",
    "xpReward": 50,
    "isActive": true
  }
}
```

---

### 3. Get My Achievements
Retrieve all achievements (earned and in-progress) for the current user.

**Endpoint:** `GET /api/v1/badges/achievements/me`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Achievements retrieved successfully",
  "data": [
    {
      "_id": "64achievement123",
      "user": "64user123",
      "badge": {
        "_id": "64badge123",
        "name": "Week Warrior",
        "description": "Maintain a 7-day learning streak",
        "icon": "🔥",
        "rarity": "common",
        "xpReward": 50
      },
      "progress": 7,
      "isCompleted": true,
      "earnedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-08T10:00:00.000Z"
    },
    {
      "_id": "64achievement124",
      "badge": {
        "_id": "64badge124",
        "name": "Month Master",
        "description": "Maintain a 30-day learning streak",
        "icon": "🏆",
        "rarity": "rare",
        "xpReward": 200
      },
      "progress": 12,
      "isCompleted": false,
      "createdAt": "2024-01-08T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Get Earned Badges
Retrieve only the badges the user has earned.

**Endpoint:** `GET /api/v1/badges/earned/me`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Earned badges retrieved successfully",
  "data": [
    {
      "_id": "64achievement123",
      "badge": {
        "_id": "64badge123",
        "name": "Week Warrior",
        "description": "Maintain a 7-day learning streak",
        "icon": "🔥",
        "rarity": "common",
        "xpReward": 50
      },
      "progress": 7,
      "isCompleted": true,
      "earnedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 5. Check and Award Badges
Manually trigger badge checking and award any newly earned badges.

**Endpoint:** `POST /api/v1/badges/check`  
**Auth Required:** Yes

**Response (200) - New Badges:**
```json
{
  "success": true,
  "message": "New badges earned!",
  "data": [
    {
      "_id": "64badge125",
      "name": "Knowledge Seeker",
      "description": "Complete 50 lessons",
      "icon": "📚",
      "rarity": "rare",
      "xpReward": 100
    }
  ]
}
```

**Response (200) - No New Badges:**
```json
{
  "success": true,
  "message": "No new badges earned",
  "data": []
}
```

---

### 6. Get Achievement Statistics
Get summary statistics about user's achievement progress.

**Endpoint:** `GET /api/v1/badges/stats/me`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Achievement statistics retrieved successfully",
  "data": {
    "totalBadges": 15,
    "earnedBadges": 5,
    "inProgressBadges": 7,
    "completionPercentage": 33
  }
}
```

---

### 7. Create Badge (Admin Only)
Create a new badge.

**Endpoint:** `POST /api/v1/badges/create`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Python Expert",
  "description": "Complete all Python lessons with mastery level above 90",
  "icon": "🐍",
  "criteria": {
    "type": "topic_mastered",
    "threshold": 1,
    "topic": "Python"
  },
  "rarity": "epic",
  "xpReward": 300
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Badge created successfully",
  "data": {
    "_id": "64badge999",
    "name": "Python Expert",
    "description": "Complete all Python lessons...",
    "icon": "🐍",
    "criteria": {
      "type": "topic_mastered",
      "threshold": 1,
      "topic": "Python"
    },
    "rarity": "epic",
    "xpReward": 300,
    "isActive": true
  }
}
```

---

### 8. Initialize Default Badges (Admin Only)
Create all default badges in the system.

**Endpoint:** `POST /api/v1/badges/initialize`  
**Auth Required:** Yes (Admin)

**Response (201):**
```json
{
  "success": true,
  "message": "Default badges initialized successfully",
  "data": [
    // Array of created badges
  ]
}
```

---

## Badge Criteria Types

### 1. Streak
```json
{
  "type": "streak",
  "threshold": 7
}
```
Tracks consecutive days of learning activity.

### 2. Lessons Completed
```json
{
  "type": "lessons_completed",
  "threshold": 50
}
```
Counts total lessons completed with `status: "completed"`.

### 3. Quiz Perfect
```json
{
  "type": "quiz_perfect",
  "threshold": 10
}
```
Counts quiz attempts with 100% score.

### 4. XP Milestone
```json
{
  "type": "xp_milestone",
  "threshold": 1000
}
```
Checks total XP earned by user.

### 5. Flashcard Mastered
```json
{
  "type": "flashcard_mastered",
  "threshold": 10
}
```
Counts flashcards with ≥5 repetitions and ease factor ≥2.5.

### 6. Topic Mastered
```json
{
  "type": "topic_mastered",
  "threshold": 1,
  "topic": "JavaScript"
}
```
Complex criteria for mastering a specific topic (lessons + quizzes + mastery).

---

## Automatic Badge Awarding

### When Badges Are Checked
Badges are automatically checked and awarded in these scenarios:

1. **After lesson completion** (updateProgress service)
2. **After quiz submission** (submitQuiz service)
3. **After flashcard review** (reviewFlashcard service)
4. **Manual trigger** (`POST /api/v1/badges/check`)

### Integration Example
```javascript
// In progress.service.ts - after lesson completion
if (status === 'completed') {
  // Award XP and update streak
  await this.awardXP(userId, 50);
  await this.updateStreak(userId);
  
  // Check for new badges
  await badgeService.checkAndAwardBadges(userId);
}
```

---

## User Profile Badge Display

### Show Earned Badges
```javascript
const earnedBadges = await fetch('/api/v1/badges/earned/me');

// Display top 3 badges
earnedBadges.data.slice(0, 3).forEach(achievement => {
  const badge = achievement.badge;
  displayBadge(badge.icon, badge.name, badge.rarity);
});
```

### Show Progress
```javascript
const achievements = await fetch('/api/v1/badges/achievements/me');

achievements.data.forEach(achievement => {
  const { badge, progress, isCompleted } = achievement;
  const percentage = (progress / badge.criteria.threshold) * 100;
  
  if (!isCompleted) {
    showProgressBar(badge.name, percentage);
  }
});
```

---

## UI/UX Recommendations

### Badge Card
```
┌──────────────────────────┐
│       🔥                 │
│   Week Warrior           │
│   ────────────           │
│   7-day streak           │
│   ⭐ Common              │
│   +50 XP                 │
│   ────────────           │
│   Progress: 5/7          │
│   [██████░░] 71%         │
└──────────────────────────┘
```

### Notification on Earning
```
╔════════════════════════╗
║  🎉 Badge Earned! 🎉   ║
║                        ║
║        🔥              ║
║    Week Warrior        ║
║                        ║
║   +50 XP Awarded       ║
╚════════════════════════╝
```

### Achievement Page Layout
- **Header:** Total badges earned (5/15) with progress bar
- **Earned Section:** Grid of earned badges with dates
- **In Progress:** Cards showing progress bars
- **Locked:** Grayed out badges with criteria

---

## Rarity Colors

```css
.badge-common { color: #808080; border-color: #808080; }
.badge-rare { color: #0080ff; border-color: #0080ff; }
.badge-epic { color: #9b30ff; border-color: #9b30ff; }
.badge-legendary { color: #ffd700; border-color: #ffd700; }
```

---

## Gamification Tips

### Motivational Design
1. **Show Next Badge:** Display closest badge to earning
2. **Progress Notifications:** "You're 2 lessons away from Knowledge Seeker!"
3. **Celebration:** Animated badge reveal on earning
4. **Leaderboard Integration:** Show badge counts on leaderboard
5. **Profile Showcase:** Let users pick 3 "featured" badges

### Engagement Strategies
1. **Daily Check-In:** Remind users about streak badges
2. **Goal Setting:** "Set a goal to earn 3 badges this week"
3. **Social Sharing:** Allow sharing badge achievements
4. **Badge Collection:** Show "badge collection" percentage
5. **Limited Time Badges:** Seasonal or event-based badges

---

## Error Responses

### 404 - Badge Not Found
```json
{
  "success": false,
  "message": "Badge not found"
}
```

### 403 - Admin Only
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

## Postman Setup

### Environment Variables
```
base_url=http://localhost:5000
access_token={{your_jwt_token}}
admin_token={{admin_jwt_token}}
badge_id={{badge_id}}
```

### Collections Structure
```
Badge APIs
├── Get All Badges (GET)
├── Get Badge by ID (GET)
├── Get My Achievements (GET)
├── Get Earned Badges (GET)
├── Check and Award Badges (POST)
├── Get Achievement Stats (GET)
├── Create Badge - Admin (POST)
└── Initialize Default Badges - Admin (POST)
```

### Sample Test Scripts

**After Check Badges:**
```javascript
const newBadges = pm.response.json().data;
pm.test("Returns array", function() {
    pm.expect(newBadges).to.be.an('array');
});
if (newBadges.length > 0) {
    pm.environment.set("badge_id", newBadges[0]._id);
}
```

---

## Future Enhancements

### Planned Features
- ✅ Badge categories (Learning, Social, Competitive)
- ✅ Hidden/secret badges (surprise achievements)
- ✅ Badge levels (Bronze, Silver, Gold versions)
- ✅ Seasonal badges (Holiday, Event-specific)
- ✅ Community badges (Help others, share resources)
- ✅ Badge trading/gifting system
- ✅ Badge-based unlocks (Premium features)
- ✅ Composite badges (Requires multiple badges)
- ✅ Badge expiration (Maintain status)
- ✅ Badge rarity evolution (Upgrade badges)
