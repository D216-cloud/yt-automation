console.log('Starting both frontend and backend servers...');

// This is a placeholder script. In a real implementation, you would use
// concurrently or a similar package to run both servers simultaneously.
// For now, we'll just log instructions.

console.log(`
To run both servers:

1. In one terminal, start the frontend:
   cd ..
   npm run dev

2. In another terminal, start the backend:
   cd backend
   npm run dev

Both servers should now be running:
- Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8080'}
- Backend: ${process.env.BACKEND_URL || 'http://localhost:5000'}
`);