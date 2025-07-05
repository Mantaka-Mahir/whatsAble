# AutoEngage Deployment Guide

## Repository Structure
- `/backend` - Node.js Express server with both API and web interface
- `/mobile` - Flutter mobile app

## Local Development

### Backend (API + Web Dashboard)
```bash
cd backend
npm install
npm run dev  # Starts server on port 5000
```

#### Access Points
- **Dashboard**: http://localhost:5000 (Admin interface)
- **API**: http://localhost:5000/api (REST endpoints)
- **Login**: http://localhost:5000/auth/login

#### Demo Credentials
- **Admin**: username: `admin`, password: `secret`
- **User**: username: `demo`, password: `secret`

#### Features
- ✅ Express server with EJS templating
- ✅ In-memory database with sample data
- ✅ Session-based authentication
- ✅ RESTful API endpoints
- ✅ Admin dashboard with message management
- ✅ Webhook support for external integrations
- ✅ Follow-up message simulation
- ✅ Real-time message tracking

#### API Endpoints
- `GET /api/users` - Get all users
- `GET /api/messages/:userId` - Get messages for user
- `POST /api/webhook` - Webhook for external services
- `PUT /api/messages/:messageId/read` - Mark message as read
- `POST /api/messages/:messageId/reply` - Reply to message
- `POST /api/simulate-followup` - Simulate followup messages

### Mobile App (Coming Soon)
```bash
cd mobile
flutter pub get
flutter run
```

## Project Architecture

### Backend Structure
```
backend/
├── controllers/        # Route controllers (MVC pattern)
├── middleware/         # Authentication & security
├── models/            # Data models (User, Message, Admin)
├── routes/            # API & web routes
├── views/             # EJS templates for dashboard
├── public/            # Static assets
└── server.js          # Main application entry
```

### Database Schema (In-Memory)
- **Users**: id, name, phone, email, status, createdAt, lastSeen
- **Messages**: id, userId, content, type, status, isRead, sentAt, readAt, replies[]
- **Admins**: id, username, email, password, role, createdAt

## External Integrations

### n8n Automation (Recommended)
1. Install n8n: `npm install n8n -g`
2. Start n8n: `n8n start`
3. Create workflow with HTTP Request node pointing to `/api/webhook`
4. Set up triggers (Google Forms, Sheets, etc.)

### Webhook Format
```json
{
  "type": "new_lead",
  "data": {
    "name": "Customer Name",
    "phone": "+1234567890",
    "email": "customer@example.com"
  }
}
```