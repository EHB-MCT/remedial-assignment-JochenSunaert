# Getting Started (updated)

Follow these steps to get the project running locally.

## Prerequisites

* **Node.js**: v18+ recommended.
* **Supabase Project**: Create a Supabase project and create the required tables as described in  `DATABASE_SCHEMA.md`.
* **Supabase Credentials**: You will need:

  * Supabase Project URL
  * Supabase anon/public key

> **Security note:** The `anon` key is intended for client-side use but **do not** commit any `.env` files or secrets to the repo. Use local `.env` files and add them to `.gitignore`.

---

## Install & setup

1. Clone the repository:

```bash
git clone https://github.com/EHB-MCT/remedial-assignment-JochenSunaert.git
```

2. Install dependencies:

```bash
# frontend
cd frontend
npm install

# backend (open a new terminal or return later)
cd ../backend
npm install
```

3. Backend env file
   Create a `.env` file in `backend/` (never commit it):

`backend/.env`

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3001
```

4. Frontend Supabase client (two options)

### Option A — Quick (paste client file)

Create `frontend/src/client.js` and paste the following (works immediately but exposes keys in source):

```js
// frontend/src/client.js (quick)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-url';
const supabaseKey = 'your key';
export const supabase = createClient(supabaseUrl, supabaseKey);
```
---

### Option B — Recommended: use Vite env variables (secure & standard)

Use environment variables in the frontend via Vite. Steps:

1. Create `frontend/.env.local` (this file **must** be in `.gitignore`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Use this `frontend/src/client.js`:

```js
// frontend/src/client.js (recommended - uses Vite env)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL/KEY missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

3. Ensure `frontend/.gitignore` includes:

```
.env
.env.local
.env.*.local
```

This approach keeps keys out of the repo and follows Vite conventions.

---

## Run the app

You need two terminal windows.

**Backend**

```bash
cd backend
node server.js
# or if you have nodemon installed:
# npx nodemon server.js
```

Backend will listen on `http://localhost:3001` (or `PORT` from `.env`).

**Frontend**

```bash
cd frontend
npm run dev
```

Frontend (Vite) runs at `http://localhost:5173` by default.

---

## Quick sanity checks

* Healthcheck:

```bash
curl http://localhost:3001/api/healthcheck
# should return: {"status":"ok"}
```

* Fetch economy (replace `userId` with a real id):

```bash
curl "http://localhost:3001/api/economy/status?userId=<user-id>"
```

* Get available upgrades:

```bash
curl "http://localhost:3001/api/upgrades/available?userId=<user-id>"
```

If any response returns 500, check backend console for errors and confirm `backend/.env` has correct Supabase credentials.

---

## Troubleshooting tips

* If frontend modules fail to load (404/Loading failed for the module) verify:

  * Files exist at the paths your imports reference.
  * Component filenames match exactly (case-sensitive on some OSes).
  * `frontend/src/client.js` is present and exported correctly.

* CORS: Backend uses `cors()` by default. If requests fail from the browser, check console/network—ensure your frontend origin ([http://localhost:5173](http://localhost:5173)) is allowed by Supabase Row Level Security and your Supabase policies if applicable.

* Database errors: If you see Supabase errors like `PGRST116` (no rows found), your code may need to handle "no rows" cases — this is expected sometimes and should not crash the server.

---

## Notes for maintainers / future improvements

* **Do not commit** real keys into the repo. Use `.env` files locally and CI secrets for automated deployments.
* For production, consider a server-side-only key for privileged operations and keep client with `anon` key only.
* Keep `frontend/.env.local` in `.gitignore`.
* Add a `README.dev.md` that documents these local steps for new contributors.

---
