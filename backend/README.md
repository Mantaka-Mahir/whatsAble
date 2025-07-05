# AutoEngage Backend

A Node.js Express backend for the AutoEngage WhatsApp follow-up system.

## Features

- **Express Server** with EJS templating
- **RESTful API** for message management
- **Session Management** with express-session
- **Basic Authentication** for admin dashboard
- **In-memory Database** with sample data
- **MVC Architecture** with organized code structure
- **Webhook Support** for external integrations (n8n)
- **Real-time Message Management**
- **Follow-up Automation** simulation

## API Endpoints

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Handle login
- `GET /auth/logout` - Logout
- `POST /api/login` - API login
- `POST /api/logout` - API logout

### Messages
- `GET /api/messages/:userId` - Get messages for a user
- `PUT /api/messages/:messageId/read` - Mark message as read
- `POST /api/messages/:messageId/reply` - Reply to a message

### Users
- `GET /api/users` - Get all users

### Utilities
- `POST /api/webhook` - Webhook endpoint for external services
- `POST /api/simulate-followup` - Simulate follow-up messages
- `GET /api/dashboard/stats` - Get dashboard statistics

### Dashboard (Web Interface)
- `GET /dashboard` - Main dashboard
- `GET /dashboard/users` - Users management
- `GET /dashboard/messages` - Messages overview
- `GET /dashboard/send-message` - Send new message
- `GET /dashboard/conversation/:userId` - View conversation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application:
- Dashboard: http://localhost:5000
- API: http://localhost:5000/api

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `secret`

**User Login:**
- Username: `demo`  
- Password: `secret`

## Project Structure

```
backend/
├── controllers/        # Route controllers
│   ├── apiController.js
│   ├── authController.js
│   └── dashboardController.js
├── middleware/         # Express middleware
│   └── auth.js
├── models/            # Data models
│   ├── database.js
│   ├── User.js
│   ├── Message.js
│   └── Admin.js
├── routes/            # Route definitions
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   └── dashboardRoutes.js
├── views/             # EJS templates
│   ├── auth/
│   ├── dashboard/
│   └── partials/
├── public/            # Static files
└── server.js          # Main server file
```

## Environment Variables

Create a `.env` file for production:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secret-key-here
```

## Sample Data

The system comes with pre-loaded sample data:

**Users:**
- John Doe (+1234567890)
- Jane Smith (+1987654321)  
- Mike Johnson (+1122334455)

**Messages:**
- Initial contact messages
- Follow-up messages
- Sample replies

## Webhook Integration

The `/api/webhook` endpoint accepts POST requests with the following format:

```json
{
  "type": "new_lead",
  "data": {
    "name": "Customer Name",
    "phone": "+1234567890",
    "email": "customer@example.com",
    "source": "website"
  }
}
```

Supported webhook types:
- `new_lead` - Creates a new user and sends initial message
- `send_message` - Sends a message to existing user
- `schedule_followup` - Schedules a follow-up message

## Development

**Start in development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Security Features

- Helmet for security headers
- Session-based authentication
- CORS configuration
- Input validation
- Error handling middleware

## Notes

- This is a demo application with in-memory storage
- For production, replace with a proper database (MongoDB, PostgreSQL, etc.)
- Session store should be external (Redis) for production
- Add proper environment configuration
- Implement rate limiting and additional security measures
