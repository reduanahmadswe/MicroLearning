# ⚔️ Multiplayer Quiz Battle API Documentation

## Overview
Multiplayer Quiz Battle হলো রিয়েল-টাইম কুইজ প্রতিযোগিতা যেখানে একাধিক প্লেয়ার একসাথে লড়াই করে। AI দিয়ে প্রশ্ন জেনারেট হয় এবং WebSocket-এ রিয়েল-টাইম আপডেট পাওয়া যায়।

## Features
- ✅ রিয়েল-টাইম মাল্টিপ্লেয়ার
- ✅ AI Question Generation
- ✅ 4 ব্যাটেল মোড (Duel, Multiplayer, Tournament, Battle Royale)
- ✅ লাইভ লিডারবোর্ড
- ✅ Coins/XP রিওয়ার্ড
- ✅ Entry Fee সিস্টেম
- ✅ Prize Pool ডিস্ট্রিবিউশন

---

## Battle Modes

### 1. Duel (1v1)
- **Players:** 2
- **Questions:** 10
- **Best for:** Quick battles

### 2. Multiplayer (2-10)
- **Players:** 2-10
- **Questions:** 15
- **Best for:** Small group competitions

### 3. Tournament (8-32)
- **Players:** 8-32
- **Questions:** 20
- **Best for:** Organized competitions

### 4. Battle Royale (50-100)
- **Players:** 50-100
- **Questions:** 25
- **Best for:** Large-scale competitions
- **Elimination:** Lowest scorers eliminated each round

---

## API Endpoints

### 1. Create Battle
নতুন কুইজ ব্যাটেল তৈরি করুন।

**Endpoint:** `POST /api/quiz-battles`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**
```json
{
  "title": "JavaScript Quiz Battle",
  "mode": "multiplayer",
  "maxPlayers": 10,
  "questionCount": 15,
  "timePerQuestion": 30,
  "difficulty": "medium",
  "category": "JavaScript",
  "entryFee": 50
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Quiz battle created successfully",
  "data": {
    "_id": "674d1a2b3c4d5e6f7a8b9c0d",
    "battleId": "BATTLE-1733060000-E5F6G7H8",
    "title": "JavaScript Quiz Battle",
    "mode": "multiplayer",
    "maxPlayers": 10,
    "currentPlayers": 1,
    "questionCount": 15,
    "timePerQuestion": 30,
    "difficulty": "medium",
    "category": "JavaScript",
    "entryFee": 50,
    "prizePool": 50,
    "status": "waiting",
    "participants": [
      {
        "user": "674a1b2c3d4e5f6a7b8c9d0e",
        "username": "Riduan",
        "isReady": true,
        "score": 0
      }
    ],
    "createdAt": "2025-12-01T16:00:00.000Z"
  }
}
```

**Field Descriptions:**
- `title` (required): ব্যাটেল টাইটেল
- `mode` (required): `duel` | `multiplayer` | `tournament` | `battle-royale`
- `maxPlayers` (optional): Max players (default: mode-based)
- `questionCount` (optional): প্রশ্ন সংখ্যা (default: 10)
- `timePerQuestion` (optional): প্রতি প্রশ্নে সময় (সেকেন্ড, default: 30)
- `difficulty` (optional): `easy` | `medium` | `hard` | `mixed`
- `category` (optional): Question category
- `entryFee` (optional): কয়েন এন্ট্রি ফি (default: 0)

---

### 2. Join Battle
ব্যাটেলে যোগ দিন।

**Endpoint:** `POST /api/quiz-battles/join`

**Request Body:**
```json
{
  "battleId": "BATTLE-1733060000-E5F6G7H8"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Joined battle successfully",
  "data": {
    "battleId": "BATTLE-1733060000-E5F6G7H8",
    "currentPlayers": 5,
    "maxPlayers": 10,
    "status": "waiting",
    "participants": [
      {
        "user": "674a1b2c3d4e5f6a7b8c9d0e",
        "username": "Riduan",
        "isReady": false
      }
    ]
  }
}
```

**Auto-Start:**
- যখন `currentPlayers === maxPlayers`, ব্যাটেল 5 সেকেন্ডে শুরু হবে
- Status: `waiting` → `starting` → `in-progress`

---

### 3. Submit Answer
প্রশ্নের উত্তর সাবমিট করুন।

**Endpoint:** `POST /api/quiz-battles/answer`

**Request Body:**
```json
{
  "battleId": "BATTLE-1733060000-E5F6G7H8",
  "questionIndex": 0,
  "answer": 2,
  "timeSpent": 15
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "isCorrect": true,
    "pointsEarned": 25,
    "correctAnswer": 2,
    "currentScore": 25,
    "rank": 2
  }
}
```

**Point Calculation:**
```javascript
// Base points (difficulty-based)
easy: 10 points
medium: 20 points
hard: 30 points

// Time bonus (faster = more bonus)
timeBonus = Math.floor((timeLimit - timeSpent) * 0.5)

// Total
totalPoints = basePoints + timeBonus
```

**Example:**
- Question difficulty: `medium` (20 points)
- Time limit: 30 seconds
- Time spent: 10 seconds
- Time bonus: `(30 - 10) * 0.5 = 10`
- **Total:** `20 + 10 = 30 points`

---

### 4. Start Battle
ব্যাটেল শুরু করুন (অটো অথবা ম্যানুয়াল)।

**Endpoint:** `PATCH /api/quiz-battles/:battleId/start`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Battle started successfully",
  "data": {
    "battleId": "BATTLE-1733060000-E5F6G7H8",
    "status": "in-progress",
    "startTime": "2025-12-01T16:05:00.000Z",
    "currentQuestion": 0
  }
}
```

---

### 5. End Battle
ব্যাটেল শেষ করুন এবং রেজাল্ট দেখুন।

**Endpoint:** `PATCH /api/quiz-battles/:battleId/end`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Battle ended successfully",
  "data": {
    "battleId": "BATTLE-1733060000-E5F6G7H8",
    "status": "finished",
    "endTime": "2025-12-01T16:15:00.000Z",
    "winner": "674a1b2c3d4e5f6a7b8c9d0e",
    "leaderboard": [
      {
        "user": "674a1b2c3d4e5f6a7b8c9d0e",
        "username": "Riduan",
        "score": 350,
        "correctAnswers": 14,
        "avgResponseTime": 18,
        "rank": 1
      },
      {
        "user": "674b2c3d4e5f6a7b8c9d0e1f",
        "username": "John",
        "score": 320,
        "correctAnswers": 13,
        "avgResponseTime": 22,
        "rank": 2
      }
    ],
    "prizes": {
      "1st": 350,
      "2nd": 100,
      "3rd": 50
    }
  }
}
```

**Prize Distribution:**
- **1st Place:** 70% of prize pool + 100 XP
- **2nd Place:** 20% of prize pool + 50 XP
- **3rd Place:** 10% of prize pool + 25 XP

---

### 6. Get Available Battles
যোগ দেওয়ার জন্য ব্যাটেল খুঁজুন।

**Endpoint:** `GET /api/quiz-battles/available?page=1&limit=20&mode=multiplayer`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Available battles retrieved successfully",
  "data": [
    {
      "battleId": "BATTLE-1733060000-E5F6G7H8",
      "title": "JavaScript Quiz Battle",
      "mode": "multiplayer",
      "currentPlayers": 5,
      "maxPlayers": 10,
      "difficulty": "medium",
      "entryFee": 50,
      "prizePool": 250,
      "status": "waiting",
      "createdAt": "2025-12-01T16:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 7. Get Battle by ID
নির্দিষ্ট ব্যাটেলের তথ্য দেখুন।

**Endpoint:** `GET /api/quiz-battles/:battleId`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Battle retrieved successfully",
  "data": {
    "battleId": "BATTLE-1733060000-E5F6G7H8",
    "title": "JavaScript Quiz Battle",
    "mode": "multiplayer",
    "status": "in-progress",
    "currentQuestion": 5,
    "participants": [
      {
        "user": "674a1b2c3d4e5f6a7b8c9d0e",
        "username": "Riduan",
        "score": 120,
        "rank": 1
      }
    ],
    "questions": [
      {
        "questionId": "Q1",
        "question": "What is closure in JavaScript?",
        "options": [
          "A function inside a function",
          "A way to close variables",
          "A function with access to outer scope",
          "None of the above"
        ],
        "timeLimit": 30,
        "points": 20
      }
    ]
  }
}
```

**Note:** `correctAnswer` শুধু ব্যাটেল শেষে দেখানো হবে

---

### 8. Get My Battles
আপনার সব ব্যাটেল দেখুন।

**Endpoint:** `GET /api/quiz-battles/my/battles?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User battles retrieved successfully",
  "data": [
    {
      "battleId": "BATTLE-1733060000-E5F6G7H8",
      "title": "JavaScript Quiz Battle",
      "mode": "multiplayer",
      "status": "finished",
      "myRank": 1,
      "myScore": 350,
      "prizeWon": 350,
      "createdAt": "2025-12-01T16:00:00.000Z"
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

## WebSocket Events (Real-time Updates)

### Frontend Setup
```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:5000', {
  auth: { token: accessToken }
});

// Join battle room
socket.emit('join-battle', { battleId: 'BATTLE-...' });

// Listen for events
socket.on('player-joined', (data) => {
  console.log(`${data.username} joined!`);
});

socket.on('battle-starting', (data) => {
  console.log(`Battle starting in ${data.countdown} seconds...`);
});

socket.on('question-changed', (data) => {
  console.log(`New question: ${data.question}`);
});

socket.on('leaderboard-update', (data) => {
  console.log('Updated leaderboard:', data.leaderboard);
});

socket.on('battle-ended', (data) => {
  console.log('Winner:', data.winner);
});

// Leave battle
socket.emit('leave-battle', { battleId: 'BATTLE-...' });
```

### Server Events
- `player-joined`: নতুন প্লেয়ার যোগ দিয়েছে
- `player-left`: প্লেয়ার চলে গেছে
- `battle-starting`: ব্যাটেল শুরু হচ্ছে (countdown)
- `battle-started`: ব্যাটেল শুরু হয়েছে
- `question-changed`: নতুন প্রশ্ন
- `answer-submitted`: কেউ উত্তর দিয়েছে
- `leaderboard-update`: লিডারবোর্ড আপডেট
- `player-eliminated`: কেউ এলিমিনেট হয়েছে (Battle Royale)
- `battle-ended`: ব্যাটেল শেষ

---

## AI Question Generation

প্রশ্ন OpenAI GPT-4o-mini দিয়ে জেনারেট হয়:

### Prompt Example
```
Generate 15 multiple choice quiz questions.
Difficulty: medium
Category: JavaScript

For each question, provide:
1. Question text
2. Four options (A, B, C, D)
3. Correct answer index (0-3)
4. Points based on difficulty

Format as JSON array.
```

### Generated Question Format
```json
{
  "question": "What is the output of console.log(typeof null)?",
  "options": [
    "null",
    "undefined",
    "object",
    "number"
  ],
  "correctAnswer": 2,
  "category": "JavaScript",
  "difficulty": "medium",
  "points": 20
}
```

---

## Complete Battle Flow

### 1. Create & Join Phase
```typescript
// Player 1: Create battle
const { data: battle } = await createBattle({
  title: "JS Battle",
  mode: "multiplayer",
  maxPlayers: 5,
  entryFee: 50
});

// Players 2-5: Join battle
await joinBattle({ battleId: battle.battleId });
```

### 2. Waiting Phase
- Players waiting for others to join
- Show current players count
- When full → Auto-start countdown (5 seconds)

### 3. Battle Phase
```typescript
// For each question
for (let i = 0; i < questionCount; i++) {
  // Show question
  const question = battle.questions[i];
  
  // Start timer
  const startTime = Date.now();
  
  // User selects answer
  const answer = await getUserAnswer();
  
  // Calculate time spent
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  
  // Submit answer
  const result = await submitAnswer({
    battleId: battle.battleId,
    questionIndex: i,
    answer,
    timeSpent
  });
  
  // Show result
  showResult(result);
  
  // Next question after 3 seconds
  await sleep(3000);
}
```

### 4. Results Phase
```typescript
// End battle
const { data: results } = await endBattle(battleId);

// Show leaderboard
showLeaderboard(results.leaderboard);

// Show prizes
if (results.prizes) {
  showPrizes(results.prizes);
}
```

---

## Battle Royale Elimination Logic

```javascript
// Every 5 questions, eliminate bottom 20%
if (questionIndex % 5 === 0 && questionIndex > 0) {
  const sortedPlayers = participants.sort((a, b) => b.score - a.score);
  const eliminationCount = Math.ceil(sortedPlayers.length * 0.2);
  
  // Eliminate bottom players
  const eliminatedPlayers = sortedPlayers.slice(-eliminationCount);
  
  eliminatedPlayers.forEach(player => {
    player.isEliminated = true;
    socket.to(battleId).emit('player-eliminated', {
      username: player.username,
      rank: player.rank
    });
  });
}
```

---

## Rate Limits
- **Max 10 active battles** per user
- **Max 1 answer per question** per user
- **Max 3 battle creates** per hour

---

## Error Handling

### Insufficient Coins
```json
{
  "success": false,
  "message": "Insufficient coins",
  "errorMessages": [
    {
      "path": "entryFee",
      "message": "You need 50 coins to join this battle"
    }
  ]
}
```

### Battle Full
```json
{
  "success": false,
  "message": "Battle is full",
  "errorMessages": [
    {
      "path": "battleId",
      "message": "This battle has reached maximum players"
    }
  ]
}
```

### Already Answered
```json
{
  "success": false,
  "message": "Already answered this question",
  "errorMessages": [
    {
      "path": "questionIndex",
      "message": "You have already answered question 5"
    }
  ]
}
```

---

## Best Practices

1. **Connection Stability**
   - WebSocket reconnection logic
   - Offline answer queue
   - Auto-rejoin on disconnect

2. **Performance**
   - Preload questions
   - Cache leaderboard updates
   - Debounce UI updates

3. **Fair Play**
   - Server-side validation
   - Timestamp verification
   - Anti-cheat measures

---

## Future Enhancements
- 🔜 Team battles (2v2, 3v3)
- 🔜 Custom question sets
- 🔜 Video questions
- 🔜 Voice chat
- 🔜 Spectator mode
- 🔜 Tournament brackets
- 🔜 Seasonal leaderboards
- 🔜 Battle replays
