# Collaborative Task Manager

A full-stack web application for managing tasks with user authentication, role-based access control, and real-time updates.

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

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

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

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks (paginated)
- `GET /api/tasks/assigned` - Get tasks assigned to current user
- `GET /api/tasks/created` - Get tasks created by current user (managers only)
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task (managers only)
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task (managers only)

### Activities
- `GET /api/activities` - Get all activity logs (paginated)
- `GET /api/activities/task/:taskId` - Get activity logs for a specific task

### Users
- `GET /api/users` - Get all users (managers only)

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

