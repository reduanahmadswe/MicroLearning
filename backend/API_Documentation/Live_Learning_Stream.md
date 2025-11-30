# 📺 Live Learning Stream API Documentation

## Overview
Live Learning Stream সিস্টেম যেখানে ইন্সট্রাক্টররা লাইভ ক্লাস নিতে পারবে এবং স্টুডেন্টরা রিয়েল-টাইমে দেখতে, চ্যাট করতে এবং ইন্টারঅ্যাক্ট করতে পারবে।

## Features
- ✅ লাইভ স্ট্রিমিং (WebRTC/RTMP)
- ✅ রিয়েল-টাইম চ্যাট
- ✅ স্ক্রিন শেয়ারিং
- ✅ স্ট্রিম রেকর্ডিং
- ✅ ভিউয়ার অ্যানালিটিক্স
- ✅ প্রাইভেট স্ট্রিম
- ✅ XP রিওয়ার্ড সিস্টেম

---

## API Endpoints

### 1. Create Live Stream
নতুন লাইভ স্ট্রিম তৈরি করুন (শুধু ইন্সট্রাক্টর/অ্যাডমিন)।

**Endpoint:** `POST /api/live-streams`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**
```json
{
  "title": "MERN Stack - Full Course",
  "description": "Complete MERN stack tutorial from basics to advanced",
  "category": "Programming",
  "tags": ["JavaScript", "React", "Node.js", "MongoDB"],
  "isPrivate": false,
  "isChatEnabled": true,
  "isRecordingEnabled": true,
  "isScreenShareEnabled": true,
  "startTime": "2025-12-01T15:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Live stream created successfully",
  "data": {
    "_id": "674c1a2b3d4e5f6a7b8c9d0e",
    "streamId": "STREAM-1733052000-A1B2C3D4",
    "title": "MERN Stack - Full Course",
    "description": "Complete MERN stack tutorial...",
    "category": "Programming",
    "streamKey": "abc123def456...",
    "rtmpUrl": "rtmp://live.microlearning.com/live/STREAM-1733052000-A1B2C3D4",
    "streamUrl": "https://stream.microlearning.com/live/STREAM-1733052000-A1B2C3D4/index.m3u8",
    "isLive": false,
    "status": "scheduled",
    "viewerCount": 0,
    "createdAt": "2025-11-30T14:00:00.000Z"
  }
}
```

**Stream Setup:**
1. OBS/Streamlabs-এ RTMP URL + Stream Key যোগ করুন
2. Stream শুরু করুন
3. API দিয়ে "go live" করুন

---

### 2. Start Stream (Go Live)
স্ট্রিম লাইভ করুন।

**Endpoint:** `PATCH /api/live-streams/:streamId/start`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stream started successfully",
  "data": {
    "streamId": "STREAM-1733052000-A1B2C3D4",
    "isLive": true,
    "status": "live",
    "startTime": "2025-12-01T15:00:00.000Z"
  }
}
```

---

### 3. End Stream
স্ট্রিম শেষ করুন এবং XP পান।

**Endpoint:** `PATCH /api/live-streams/:streamId/end`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stream ended successfully",
  "data": {
    "streamId": "STREAM-1733052000-A1B2C3D4",
    "isLive": false,
    "status": "ended",
    "endTime": "2025-12-01T16:30:00.000Z",
    "duration": 5400,
    "totalViews": 250,
    "peakViewers": 85,
    "xpEarned": 500
  }
}
```

**XP Calculation:**
- প্রতি ভিউ = 5 XP
- প্রতি সেকেন্ড = 1 XP
- Maximum = 500 XP প্রতি স্ট্রিম

---

### 4. Join Stream (Viewer)
স্ট্রিমে জয়েন করুন।

**Endpoint:** `POST /api/live-streams/:streamId/join`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Joined stream successfully",
  "data": {
    "stream": {
      "streamId": "STREAM-1733052000-A1B2C3D4",
      "title": "MERN Stack - Full Course",
      "streamUrl": "https://stream.microlearning.com/live/.../index.m3u8",
      "viewerCount": 86,
      "isChatEnabled": true
    },
    "viewer": {
      "joinedAt": "2025-12-01T15:30:00.000Z"
    }
  }
}
```

---

### 5. Leave Stream
স্ট্রিম ছেড়ে যান এবং XP পান।

**Endpoint:** `POST /api/live-streams/:streamId/leave`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Left stream successfully",
  "data": {
    "watchTime": 1800,
    "xpEarned": 30
  }
}
```

**XP Calculation:**
- প্রতি মিনিট = 1 XP
- Maximum = 30 XP প্রতি স্ট্রিম

---

### 6. Send Chat Message
স্ট্রিমে চ্যাট মেসেজ পাঠান।

**Endpoint:** `POST /api/live-streams/chat`

**Request Body:**
```json
{
  "streamId": "STREAM-1733052000-A1B2C3D4",
  "message": "Great explanation! 🔥",
  "type": "text"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Chat message sent successfully",
  "data": {
    "_id": "674c2b3c4d5e6f7a8b9c0d1e",
    "stream": "STREAM-1733052000-A1B2C3D4",
    "user": "674a1b2c3d4e5f6a7b8c9d0e",
    "message": "Great explanation! 🔥",
    "type": "text",
    "timestamp": "2025-12-01T15:35:00.000Z"
  }
}
```

**Message Types:**
- `text`: Normal text message
- `emoji`: Emoji reaction
- `sticker`: Animated sticker
- `system`: System notification

---

### 7. Get Chat Messages
স্ট্রিমের চ্যাট মেসেজ লোড করুন।

**Endpoint:** `GET /api/live-streams/:streamId/chat?limit=50`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat messages retrieved successfully",
  "data": [
    {
      "_id": "674c2b3c4d5e6f7a8b9c0d1e",
      "user": {
        "_id": "674a1b2c3d4e5f6a7b8c9d0e",
        "profile": {
          "firstName": "Riduan",
          "avatar": "https://..."
        }
      },
      "message": "Great explanation! 🔥",
      "timestamp": "2025-12-01T15:35:00.000Z"
    }
  ]
}
```

---

### 8. Get Live Streams
সব লাইভ স্ট্রিম দেখুন।

**Endpoint:** `GET /api/live-streams/live?page=1&limit=20&category=Programming`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Live streams retrieved successfully",
  "data": [
    {
      "streamId": "STREAM-1733052000-A1B2C3D4",
      "title": "MERN Stack - Full Course",
      "thumbnail": "https://...",
      "host": {
        "profile": {
          "firstName": "John",
          "avatar": "https://..."
        }
      },
      "category": "Programming",
      "viewerCount": 86,
      "isLive": true,
      "startTime": "2025-12-01T15:00:00.000Z"
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

### 9. Get Stream by ID
নির্দিষ্ট স্ট্রিম দেখুন।

**Endpoint:** `GET /api/live-streams/:streamId`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stream retrieved successfully",
  "data": {
    "streamId": "STREAM-1733052000-A1B2C3D4",
    "title": "MERN Stack - Full Course",
    "description": "Complete tutorial...",
    "host": {
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "email": "john@example.com"
    },
    "streamUrl": "https://stream.microlearning.com/...",
    "isLive": true,
    "viewerCount": 86,
    "peakViewers": 120,
    "totalViews": 250
  }
}
```

---

### 10. Get My Streams
আপনার সব স্ট্রিম দেখুন।

**Endpoint:** `GET /api/live-streams/my/streams?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Your streams retrieved successfully",
  "data": [
    {
      "streamId": "STREAM-1733052000-A1B2C3D4",
      "title": "MERN Stack - Full Course",
      "status": "ended",
      "totalViews": 250,
      "duration": 5400,
      "createdAt": "2025-12-01T14:00:00.000Z"
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

### 11. Get Stream Analytics
স্ট্রিমের বিস্তারিত অ্যানালিটিক্স।

**Endpoint:** `GET /api/live-streams/:streamId/analytics`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stream analytics retrieved successfully",
  "data": {
    "stream": {
      "streamId": "STREAM-1733052000-A1B2C3D4",
      "title": "MERN Stack - Full Course"
    },
    "analytics": {
      "totalViews": 250,
      "peakViewers": 120,
      "currentViewers": 0,
      "chatMessages": 450,
      "totalWatchTime": 180000,
      "avgWatchTime": 720,
      "duration": 5400
    },
    "topViewers": [
      {
        "user": {
          "profile": {
            "firstName": "Riduan"
          }
        },
        "watchTime": 5200,
        "interactions": 25
      }
    ]
  }
}
```

---

## WebRTC Integration (Frontend)

### HLS Video Player
```typescript
import Hls from 'hls.js';

function LiveStreamPlayer({ streamUrl }: { streamUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);
  
  return <video ref={videoRef} controls autoPlay />;
}
```

### Real-time Chat (WebSocket)
```typescript
import { io } from 'socket.io-client';

function LiveChat({ streamId }: { streamId: string }) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const socket = useRef<any>();
  
  useEffect(() => {
    socket.current = io('ws://localhost:5000', {
      auth: { token: accessToken }
    });
    
    socket.current.emit('join-stream', { streamId });
    
    socket.current.on('new-message', (message: IMessage) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      socket.current.emit('leave-stream', { streamId });
      socket.current.disconnect();
    };
  }, [streamId]);
  
  const sendMessage = (text: string) => {
    socket.current.emit('send-message', {
      streamId,
      message: text
    });
  };
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>
          <strong>{msg.user.profile.firstName}:</strong> {msg.message}
        </div>
      ))}
    </div>
  );
}
```

---

## OBS Setup Instructions

### 1. OBS Studio ইনস্টল করুন
Download: https://obsproject.com/

### 2. Stream Settings কনফিগার করুন
```
Settings → Stream
Service: Custom
Server: rtmp://live.microlearning.com/live
Stream Key: [Your stream key from API]
```

### 3. Video Settings
```
Settings → Video
Base Resolution: 1920x1080
Output Resolution: 1280x720
FPS: 30
```

### 4. Output Settings
```
Settings → Output
Encoder: x264
Bitrate: 2500-4000 Kbps
Keyframe Interval: 2
```

---

## Rate Limits
- **Max 3 simultaneous streams** per instructor
- **Max 5 chat messages per minute** per user
- **Streaming duration**: Unlimited

---

## Best Practices

1. **স্ট্রিম কোয়ালিটি**
   - 720p recommended (ভালো পারফরম্যান্স)
   - Stable internet: Min 5 Mbps upload
   - Wired connection preferred

2. **Engagement**
   - Chat actively মনিটর করুন
   - Polls/Q&A সেশন করুন
   - Screen share ব্যবহার করুন

3. **Recording**
   - Important sessions রেকর্ড করুন
   - Replay value বাড়ান
   - Archive কন্টেন্ট রাখুন

---

## Future Enhancements
- 🔜 Multi-camera support
- 🔜 Live polls/quizzes
- 🔜 Co-host feature
- 🔜 Virtual backgrounds
- 🔜 Auto-transcription
- 🔜 Mobile streaming
