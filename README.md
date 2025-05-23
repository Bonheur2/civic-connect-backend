# Civic Connect Backend

A backend system for managing citizen complaints and engagement with government agencies.

## Features

- User authentication and authorization (Citizens, Agencies, Admins)
- Complaint submission and management
- Status tracking for complaints
- Role-based access control
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd civic-connect-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/civic-connect
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update user profile

### Complaints

- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints` - Get all complaints (with filtering)
- `GET /api/complaints/:id` - Get a specific complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `POST /api/complaints/:id/comments` - Add comment to complaint

## User Roles

1. Citizen
   - Can submit complaints
   - Can view their own complaints
   - Can add comments to their complaints

2. Agency
   - Can view complaints assigned to them
   - Can update complaint status
   - Can add comments to assigned complaints

3. Admin
   - Full access to all complaints
   - Can assign complaints to agencies
   - Can manage users

## Development

The project uses TypeScript for type safety and better development experience. The main development files are in the `src` directory.

### Project Structure

```
src/
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
└── index.ts        # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm test` - Run tests

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- CORS enabled
- Helmet security headers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request #   c i v i c - c o n n e c t - b a c k e n d  
 