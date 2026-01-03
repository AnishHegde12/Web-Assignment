# Collaborative Task Manager

A full-stack web application for managing tasks with user authentication, role-based access control, and real-time updates.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Web Assignment"
   ```

2. Follow the setup instructions for backend and frontend.

## Features

### Core Features

- **User Authentication**: JWT-based signup and login system
- **Role-Based Access Control (RBAC)**:
  - **Manager**: Can create, assign, edit, and delete tasks
  - **User**: Can view and update the status of assigned tasks
- **Task Management**:
  - Create, read, update, and delete tasks
  - Task status tracking (pending, in-progress, completed)
  - Priority levels (low, medium, high)
  - Due dates
  - Task assignment to users
- **Dashboard**: Overview of assigned and created tasks
- **Activity Logs**: Track all task changes and modifications
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

### Bonus Features

- **Real-time Updates**: WebSocket integration for live task updates using Socket.io
- **Drag-and-Drop**: Change task status by dragging tasks between columns
- **Pagination**: Optimized API performance with pagination for task lists

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS 3
- React Router v6
- Axios for API calls
- Socket.io-client for real-time communication
- react-beautiful-dnd for drag-and-drop functionality
- React Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for WebSocket support
- express-rate-limit for API rate limiting
- bcryptjs for password hashing

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Task.js          # Task model
│   │   └── Activity.js      # Activity log model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── tasks.js         # Task CRUD routes
│   │   ├── activities.js    # Activity log routes
│   │   └── users.js         # User list routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── server.js            # Express server setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js         # Main layout component
│   │   │   ├── PrivateRoute.js   # Protected route wrapper
│   │   │   ├── TaskCard.js       # Task card component
│   │   │   └── TaskForm.js       # Task create/edit form
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Authentication context
│   │   │   └── ThemeContext.js   # Dark mode context
│   │   ├── pages/
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Signup.js         # Signup page
│   │   │   ├── Dashboard.js      # Dashboard page
│   │   │   └── TaskManagement.js # Task management page
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. Start MongoDB (if running locally):
   ```bash
   # On Windows
   mongod

   # On macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

5. Start the backend server:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

   The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (optional):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Usage

### Creating an Account

1. Navigate to the signup page
2. Fill in your name, email, password, and select a role (user or manager)
3. Click "Sign up"

### Logging In

1. Navigate to the login page
2. Enter your email and password
3. Click "Sign in"

### Manager Features

- Create new tasks and assign them to users
- Edit and delete tasks you created
- View all tasks you created or are assigned to
- View user list for task assignment

### User Features

- View tasks assigned to you
- Update task status (pending → in-progress → completed)
- Use drag-and-drop to change task status
- View task details and due dates

### Dark Mode

Click the moon/sun icon in the navigation bar to toggle between light and dark themes. Your preference is saved in localStorage.

## Sample Login Credentials

For testing purposes, you can create accounts or use the following test accounts:

- **Manager Account**:
  - Email: manager@example.com
  - Password: password123

- **User Account**:
  - Email: user@example.com
  - Password: password123

(Note: These are for development only. In production, use strong passwords.)

## API Documentation

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request
- 409: Conflict

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized

#### GET /api/auth/me
Get current authenticated user info.

**Headers:**
- Authorization: Bearer <jwt_token>

**Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Tasks

#### GET /api/tasks
Get all tasks with pagination. Managers see tasks they created, users see assigned tasks.

**Query Parameters:**
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)

**Headers:**
- Authorization: Bearer <jwt_token>

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2023-12-31",
      "assignedTo": "user_id",
      "createdBy": "manager_id",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

#### POST /api/tasks
Create a new task (managers only).

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "dueDate": "2023-12-31",
  "assignedTo": "user_id"
}
```

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": { ... }
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden

#### PUT /api/tasks/:id
Update a task. Managers can update any field, users can only update status.

**Request Body (managers):**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "low",
  "dueDate": "2023-12-31",
  "assignedTo": "user_id"
}
```

**Request Body (users):**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": { ... }
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found

#### DELETE /api/tasks/:id
Delete a task (managers only, tasks they created).

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found

### Activities

#### GET /api/activities
Get activity logs with pagination.

**Query Parameters:**
- page (optional): Page number
- limit (optional): Items per page

**Response (200):**
```json
{
  "activities": [
    {
      "id": "activity_id",
      "taskId": "task_id",
      "userId": "user_id",
      "action": "created",
      "details": "Task created",
      "timestamp": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Users

#### GET /api/users
Get all users (managers only).

**Response (200):**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  ]
}
```

## Code Comments & Inline Documentation

The codebase includes meaningful comments to help new developers understand the logic:

### Backend Comments
- **server.js** (line 1):
  ```javascript
  // Main server file for the Task Manager application
  // Sets up Express server, MongoDB connection, Socket.io for real-time updates, and API routes
  ```
- **routes/tasks.js** (line 9):
  ```javascript
  // Helper function to log task-related activities for audit purposes
  ```

### Frontend Comments
- **TaskCard.js** (line 5):
  ```javascript
  // Function to determine the color class for priority badges based on priority level
  ```

These comments provide context for complex logic and help maintain code readability.

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- API rate limiting (100 requests per 15 minutes)
- Protected routes on frontend
- CORS configuration

## Real-time Features

The application uses WebSockets (Socket.io) to provide real-time updates:
- When a task is created, assigned users receive instant notifications
- Task updates are reflected immediately for all relevant users
- Task deletions are broadcasted in real-time

## State Management

The application uses React Context API for state management:
- **AuthContext**: Manages user authentication state
- **ThemeContext**: Manages dark mode preference

## Design Choices

1. **MongoDB over PostgreSQL**: Chosen for flexibility in schema design and ease of development
2. **React Context API over Redux**: Sufficient for this application's state management needs
3. **Tailwind CSS**: Rapid UI development with utility-first CSS
4. **Socket.io**: Reliable WebSocket library with fallback support
5. **react-beautiful-dnd**: Popular and well-maintained drag-and-drop library

## Future Enhancements

- Email notifications for task assignments
- Task comments and collaboration features
- File attachments for tasks
- Advanced filtering and search
- Task templates
- Calendar view for tasks
- User profiles and avatars
- Activity feed on dashboard

## Deployment

### Backend Deployment

1. Set environment variables for production:
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-secure-jwt-secret
   FRONTEND_URL=your-frontend-url
   ```

2. Build and start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Serve the `build` folder using a static server (e.g., Nginx, Apache, or Vercel/Netlify).

For detailed deployment guides, refer to the hosting provider's documentation.

## Troubleshooting

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### CORS Issues

If you encounter CORS errors:
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### WebSocket Connection Issues

- Ensure Socket.io server is running on the backend
- Check that `REACT_APP_SOCKET_URL` matches your backend URL
- Check browser console for connection errors

## License

This project is created for assessment purposes.

## Contact

For questions or issues, please refer to the project documentation or contact the development team.

