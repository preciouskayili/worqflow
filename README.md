# WorqAI API

A Node.js/Express API backend with passwordless authentication using magic links sent via Resend. This API supports user registration, login, and session management with JWTs, focusing on security and a seamless user experience.

## Features

- Passwordless authentication via magic links (Resend)
- JWT-based session management (access & refresh tokens)
- User model with email as primary identifier
- OAuth integration (Google, etc.)
- Modular controller and route structure

## Magic Link Authentication Flow

1. **Request Magic Link**: User submits their email to `/auth/request-magic-link`.
2. **Send Magic Link**: API generates a secure, time-limited token (JWT) and emails a magic link to the user using Resend.
3. **Verify Magic Link**: User clicks the emailed link, which hits `/auth/verify-magic-link?token=...`. The API verifies the token, logs the user in, and issues access/refresh tokens.
4. **Token Refresh**: User can refresh their session using `/auth/refresh-token` with their refresh token.

## API Endpoints

### POST `/auth/request-magic-link`

_Request a magic link to be sent to the user's email._

- **Body:** `{ "email": "user@example.com" }`
- **Response:** `200 OK` if sent, or error if invalid email.

### POST `/auth/verify-magic-link`

_Verify the magic link token and log in the user._

- **Body:** `{ "token": "<magic_link_token>" }`
- **Response:** `{ token, refreshToken, user }` (JWTs and user info)

### POST `/auth/refresh-token`

_Refresh the access token using a valid refresh token._

- **Body:**
  ```json
  {
    "refreshToken": "<your_refresh_token>"
  }
  ```
- **Response:**
  ```json
  {
    "token": "<new_access_token>"
  }
  ```

**How to use:**

1. When your access token expires (usually after 15 minutes), make a POST request to `/auth/refresh-token` with your refresh token.
2. Use the new access token in the `Authorization` header for subsequent requests.
3. If the refresh token is invalid or expired, you must re-authenticate using the magic link flow.

## Environment Variables

- `RESEND_API_KEY` – API key for Resend email service
- `JWT_SECRET` – Secret for signing JWTs
- `MONGODB_URI` – MongoDB connection string
- (Other service-specific variables as needed)

## Setup & Installation

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd worqai-api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in required values
4. **Run the server:**
   ```bash
   npm run dev
   ```

## Example Magic Link Flow

1. User enters email on frontend.
2. Frontend sends POST to `/auth/request-magic-link`.
3. User receives email and clicks link.
4. Frontend sends POST to `/auth/verify-magic-link` with token from URL.
5. API responds with JWTs and user info.
6. Frontend stores tokens and authenticates requests.

## Using the Authorization Header

For all protected endpoints, include your access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

This allows the API to authenticate your requests. If the token is missing or invalid, you will receive a 401 Unauthorized error.

---

## Contribution

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
