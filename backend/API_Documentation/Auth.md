# Authentication API Documentation

## Base URL
```
https://microlearning-backend-reduan.onrender.com/api/v1/auth
```

---

## Endpoints

### 1. Register User

**POST** `/register`

Register a new user account.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "learner"
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 6 characters |
| name | string | Yes | User's full name (minimum 2 characters) |
| role | string | No | Either 'admin' or 'learner' (default: 'learner') |

#### Success Response
**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "learner"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request` (Validation Error)
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Status Code:** `409 Conflict` (Email Already Exists)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### Postman Setup
```
Method: POST
URL: {{baseUrl}}/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "learner"
}
```

---

### 2. Login User

**POST** `/login`

Authenticate user and receive access tokens.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Registered email address |
| password | string | Yes | User's password |

#### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "learner"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Code:** `403 Forbidden` (Account Deactivated)
```json
{
  "success": false,
  "message": "Your account has been deactivated"
}
```

**Status Code:** `400 Bad Request` (Validation Error)
```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Postman Setup
```
Method: POST
URL: {{baseUrl}}/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Postman Test Script (to save token)
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.data.accessToken);
    pm.environment.set("refreshToken", jsonData.data.refreshToken);
}
```

---

### 3. Refresh Access Token

**POST** `/refresh-token`

Generate a new access token using a valid refresh token.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token from login/register |

#### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` (Invalid/Expired Token)
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

**Status Code:** `401 Unauthorized` (Token Expired)
```json
{
  "success": false,
  "message": "Refresh token expired"
}
```

**Status Code:** `403 Forbidden` (Account Deactivated)
```json
{
  "success": false,
  "message": "Your account has been deactivated"
}
```

#### Postman Setup
```
Method: POST
URL: {{baseUrl}}/auth/refresh-token
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "refreshToken": "{{refreshToken}}"
}
```

#### Postman Test Script (to update token)
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.data.accessToken);
}
```

---

### 4. Logout User

**POST** `/logout`

Logout user and invalidate refresh token.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

#### Request Body
```
No body required
```

#### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` (No Token)
```json
{
  "success": false,
  "message": "Unauthorized - No token provided"
}
```

**Status Code:** `401 Unauthorized` (Invalid Token)
```json
{
  "success": false,
  "message": "Unauthorized - Invalid token"
}
```

**Status Code:** `404 Not Found` (User Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Postman Setup
```
Method: POST
URL: {{baseUrl}}/auth/logout
Headers:
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
Body:
  None
```

---

## Authentication Flow

### 1. Register/Login Flow
```
Client -> POST /register or /login
Server -> Returns {user, accessToken, refreshToken}
Client -> Store tokens securely
Client -> Use accessToken for subsequent requests
```

### 2. Protected Route Access
```
Client -> Add header: Authorization: Bearer <accessToken>
Server -> Verify token
Server -> Allow/Deny access
```

### 3. Token Refresh Flow
```
Client -> accessToken expires (401 error)
Client -> POST /refresh-token with refreshToken
Server -> Returns new accessToken
Client -> Retry request with new accessToken
```

### 4. Logout Flow
```
Client -> POST /logout with accessToken
Server -> Invalidate refreshToken in database
Client -> Clear stored tokens
```

---

## Postman Environment Variables

Create an environment in Postman with these variables:

```
baseUrl: https://microlearning-backend-reduan.onrender.com/api/v1
accessToken: (will be set automatically)
refreshToken: (will be set automatically)
```

---

## Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required/failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Authorization Header Format

All protected endpoints require this header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Format:** `Bearer <space> <access_token>`

---

## Token Expiration

| Token Type | Default Duration | Purpose |
|------------|------------------|---------|
| Access Token | 7 days | Access protected resources |
| Refresh Token | 30 days | Generate new access tokens |

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| learner | Regular user | Access learning content, track progress |
| admin | Administrator | Full system access, manage users |

---

## Example Complete Flow in Postman

### Step 1: Register
```
POST {{baseUrl}}/auth/register
{
  "email": "learner@example.com",
  "password": "password123",
  "name": "Jane Learner",
  "role": "learner"
}
```

### Step 2: Login
```
POST {{baseUrl}}/auth/login
{
  "email": "learner@example.com",
  "password": "password123"
}
```

### Step 3: Access Protected Route (example)
```
GET {{baseUrl}}/lessons
Headers:
  Authorization: Bearer {{accessToken}}
```

### Step 4: Refresh Token (when needed)
```
POST {{baseUrl}}/auth/refresh-token
{
  "refreshToken": "{{refreshToken}}"
}
```

### Step 5: Logout
```
POST {{baseUrl}}/auth/logout
Headers:
  Authorization: Bearer {{accessToken}}
```

---

## Testing Scenarios

### 1. Successful Registration
- Valid email, password, and name
- Returns 201 with user data and tokens

### 2. Duplicate Registration
- Email already exists
- Returns 409 Conflict

### 3. Invalid Email Format
- Email format validation fails
- Returns 400 with validation error

### 4. Weak Password
- Password less than 6 characters
- Returns 400 with validation error

### 5. Successful Login
- Valid credentials
- Returns 200 with user data and tokens

### 6. Invalid Credentials
- Wrong email or password
- Returns 401 Unauthorized

### 7. Access Protected Route Without Token
- No Authorization header
- Returns 401 Unauthorized

### 8. Access Protected Route With Invalid Token
- Malformed or expired token
- Returns 401 Unauthorized

### 9. Refresh Token Success
- Valid refresh token
- Returns 200 with new access token

### 10. Logout Success
- Valid access token
- Returns 200, refresh token invalidated

---

## Error Response Structure

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": {
    // Additional error information (optional)
  },
  "stack": "Error stack trace (development only)"
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- Passwords are hashed using bcrypt before storage
- Refresh tokens are stored in the database
- Access tokens are stateless (not stored)
- All routes use JSON format for request/response
- CORS is enabled for all origins (configure for production)

---

## Next Steps

After implementing authentication, you can:

1. Create protected routes in other modules
2. Use `authGuard()` middleware for role-based access
3. Implement password reset functionality
4. Add email verification
5. Implement social OAuth (Google, Facebook)

---

## Support

For issues or questions:
- Check the error message and status code
- Verify request body format matches documentation
- Ensure tokens are properly stored and sent
- Check environment variables are configured
