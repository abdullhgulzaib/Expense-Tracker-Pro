# Expense Tracker Pro — Backend API

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — Copy `.env.example` to `.env` and fill in:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` — MongoDB Atlas connection string
   - `PORT` — Backend port (default: 5000)
   - `CLIENT_URL` — Frontend URL (for CORS)

3. **Run**
   ```bash
   npm run dev      # Development (with nodemon)
   npm start        # Production
   ```

---

## API Routes

### Health Check
- `GET /health` — Backend status

### Expense CRUD (6 routes)
- `POST /expenses` — Create expense
- `GET /expenses` — List all (sorted by date, newest first)
- `GET /expenses/search?search=<query>` — Search by title or category (case-insensitive)
- `GET /expenses/:id` — Get single expense
- `PUT /expenses/:id` — Update expense
- `DELETE /expenses/:id` — Delete expense

### Analytics (3 routes)
- `GET /analytics/summary` — Total, highest, average, count
- `GET /analytics/by-category` — Sum + count per category
- `GET /analytics/monthly-trend` — Last 6 months grouped by month

---

## Expense Schema

```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "amount": "Number (required, min: 0)",
  "category": "String (enum: Food, Shopping, Travel, Bills, Health, Education, ...)",
  "date": "Date (required)",
  "paymentMethod": "String (enum: Card, Cash, Bank Transfer, Auto-debit, ...)",
  "notes": "String (optional)",
  "status": "String (enum: Completed, Pending)",
  "userId": "ObjectId (nullable, for Phase 2 auth)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Error Handling

- All endpoints return `{ error: "message" }` on failure (HTTP 500)
- Each controller function has its own try/catch
- No centralized error middleware — matches Postman-tested patterns

---

## Architecture

- **ES Modules** — `import`/`export`, no `require()`
- **Schema/Model split** — `schema.js` (definitions) + `models.js` (compilation)
- **Inline routes** — All routes declared in `server.js`, no `routes/` folder
- **Mongoose ODM** — MongoDB Atlas with aggregation pipelines for analytics

---

## Deployment (Render)

1. Connect GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Set env vars: `MONGO_URI`, `PORT`, `CLIENT_URL` (Vercel URL)

---

## Testing

Use Postman to test all 9 routes before connecting frontend. See Day 2–3 test cases in project plan.
