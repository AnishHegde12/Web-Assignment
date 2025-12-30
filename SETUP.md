# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

## Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start MongoDB (if local):
```bash
mongod
```

Start backend:
```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

## First Steps

1. Create a manager account (select "Manager" role during signup)
2. Create a user account (select "User" role)
3. Login as manager and create tasks
4. Login as user to see assigned tasks

