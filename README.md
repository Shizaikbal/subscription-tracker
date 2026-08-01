# SubDub - Subscription Tracker

Track all your subscriptions in one place. SubDub stores your subscriptions, shows upcoming renewals, and sends reminder emails before each renewal date so you never get charged unexpectedly.

Live at: **https://subdub-orpin.vercel.app**

## Features

- User authentication (sign up, sign in, sign out) with JWT sessions
- Full CRUD for subscriptions (name, price, frequency, payment method, start date)
- Automatic status management: active, paused, cancelled, expired
- Cancel subscriptions with a single click
- Upcoming renewals view, sorted by renewal date
- Automated email reminders before renewal (7, 5, 2 and 1 day ahead)
- Test reminder button to preview the reminder email
- Ownership-based access control: users can only see and manage their own subscriptions
- Rate limiting and bot detection via Arcjet
- Strict security headers (Helmet CSP), no inline scripts
- Minimal black and white UI

## Technologies

### Backend

- **Node.js** (v24, ES modules) and **Express** (v4) - API server and routing
- **MongoDB Atlas + Mongoose** (v9) - data storage and modeling
- **MongoDB driver** (v7) - database connection layer

### Authentication and Security

- **jsonwebtoken** (JWT) - access tokens
- **bcryptjs** - password hashing
- **helmet** - HTTP security headers and strict Content-Security-Policy
- **cors** - cross-origin resource sharing
- **Arcjet** - rate limiting, bot detection and request validation (shield)

### Automation

- **QStash (Upstash)** - schedule and deliver reminder emails
- **Upstash Workflow** - multi-step reminder workflow (7-5-2-1 days before renewal)
- **QStash signature verification** - verifies webhook requests come from QStash

### Email

- **Nodemailer** (v9) - SMTP email transport
- Custom HTML email templates for reminders

### Frontend

- Vanilla HTML, CSS and JavaScript (no framework)
- Minimal black and white design with lined boxes and sharp edges
- No build step, no inline scripts (CSP compliant)

### Utilities

- **dayjs** - date and duration math
- **dotenv** - environment variable loading
- **morgan** - request logging
- **cookie-parser** - cookie parsing
- **nodemon** - local development hot reload

### Tooling

- **Vercel** - hosting and deployment
- **ESLint** - linting
- **git / GitHub** - version control

## API

Base path: `/api/v1`

| Method | Route | Description |
| --- | --- | --- |
| POST | `/auth/sign-up` | Create an account |
| POST | `/auth/sign-in` | Log in |
| POST | `/auth/sign-out` | Log out |
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update current user |
| DELETE | `/users/me` | Delete account |
| GET | `/subscriptions` | List user subscriptions |
| POST | `/subscriptions` | Create a subscription |
| GET | `/subscriptions/upcoming-renewals` | List upcoming renewals |
| GET | `/subscriptions/:id` | Get one subscription |
| PATCH | `/subscriptions/:id` | Update a subscription |
| DELETE | `/subscriptions/:id` | Delete a subscription |
| POST | `/subscriptions/:id/cancel` | Cancel a subscription |
| POST | `/workflow/test-reminder` | Send a test reminder email |
| POST | `/workflow/subscription/reminder` | QStash webhook (internal) |

All routes except sign-up and sign-in require a `Bearer` token. The QStash webhook is authenticated by QStash signature verification.

## Environment Variables

Create a `.env.local` file (or use the Vercel project settings):

| Variable | Description |
| --- | --- |
| `DB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) |
| `ARCJET_KEY` | Arcjet API key |
| `QSTASH_URL` | QStash API URL |
| `QSTASH_TOKEN` | QStash API token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash signature verification key |
| `QSTASH_NEXT_SIGNING_KEY` | QStash next signing key |
| `EMAIL_USER` | Gmail address used to send emails |
| `EMAIL_PASSWORD` | Gmail app password |
| `SERVER_URL` | Public base URL of the deployed app |

## Run Locally

Requirements: Node.js 20+, MongoDB (local or Atlas), a Gmail account with an app password, and QStash/Arcjet accounts for full functionality.

```bash
git clone https://github.com/Shizaikbal/subscription-tracker.git
cd subscription-tracker
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

The server runs on `http://localhost:5500` and serves the UI at `/`.

## Deploy

The app is hosted on Vercel and deployed with the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in the Vercel project settings (see the table above).

## License

Private project.
