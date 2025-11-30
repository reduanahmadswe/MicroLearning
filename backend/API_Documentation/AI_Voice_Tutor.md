# 🎙️ AI Voice Tutor API Documentation

## Overview
AI Voice Tutor হলো একটি রিয়েল-টাইম ভয়েস-বেসড টিউটরিং সিস্টেম যেখানে স্টুডেন্টরা এআই এর সাথে কথা বলে শিখতে পারবে। এটি OpenAI Whisper (Speech-to-Text) এবং TTS (Text-to-Speech) ব্যবহার করে।

## Features
- ✅ রিয়েল-টাইম ভয়েস কনভার্সেশন
- ✅ মাল্টি-ল্যাঙ্গুয়েজ সাপোর্ট (বাংলা, ইংরেজি, হিন্দি)
- ✅ কাস্টম ভয়েস সিলেকশন (পুরুষ/মহিলা/শিশু)
- ✅ কনভার্সেশন হিস্টোরি ট্র্যাকিং
- ✅ টপিক-বেসড লার্নিং সেশন
- ✅ ইমোশনাল স্টেট ট্র্যাকিং
- ✅ XP রিওয়ার্ড সিস্টেম

---

## API Endpoints

### 1. Create Voice Session
নতুন ভয়েস টিউটরিং সেশন তৈরি করুন।

**Endpoint:** `POST /api/voice-tutor/sessions`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**
```json
{
  "topic": "JavaScript Arrays",
  "language": "en",
  "voiceType": "female"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Voice session created successfully",
  "data": {
    "_id": "674b2c1a3f8e4d2b5c6a7e89",
    "user": "674a1b2c3d4e5f6a7b8c9d0e",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "startTime": "2025-11-30T10:00:00.000Z",
    "topic": "JavaScript Arrays",
    "language": "en",
    "voiceType": "female",
    "conversationHistory": [],
    "emotionalState": "neutral",
    "status": "active",
    "createdAt": "2025-11-30T10:00:00.000Z",
    "updatedAt": "2025-11-30T10:00:00.000Z"
  }
}
```

**Field Descriptions:**
- `topic` (optional): লার্নিং টপিক
- `language` (optional): `bn` | `en` | `hi` (default: `en`)
- `voiceType` (optional): `male` | `female` | `child` (default: `female`)

---

### 2. Send Voice Message
ভয়েস মেসেজ পাঠান এবং এআই রেসপন্স পান।

**Endpoint:** `POST /api/voice-tutor/message`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body (Audio):**
```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audioData": "base64_encoded_audio_data"
}
```

**Request Body (Text):**
```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "text": "What is array map function?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Voice message processed successfully",
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "text": "The map() function creates a new array by calling a function on every element in the original array. For example, if you have [1, 2, 3] and you map each number to double itself, you get [2, 4, 6].",
    "audioUrl": "data:audio/mpeg;base64,//uQx...",
    "suggestions": [
      "Can you explain that in simpler terms?",
      "Can you give me an example?",
      "What should I learn next?"
    ]
  }
}
```

**Field Descriptions:**
- `sessionId` (required): সেশন আইডি
- `audioData` (optional): Base64 এনকোডেড অডিও ডাটা
- `text` (optional): টেক্সট মেসেজ (audioData অথবা text যেকোনো একটি থাকতে হবে)

---

### 3. End Voice Session
ভয়েস সেশন শেষ করুন এবং XP পান।

**Endpoint:** `PATCH /api/voice-tutor/sessions/:sessionId/end`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Voice session ended successfully",
  "data": {
    "_id": "674b2c1a3f8e4d2b5c6a7e89",
    "user": "674a1b2c3d4e5f6a7b8c9d0e",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "startTime": "2025-11-30T10:00:00.000Z",
    "endTime": "2025-11-30T10:15:30.000Z",
    "duration": 930,
    "topic": "JavaScript Arrays",
    "conversationHistory": [...],
    "status": "completed",
    "createdAt": "2025-11-30T10:00:00.000Z",
    "updatedAt": "2025-11-30T10:15:30.000Z"
  }
}
```

**XP Calculation:**
- প্রতি সেকেন্ড = 1 XP
- ম্যাক্সিমাম = 50 XP প্রতি সেশন

---

### 4. Get Session History
নির্দিষ্ট সেশনের কনভার্সেশন হিস্টোরি দেখুন।

**Endpoint:** `GET /api/voice-tutor/sessions/:sessionId`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Session history retrieved successfully",
  "data": {
    "_id": "674b2c1a3f8e4d2b5c6a7e89",
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "topic": "JavaScript Arrays",
    "conversationHistory": [
      {
        "role": "user",
        "content": "What is array map function?",
        "timestamp": "2025-11-30T10:01:00.000Z",
        "transcript": "What is array map function?"
      },
      {
        "role": "assistant",
        "content": "The map() function creates a new array...",
        "timestamp": "2025-11-30T10:01:05.000Z",
        "audioUrl": "data:audio/mpeg;base64,..."
      }
    ],
    "status": "active"
  }
}
```

---

### 5. Get User Sessions
ইউজারের সব ভয়েস সেশন লিস্ট দেখুন।

**Endpoint:** `GET /api/voice-tutor/sessions?page=1&limit=10`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Query Parameters:**
- `page` (optional): পেজ নম্বর (default: 1)
- `limit` (optional): প্রতি পেজে রেজাল্ট (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User sessions retrieved successfully",
  "data": [
    {
      "_id": "674b2c1a3f8e4d2b5c6a7e89",
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "topic": "JavaScript Arrays",
      "duration": 930,
      "status": "completed",
      "createdAt": "2025-11-30T10:00:00.000Z"
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

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Voice session not found",
  "errorMessages": [
    {
      "path": "",
      "message": "Voice session not found"
    }
  ]
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "No message content provided",
  "errorMessages": [
    {
      "path": "",
      "message": "No message content provided"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errorMessages": [
    {
      "path": "",
      "message": "You are not authorized"
    }
  ]
}
```

---

## Usage Flow

### Step 1: Create Session
```javascript
const response = await fetch('/api/voice-tutor/sessions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: 'Python Functions',
    language: 'en',
    voiceType: 'female'
  })
});

const { data } = await response.json();
const sessionId = data.sessionId;
```

### Step 2: Record Audio (Frontend)
```javascript
// Web Audio API
const mediaRecorder = new MediaRecorder(stream);
let audioChunks = [];

mediaRecorder.ondataavailable = (event) => {
  audioChunks.push(event.data);
};

mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const reader = new FileReader();
  
  reader.onloadend = async () => {
    const base64Audio = reader.result.split(',')[1];
    
    // Send to API
    await sendVoiceMessage(sessionId, base64Audio);
  };
  
  reader.readAsDataURL(audioBlob);
};
```

### Step 3: Send Voice Message
```javascript
const response = await fetch('/api/voice-tutor/message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId,
    audioData: base64Audio
  })
});

const { data } = await response.json();

// Play AI response
const audio = new Audio(data.audioUrl);
audio.play();

// Display text
console.log(data.text);
```

### Step 4: End Session
```javascript
await fetch(`/api/voice-tutor/sessions/${sessionId}/end`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
```

---

## Technical Details

### Audio Format Support
- **Input**: WebM, MP3, WAV, OGG
- **Output**: MP3 (Base64 encoded)
- **Max Size**: 25MB

### Voice Options
| Voice Type | OpenAI Voice | Description |
|-----------|-------------|-------------|
| `male` | onyx | গভীর পুরুষ কণ্ঠ |
| `female` | nova | স্পষ্ট মহিলা কণ্ঠ |
| `child` | shimmer | নরম শিশু কণ্ঠ |

### Language Support
- `bn`: বাংলা (Bangla)
- `en`: English
- `hi`: हिन्दी (Hindi)

### Rate Limits
- **Max 50 messages** per session
- **Max 30 minutes** per session
- **Max 10 active sessions** per user

---

## Integration Example (React)

```typescript
import { useState, useRef } from 'react';

function VoiceTutor() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const startSession = async () => {
    const res = await fetch('/api/voice-tutor/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'JavaScript',
        language: 'en',
        voiceType: 'female'
      })
    });
    
    const { data } = await res.json();
    setSessionId(data.sessionId);
  };
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const audioChunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await sendMessage(base64);
      };
      
      reader.readAsDataURL(audioBlob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const sendMessage = async (audioData: string) => {
    const res = await fetch('/api/voice-tutor/message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        audioData
      })
    });
    
    const { data } = await res.json();
    
    // Play response
    const audio = new Audio(data.audioUrl);
    audio.play();
  };
  
  return (
    <div>
      {!sessionId ? (
        <button onClick={startSession}>Start Voice Session</button>
      ) : (
        <button 
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      )}
    </div>
  );
}
```

---

## Best Practices

1. **Session Management**
   - সেশন শেষে অবশ্যই `end` API কল করুন
   - Inactive সেশন অটো-টাইমআউট: 30 মিনিট

2. **Audio Quality**
   - ভালো মাইক্রোফোন ব্যবহার করুন
   - Background noise কম রাখুন
   - Sample rate: 16kHz+

3. **Error Handling**
   - Network error হলে retry করুন
   - Audio transcription fail হলে text fallback দিন

4. **Performance**
   - Audio chunks 5-10 সেকেন্ডের মধ্যে রাখুন
   - Base64 encoding সাইজ বড় হলে compression করুন

---

## Future Enhancements
- 🔜 Emotion detection from voice
- 🔜 Real-time streaming (WebSocket)
- 🔜 Video call with AI avatar
- 🔜 Multi-participant sessions
- 🔜 Voice accent customization
