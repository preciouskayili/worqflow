# WorqAI API

## Overview

WorqAI API is a modular backend service that integrates with productivity platforms (Google, Slack, GitHub, Figma, Linear, etc.), providing unified access to their APIs and enabling advanced workflow automation and AI-powered features.

---

## Features

- Magic link authentication (passwordless login)
- OAuth integration with Google, Slack, GitHub, Figma, Linear
- Unified user and integration management
- AI-powered chat and task automation
- Real-time event streaming (SSE)
- Modular, extensible architecture

---

## Directory Structure

```
worqai-api/
  ├── package.json
  ├── pnpm-lock.yaml
  ├── README.md
  ├── src/
  │   ├── agents/         # Agent logic for each integration
  │   ├── config/         # OAuth scopes and environment config
  │   ├── controllers/    # Express route controllers
  │   ├── lib/            # Core libraries and utilities
  │   ├── middleware/     # Express middleware (e.g., auth)
  │   ├── models/         # Mongoose models (MongoDB)
  │   ├── routes/         # Express route definitions
  │   ├── scripts/        # Utility scripts
  │   └── tools/          # Integration-specific tools
  └── types/              # TypeScript type definitions
```

---

## Setup & Installation

1. **Clone the repository:**

   ```sh
   git clone <repo-url>
   cd worqai-api
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in required values (API keys, DB URIs, etc.).

4. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```

---

## Core Concepts & Architecture

- **Agents:** Encapsulate logic for interacting with third-party APIs (Figma, GitHub, Google, etc.).
- **Controllers:** Handle HTTP requests and responses for each route.
- **Models:** Define MongoDB schemas for users, integrations, chats, and memory.
- **Middleware:** Includes authentication and request validation.
- **Tools:** Utility functions for each integration, used by agents and controllers.

---

## API Documentation

### Authentication

#### Request Magic Link

- **POST** `/auth/magic-link`
- **Body:** `{ email: string, name?: string }`
- **Response:** `{ message: string }`
- **Description:** Sends a magic login link to the user's email. If the user does not exist, `name` is required to register.

#### Verify Magic Link

- **POST** `/auth/magic-link/verify`
- **Body:** `{ token: string }`
- **Response:** `{ token: string, refreshToken: string, user: { email, name, id } }`
- **Description:** Verifies the magic link token and returns JWT tokens and user info.

#### Refresh Token

- **POST** `/auth/refresh-token`
- **Body:** `{ refreshToken: string }`
- **Response:** `{ token: string }`
- **Description:** Issues a new access token using a valid refresh token.

#### Get Current User

- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ user: { ...User } }`

---

### Integrations

#### List Integrations

- **GET** `/integrations`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `name` (optional)
- **Response:** `{ [name]: Integration }` or `{ integration }`

#### Update Integration Token

- **PUT** `/integrations/:name`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ access_token, refresh_token, expires_at }`
- **Response:** `Integration`

---

### OAuth

All OAuth endpoints require authentication.

- **Google:**
  - `GET /oauth/google` – Get Google OAuth URL
  - `GET /oauth/google/callback` – Handle Google OAuth callback
- **Slack:**
  - `GET /oauth/slack` – Get Slack OAuth URL
  - `GET /oauth/slack/callback` – Handle Slack OAuth callback
- **GitHub:**
  - `GET /oauth/github` – Get GitHub OAuth URL
  - `GET /oauth/github/callback` – Handle GitHub OAuth callback
- **Linear:**
  - `GET /oauth/linear` – Get Linear OAuth URL
  - `GET /oauth/linear/callback` – Handle Linear OAuth callback
- **Figma:**
  - `GET /oauth/figma` – Get Figma OAuth URL
  - `GET /oauth/figma/callback` – Handle Figma OAuth callback

---

### AI & Task Automation

#### Create Task

- **POST** `/ai/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ task: string, threadId?: string }`
- **Response:** `{ message: string, data: { threadId, messageId } }`
- **Description:** Creates a new task (chat message) in a thread. If `threadId` is not provided, a new thread is created.

---

### Events (Streaming)

#### Chat Message Events (SSE)

- **GET** `/streams/messages/:threadId/:messageId`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Server-Sent Events (SSE) stream
- **Description:** Streams AI agent responses and events for a chat message in real time.

---

## Data Models

### User

```
{
  email: string,
  name?: string,
  googleId?: string,
  refreshToken?: string,
  magicLinkToken?: string,
  magicLinkExpires?: Date,
  timeZone?: string,
  workDayStart?: Date,
  workDayEnd?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Integration

```
{
  name: string, // e.g. 'google', 'slack', ...
  user_id: string,
  access_token: string,
  refresh_token?: string,
  expires_at?: Date,
  created_at: Date,
  updated_at: Date,
  scope?: object
}
```

### Thread

```
{
  lastMessageAt: Date,
  userId: string,
  title: string,
  createdAt: Date,
  updatedAt: Date
}
```

### ChatMessage

```
{
  thread: string,
  user: string,
  role: 'user' | 'agent',
  content: string,
  status: 'pending' | 'completed' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

### Memory

```
{
  type: 'episodic' | 'factual' | 'semantic',
  content: string,
  tags: string[],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Extending the Project

- **Add a new integration:**

  1. Create a new agent in `src/agents/`.
  2. Add OAuth scopes in `src/config/`.
  3. Implement controller and route in `src/controllers/oauth/` and `src/routes/oauth/`.
  4. Add tools as needed in `src/tools/`.

- **Add a new API endpoint:**
  1. Define the route in `src/routes/`.
  2. Implement the controller in `src/controllers/`.
  3. Add model/schema if persistent data is needed.

---

## Contributing

1. Fork the repository and create a new branch.
2. Make your changes with clear commit messages.
3. Ensure code passes linting and tests.
4. Submit a pull request with a detailed description.

---

## License

_This project is licensed under the MIT License._

---

## Contact & Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the maintainers.

---

## API Reference & Swagger

See [`swagger.yaml`](./swagger.yaml) for a machine-readable OpenAPI (Swagger) specification of all endpoints.
