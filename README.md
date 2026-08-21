# Expense Tracker Pro

A MERN expense tracker with live CRUD operations, analytics, categories, search, filters, sorting, settings, and responsive layouts.

## Project Structure

- `backend` - Express, Mongoose, and MongoDB API
- `frontend` - React and Vite application

## Local Setup

### Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `PORT`, and `CLIENT_URL`.

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the backend is not running on the default URL.

```bash
npm run dev
```

The Vite app runs on `http://localhost:5173` by default.

## Validation

Run the frontend production build before deployment:

```bash
cd frontend
npm run build
```

Check the backend syntax:

```bash
cd backend
node --check server.js
```

## Deployment

- Deploy `backend` as a Node service using `npm install` and `npm start`.
- Set backend `MONGO_URI`, `PORT`, and `CLIENT_URL` environment variables.
- Deploy `frontend` as a Vite static site using `npm run build` with `dist` as the publish directory.
- Set frontend `VITE_API_URL` to the deployed backend URL.
- Keep `.env` files out of version control.
