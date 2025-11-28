# AI-Powered Micro-Learning Platform - Backend

Clean, scalable backend built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/microlearning
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
```

4. **Run the development server**
```bash
npm run dev
```

Server will start at: `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app/
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── auth.model.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.validation.ts
│   │       │   ├── auth.route.ts
│   │       │   └── auth.types.ts
│   │       ├── behaviorAnalytics/
│   │       ├── learningContent/
│   │       ├── microLessons/
│   │       ├── progressTracking/
│   │       └── feedback/
│   ├── config/
│   │   ├── database.ts
│   │   └── app.ts
│   ├── middleware/
│   │   ├── authGuard.ts
│   │   ├── globalErrorHandler.ts
│   │   └── validateRequest.ts
│   ├── utils/
│   │   ├── sendResponse.ts
│   │   ├── catchAsync.ts
│   │   └── ApiError.ts
│   └── server.ts
├── API_Documentation/
│   ├── Auth.md
│   ├── BehaviorAnalytics.md
│   ├── LearningContent.md
│   ├── MicroLessons.md
│   ├── ProgressTracking.md
│   └── Feedback.md
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Zod** - Schema validation
- **JWT** - Authentication
- **BCrypt** - Password hashing

---

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## 🔐 Authentication

The API uses JWT-based authentication with access and refresh tokens.

### Token Types

| Token | Duration | Purpose |
|-------|----------|---------|
| Access Token | 7 days | Access protected resources |
| Refresh Token | 30 days | Generate new access tokens |

### Protected Routes

Add this header to access protected endpoints:
```
Authorization: Bearer <your_access_token>
```

---

## 📖 API Documentation

Comprehensive API documentation is available in the `/API_Documentation` folder:

- **[Auth.md](API_Documentation/Auth.md)** - Authentication endpoints
- **BehaviorAnalytics.md** - User behavior tracking
- **LearningContent.md** - Content management
- **MicroLessons.md** - Lesson management
- **ProgressTracking.md** - Progress tracking
- **Feedback.md** - Feedback system

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check
```bash
GET http://localhost:5000/health
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/microlearning |
| JWT_ACCESS_SECRET | Secret for access tokens | - |
| JWT_REFRESH_SECRET | Secret for refresh tokens | - |
| JWT_ACCESS_EXPIRES_IN | Access token expiration | 7d |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 30d |
| BCRYPT_SALT_ROUNDS | Bcrypt salt rounds | 10 |

---

## 🏗️ Architecture Principles

### Clean Code
- **SOLID principles** applied throughout
- **DRY** - Don't Repeat Yourself
- **Modular structure** - Easy to maintain and scale
- **Clear naming** - Self-documenting code

### Error Handling
- Global error handler middleware
- Custom ApiError class
- Proper HTTP status codes
- Detailed error messages in development

### Validation
- Zod schemas for request validation
- Type-safe validation
- Clear error messages

### Security
- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Input validation and sanitization

---

## 🧩 Module Structure

Each module follows this structure:

```
module/
├── module.model.ts       # Mongoose schema and model
├── module.controller.ts  # Request handlers
├── module.service.ts     # Business logic
├── module.validation.ts  # Zod validation schemas
├── module.route.ts       # Express routes
└── module.types.ts       # TypeScript types/interfaces
```

---

## 🔨 Adding a New Module

1. **Create module folder**
```bash
mkdir src/app/modules/newModule
```

2. **Create required files**
```bash
touch src/app/modules/newModule/{newModule.model.ts,newModule.controller.ts,newModule.service.ts,newModule.validation.ts,newModule.route.ts,newModule.types.ts}
```

3. **Implement the module** (follow auth module as reference)

4. **Register routes** in `src/config/app.ts`
```typescript
import newModuleRoutes from '../app/modules/newModule/newModule.route';
app.use('/api/v1/new-module', newModuleRoutes);
```

5. **Create API documentation** in `API_Documentation/NewModule.md`

---

## 🚦 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## 🎯 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": {
    // Error details (optional)
  },
  "stack": "Error stack (development only)"
}
```

---

## 🔐 User Roles

| Role | Description |
|------|-------------|
| learner | Regular user who accesses learning content |
| admin | Administrator with full system access |

### Role-Based Access Control

Use the `authGuard` middleware with roles:

```typescript
// Allow all authenticated users
router.get('/lessons', authGuard(), controller.getAllLessons);

// Allow only admins
router.delete('/users/:id', authGuard('admin'), controller.deleteUser);

// Allow multiple roles
router.post('/content', authGuard('admin', 'instructor'), controller.createContent);
```

---

## 🧪 Testing

### Testing with Postman

1. Import the Postman collection (coming soon)
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `accessToken`: (auto-populated after login)
   - `refreshToken`: (auto-populated after login)

### Manual Testing

1. **Register a user**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "learner"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Access protected route**
```bash
curl -X GET http://localhost:5000/api/v1/protected-route \
  -H "Authorization: Bearer <your_access_token>"
```

---

## 🐛 Debugging

### Enable Detailed Logging

Set `NODE_ENV=development` in `.env` to see:
- Error stack traces
- Detailed error information
- Request/response logs

### Common Issues

**MongoDB Connection Failed**
- Check if MongoDB is running
- Verify MONGODB_URI in `.env`
- Ensure database exists

**JWT Errors**
- Check JWT secrets are set in `.env`
- Verify token format: `Bearer <token>`
- Check token expiration

**Validation Errors**
- Check request body format
- Ensure required fields are present
- Verify data types match schema

---

## 📈 Performance

### Database Optimization
- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use projection to limit returned fields

### Security Best Practices
- Store JWT secrets securely
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs
- Keep dependencies updated

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production MongoDB URI
4. Enable CORS for specific origins
5. Set up SSL/TLS certificates

### Start Production Server
```bash
npm start
```

---

## 📝 Next Steps

- [ ] Implement remaining modules (lessons, progress, etc.)
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API rate limiting
- [ ] Implement caching with Redis
- [ ] Add file upload functionality
- [ ] Integrate AI services
- [ ] Set up monitoring and logging

---

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain TypeScript strict mode
3. Write clear, self-documenting code
4. Update API documentation
5. Test thoroughly before committing

---

## 📄 License

MIT

---

## 💬 Support

For questions or issues:
- Check API documentation in `/API_Documentation`
- Review error messages carefully
- Verify environment configuration
- Check MongoDB connection

---

**Built with ❤️ for AI-Powered Micro-Learning**
