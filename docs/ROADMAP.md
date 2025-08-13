# Project Roadmap

This document outlines the current state, recent work, and the planned direction of the project.

---

## 1. Recent Progress

Based on recent commits, the following have been implemented or significantly improved:

* **Documentation Overhaul**

  * Split `README.md` into multiple structured documents for easier navigation and maintainability.
  * Expanded **Getting Started** guide with full environment setup, Supabase config, and frontend/backend run instructions.
  * Added `DATABASE_SCHEMA.md` and `API_REFERENCE.md` for backend table structures and API endpoints.
  * Added inline JSDoc comments and code-level notes to improve maintainability in files like `HomePage.jsx`.

* **User Economy Refactor**

  * Restructured economy-related files into a dedicated folder.
  * Added constants for economy rates and caps for easier tuning.
  * Updated all imports to match the new structure.

* **Frontend Comments & Clarity**

  * Added detailed comments explaining routing, callbacks, and UX flow.
  * Improved code readability for future contributors.

---

## 2. Current Features

* **User Authentication**: Secure login and registration using Supabase.
* **Dynamic Base Management**: Create, update, and manage base layouts with upgradeable defensive structures.
* **Simulated Economy**: Tracks resources (gold, elixir), builder count, and gold pass status.
* **Upgrade System**: Dynamic costs and timers for structure upgrades.
* **Real-time Data Persistence**: Data stored in Supabase and synced across sessions.
* **Responsive UI**: Modular React frontend designed for desktop and mobile.
* **Developer Documentation**: Clear setup guides, API references, and schema docs for quick onboarding.

---

## 3. Short-Term Goals


* **UI/UX Polish**
  Add animations, improve layout responsiveness, and refine the overall visual design.

* **Error Handling & Feedback**
  Show clear in-app messages for common errors like resource shortages or busy builders.

---

## 4. Mid-Term Goals

* **Expanded Economy**
  Add new resources (e.g., Dark Elixir) and enable market trading or purchases.

* **Data Visualization**
  Implement a dashboard with charts and graphs for progress tracking and advanced economy insights.

* **Social Features**
  Add the ability to view other users’ bases and introduce leaderboards.

---

## 5. Long-Term Goals

* **Attack/Defense Simulation**
  Introduce basic combat mechanics to test base layouts.

* **Gamification**
  Add achievements, daily quests, and reward systems to increase engagement.

* **Full TypeScript Migration**
  Convert both frontend and backend to TypeScript for stronger type safety.
