# LibraryMate

A comprehensive library management system built with Node.js, React, and PostgreSQL.

## Overview

LibraryMate is a full-stack web application that helps libraries manage their books, students, borrowing records, and notifications. It features user authentication, OTP verification, email notifications, and comprehensive reporting.

## Features

- **Student Management**: Registration, authentication, and profile management
- **Book Management**: Add, update, delete, and search books
- **Borrowing System**: Issue and return books with due date tracking
- **Notification System**: Email and WhatsApp reminders for due dates
- **Admin Dashboard**: Comprehensive admin controls and reporting
- **OTP Authentication**: Secure email-based OTP verification
- **Payment Integration**: Handle library fees and fines
- **Subscription Management**: Manage library memberships

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** for authentication
- **Nodemailer** for email services
- **Swagger** for API documentation

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation

### DevOps
- **Docker** for containerization
- **Nginx** for reverse proxy
- **Docker Compose** for orchestration

## Project Structure

```
LibraryMate/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middlewares
│   │   └── services/      # Business logic
│   ├── prisma/           # Database schema and migrations
│   └── utils/            # Utility functions
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Frontend utilities
│   └── public/           # Static assets
└── nginx/             # Nginx configuration
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker and Docker Compose (for containerized deployment)

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LibraryMate
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Update .env with your database and email credentials
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npm run seed
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

### Production Deployment with Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/librarymate"
JWT_SECRET="your-jwt-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
WHATSAPP_API_KEY="your-whatsapp-api-key"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:5000/api"
```

## API Documentation

The API documentation is available via Swagger UI when the backend server is running:
- Development: `http://localhost:5000/api-docs`
- Production: `https://your-domain.com/api-docs`

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run seed` - Seed the database with sample data
- `npm run migrate` - Run database migrations

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.