# YTB Pulse Pro Backend (MERN Stack)

This is the backend API for the YTB Pulse Pro application, built with Node.js, Express, and MongoDB.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running on your system

3. Start the development server:
   ```
   npm run dev
   ```

The server will start on port 5000.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get a specific video
- `POST /api/videos` - Create a new video
- `PUT /api/videos/:id` - Update a video
- `DELETE /api/videos/:id` - Delete a video

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ytbpulsepro
JWT_SECRET=ytbpulseprosecretkey
```