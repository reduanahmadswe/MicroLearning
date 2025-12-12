# Leaderboard API Documentation

## Overview
The Leaderboard module provides competitive rankings for users based on XP, lessons completed, and topic expertise. It supports global leaderboards, topic-specific rankings, and personalized position tracking.

## Base URL
```
/api/v1/leaderboard
```

---

## Leaderboard Types

### 1. Global Leaderboard
Ranks all users by total XP earned across all activities.

### 2. Topic-Based Leaderboard
Ranks users by lessons completed in a specific topic (e.g., JavaScript, Python).

### 3. Timeframe-Based (Future)
- Daily: Top performers today
- Weekly: Top performers this week
- Monthly: Top performers this month
- All-Time: Overall rankings

---

## Endpoints

### 1. Get Global Leaderboard
Retrieve global rankings based on XP.

**Endpoint:** `GET /api/v1/leaderboard/global`  
**Auth Required:** No

**Query Parameters:**
- `timeframe` (string, default: 'all-time') - daily, weekly, monthly, all-time
- `limit` (number, default: 50) - Number of results (max: 100)

**Examples:**
```
GET /api/v1/leaderboard/global
GET /api/v1/leaderboard/global?limit=10
GET /api/v1/leaderboard/global?timeframe=weekly&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Global leaderboard retrieved successfully",
  "data": [
    {
      "userId": "64user123",
      "name": "John Doe",
      "profilePicture": "https://example.com/avatar.jpg",
      "xp": 15420,
      "level": 154,
      "streak": 45,
      "lessonsCompleted": 287,
      "rank": 1
    },
    {
      "userId": "64user124",
      "name": "Jane Smith",
      "profilePicture": "https://example.com/avatar2.jpg",
      "xp": 14850,
      "level": 148,
      "streak": 32,
      "lessonsCompleted": 265,
      "rank": 2
    },
    {
      "userId": "64user125",
      "name": "Bob Wilson",
      "xp": 13200,
      "level": 132,
      "streak": 28,
      "lessonsCompleted": 198,
      "rank": 3
    }
  ]
}
```

---

### 2. Get Topic Leaderboard
Retrieve rankings for a specific topic based on lessons completed.

**Endpoint:** `GET /api/v1/leaderboard/topic/:topic`  
**Auth Required:** No

**Path Parameters:**
- `topic` (string, required) - Topic name (e.g., JavaScript, Python)

**Query Parameters:**
- `limit` (number, default: 50) - Number of results

**Examples:**
```
GET /api/v1/leaderboard/topic/JavaScript
GET /api/v1/leaderboard/topic/Python?limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "JavaScript leaderboard retrieved successfully",
  "data": [
    {
      "userId": "64user456",
      "name": "Sarah Johnson",
      "profilePicture": "https://example.com/sarah.jpg",
      "xp": 8500,
      "level": 85,
      "streak": 15,
      "lessonsCompleted": 45,
      "rank": 1
    },
    {
      "userId": "64user457",
      "name": "Mike Brown",
      "xp": 7200,
      "level": 72,
      "streak": 22,
      "lessonsCompleted": 42,
      "rank": 2
    }
  ]
}
```

---

### 3. Get My Rank
Get the current user's rank in global or topic leaderboard.

**Endpoint:** `GET /api/v1/leaderboard/rank/me`  
**Auth Required:** Yes

**Query Parameters:**
- `type` (string, default: 'global') - global or topic
- `topic` (string) - Required if type=topic

**Examples:**
```
GET /api/v1/leaderboard/rank/me
GET /api/v1/leaderboard/rank/me?type=global
GET /api/v1/leaderboard/rank/me?type=topic&topic=JavaScript
```

**Response (200) - Global:**
```json
{
  "success": true,
  "message": "User rank retrieved successfully",
  "data": {
    "rank": 42,
    "xp": 5420,
    "level": 54
  }
}
```

**Response (200) - Topic:**
```json
{
  "success": true,
  "message": "User rank retrieved successfully",
  "data": {
    "rank": 15,
    "lessonsCompleted": 28,
    "topic": "JavaScript"
  }
}
```

---

### 4. Get My Position with Surrounding Players
Get user's position along with players ranked above and below.

**Endpoint:** `GET /api/v1/leaderboard/position/me`  
**Auth Required:** Yes

**Query Parameters:**
- `type` (string, default: 'global') - global or topic
- `topic` (string) - Required if type=topic

**Examples:**
```
GET /api/v1/leaderboard/position/me
GET /api/v1/leaderboard/position/me?type=topic&topic=Python
```

**Response (200):**
```json
{
  "success": true,
  "message": "User position retrieved successfully",
  "data": {
    "userRank": {
      "rank": 42,
      "xp": 5420,
      "level": 54
    },
    "surroundingPlayers": [
      {
        "userId": "64user789",
        "name": "Player Above 5",
        "xp": 5850,
        "level": 58,
        "rank": 37
      },
      // ... 4 more above
      {
        "userId": "64currentUser",
        "name": "Current User",
        "xp": 5420,
        "level": 54,
        "rank": 42
      },
      // ... 5 below
    ],
    "totalPlayers": 1250
  }
}
```

---

## Ranking Criteria

### Global Leaderboard
**Primary Sort:** Total XP (highest first)  
**Secondary Sort:** Level (highest first)

### Topic Leaderboard
**Primary Sort:** Lessons completed in topic (most first)  
**Secondary Sort:** Average mastery level (highest first)

---

## Use Cases

### 1. Competitive Motivation
Display leaderboard to motivate users to learn more and earn XP.

### 2. Topic Expertise
Show who's leading in specific topics (JavaScript experts, Python masters).

### 3. Personal Progress
Show user their rank and how close they are to the next position.

### 4. Social Features
See friends' positions, compete with peers.

---

## Integration Guide

### Displaying Global Leaderboard
```javascript
// Fetch top 10 global leaders
const leaderboard = await fetch('/api/v1/leaderboard/global?limit=10');

leaderboard.data.forEach((entry, index) => {
  const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
  displayLeaderEntry(medal, entry.rank, entry.name, entry.xp, entry.level);
});
```

### Showing User's Rank
```javascript
// Get user's rank
const rank = await fetch('/api/v1/leaderboard/rank/me');

// Display on dashboard
displayUserRank(rank.data.rank, rank.data.xp);

// Show motivation
if (rank.data.rank <= 10) {
  showMessage("You're in the Top 10! 🏆");
} else if (rank.data.rank <= 100) {
  showMessage("You're in the Top 100! ⭐");
}
```

### Topic Leaderboard Widget
```javascript
// Show JavaScript topic leaders
const jsLeaders = await fetch('/api/v1/leaderboard/topic/JavaScript?limit=5');

// Display in widget
renderTopicLeaders('JavaScript', jsLeaders.data);
```

### Position with Context
```javascript
// Show user's position with surrounding players
const position = await fetch('/api/v1/leaderboard/position/me');

// Highlight current user
position.data.surroundingPlayers.forEach(player => {
  const isCurrent = player.userId === currentUserId;
  renderPlayerRow(player, isCurrent);
});

// Show rank and total
displayRankInfo(position.data.userRank.rank, position.data.totalPlayers);
// "You're ranked #42 out of 1,250 learners"
```

---

## UI/UX Recommendations

### Leaderboard Layout
```
┌────────────────────────────────────┐
│  🏆 Global Leaderboard             │
├────┬────────────────────┬──────────┤
│ 🥇 │ John Doe       Lvl 154 │ 15,420 XP │
│ 🥈 │ Jane Smith     Lvl 148 │ 14,850 XP │
│ 🥉 │ Bob Wilson     Lvl 132 │ 13,200 XP │
│ 4  │ Sarah Johnson  Lvl 125 │ 12,500 XP │
│ 5  │ Mike Brown     Lvl 118 │ 11,800 XP │
└────┴────────────────────┴──────────┘
```

### User Position Card
```
┌────────────────────────────────────┐
│  Your Rank: #42 / 1,250            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  5,420 XP • Level 54 • 15-day 🔥  │
│                                    │
│  📈 +120 XP away from #41          │
└────────────────────────────────────┘
```

### Topic Selector
```
[All Topics ▾] [Global] [Friends]

Topics:
• JavaScript (42 lessons completed)
• Python (28 lessons completed)
• React (15 lessons completed)
```

---

## Performance Optimization

### Caching Strategy (Recommended)
```javascript
// Use Redis for caching
// Cache global leaderboard for 5 minutes
// Cache topic leaderboards for 10 minutes
// Invalidate cache on any XP/progress update

// Example with Redis:
const cacheKey = 'leaderboard:global:50';
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

const leaderboard = await calculateLeaderboard();
await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));
```

### Pagination
- Default: 50 entries
- Max: 100 entries
- Use limit parameter for smaller chunks

### Database Indexes
```javascript
// Ensure these indexes exist:
User: { xp: -1 }
User: { isActive: 1, xp: -1 }
UserProgress: { user: 1, status: 1 }
UserProgress: { lesson: 1, status: 1 }
```

---

## Gamification Features

### Rank Badges
- **Top 10:** Elite badge, special profile border
- **Top 100:** Featured badge
- **Top 1000:** Rising star badge

### Achievements
- **First Time Top 10:** "Elite Learner" badge
- **Maintain Top 10 for 30 days:** "Consistent Champion"
- **#1 Rank:** "Champion" badge (temporary)

### Notifications
- **Rank Up:** "You moved up to #42! 🎉"
- **Overtaken:** "You've overtaken 3 learners today!"
- **Close Competition:** "You're only 50 XP behind #40!"

---

## Social Features (Future)

### Friends Leaderboard
```json
{
  "type": "friends",
  "data": [
    // Only show user's friends
  ]
}
```

### Challenge System
```json
{
  "challenge": {
    "challenger": "User A",
    "opponent": "User B",
    "metric": "xp",
    "duration": "7 days",
    "prize": "500 coins"
  }
}
```

---

## Error Responses

### 400 - Invalid Type
```json
{
  "success": false,
  "message": "Invalid leaderboard type or missing topic"
}
```

### 404 - User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Postman Setup

### Environment Variables
```
base_url=https://microlearning-backend-reduan.onrender.com/
access_token={{your_jwt_token}}
topic={{topic_name}}
```

### Collections Structure
```
Leaderboard APIs
├── Get Global Leaderboard (GET)
├── Get Topic Leaderboard (GET)
├── Get My Rank (GET)
└── Get My Position (GET)
```

### Sample Test Scripts

**After Get Leaderboard:**
```javascript
pm.test("Leaderboard is array", function() {
    pm.expect(pm.response.json().data).to.be.an('array');
});
pm.test("Ranks are sequential", function() {
    const data = pm.response.json().data;
    data.forEach((entry, i) => {
        pm.expect(entry.rank).to.equal(i + 1);
    });
});
```

---

## Analytics Integration

### Track Leaderboard Views
```javascript
analytics.track('Leaderboard Viewed', {
  type: 'global',
  limit: 50,
  userRank: 42
});
```

### Track Rank Changes
```javascript
analytics.track('Rank Changed', {
  previousRank: 45,
  newRank: 42,
  change: +3
});
```

---

## Future Enhancements

### Planned Features
- ✅ Real-time leaderboard updates (WebSocket)
- ✅ Friends-only leaderboard
- ✅ Timeframe filters (daily, weekly, monthly)
- ✅ Regional leaderboards (by country/city)
- ✅ Team/Group leaderboards
- ✅ Specialized leaderboards (Quiz scores, Flashcard mastery)
- ✅ Historical rank tracking (rank graph over time)
- ✅ Leaderboard export (PDF/CSV)
- ✅ Custom leaderboard rules (Admin configurable)
- ✅ Seasonal leaderboards (Reset periodically)

---

## Best Practices

### For Developers
1. **Cache Aggressively:** Leaderboards don't need real-time accuracy
2. **Limit Results:** Prevent database overload with reasonable limits
3. **Optimize Queries:** Use aggregation pipelines and indexes
4. **Background Jobs:** Update leaderboard rankings in background
5. **Rate Limiting:** Prevent abuse with API rate limits

### For UX Design
1. **Highlight User:** Always highlight current user's position
2. **Show Progress:** Display XP needed to rank up
3. **Celebrate Wins:** Animate rank improvements
4. **Provide Context:** Show percentile (Top 5%, Top 10%)
5. **Multiple Views:** Let users switch between global/topic/friends
