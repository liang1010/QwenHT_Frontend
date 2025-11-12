# QwenHT Frontend

This is the Angular frontend for the QwenHT Identity Management System.

## Features

- Login/Registration forms
- Dashboard with user information and roles
- User management interface (for Admin users)
- Role management interface (for Admin users)
- JWT-based authentication
- Responsive UI with Bootstrap

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running

## Setup

1. Navigate to the project directory
2. Install dependencies:
   ```
   yarn install
   ```
3. Start the development server:
   ```
   yarn start
   ```
4. The application will be available at `http://localhost:4200`

## Configuration

- API endpoints are configured in `src/environments/environment.ts`
- By default, the frontend expects the backend API at `https://localhost:5001`

## Development

- The Angular app is built with standalone components
- Authentication is handled via JWT tokens stored in localStorage
- The app uses the Angular Router for navigation
- HTTP requests are made using the Angular HttpClient

## Building for Production

To build the application for production:

```
yarn run build
```

The built files will be in the `dist/` directory and can be served by any static web server.

## Integration with Backend

This frontend is designed to work with the QwenHT backend API. Make sure the backend is running before using the frontend application.