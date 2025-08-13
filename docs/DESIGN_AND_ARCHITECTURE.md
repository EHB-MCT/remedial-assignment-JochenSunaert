# **Design & Architecture**

This document provides an in-depth look at the project's architecture, including the file structure, data flow, and design principles guiding its development.

---

## **File Structure**

The project is divided into **backend** (Node.js/Express API with Supabase + Sequelize) and **frontend** (React application).
It follows **MVC** on the backend and **component-based architecture** on the frontend.

```
/
├── backend                        # Node.js server and API logic
│   ├── controllers                # Business logic layer, bridges routes and services
│   │   └── upgradeController.js   # Handles upgrade requests, availability checks, and economy interactions
│   ├── database                   # Database connection and static data storage
│   │   ├── tables/defense         # CSV-based defense data for initial imports or reference
│   │   │   ├── cannon.csv         # Data columns for cannon upgrades in `defense_upgrades` table
│   │   │   └── ...                # Other defenses (archer tower, wizard tower, etc.)
│   │   └── supabaseClient.js      # Initializes and exports a Supabase client for DB interactions
│   ├── models                     # Sequelize models mapping to DB tables
│   │   ├── Upgrade.js             # Represents an in-progress upgrade (defense type, start/end time, etc.)
│   │   └── UserEconomy.js         # Stores user's gold, elixir, dark elixir, builder count, gold pass status
│   ├── repositories               # Data access layer (queries + persistence logic)
│   │   └── upgradeRepository.js   # Handles all DB reads/writes related to upgrades; throws on hard errors
│   ├── routes                     # Express routes exposing API endpoints
│   │   ├── userEconomy.js         # Endpoints for getting/updating user economy state
│   │   ├── userBaseData.js        # Endpoints for managing defense/base level data
│   │   ├── economy.js             # Economy utilities (e.g., reset, batch updates)
│   │   └── upgrades.js            # Endpoints for starting, completing, and listing upgrades
│   ├── services                   # Application service layer for orchestration + business rules
│   │   └── upgradeService.js      # Economy calculations, builder availability checks, upgrade validation
│   ├── utils                      # Backend utility/helper functions
│   │   ├── economy.js             # Shared economy logic (cost calculations, resource validation)
│   │   ├── strings.js             # String manipulation + localization helpers
│   │   └── time.js                # Time-related utilities (upgrade durations, countdowns)
│   ├── server.js                  # Express app entry point: middleware, routing, error handling
│   └── .env                       # Environment variables (Supabase keys, port configs, etc.)

└── frontend                       # React SPA for user interaction
    ├── src
    │   ├── components             # Reusable, isolated UI pieces
    │   │   ├── AvailableUpgrades          # Lists current possible upgrades
    │   │   │   ├── AvailableList.jsx      # Renders upgrade list items
    │   │   │   ├── AvailableUpgrades.jsx  # Parent component fetching/updating available upgrades
    │   │   │   ├── InProgressList.jsx     # Displays ongoing upgrades with timers
    │   │   │   ├── UpgradeItem.jsx        # Displays a single upgrade (cost, time, level)
    │   │   │   ├── useAvailableItem.js    # Hook for managing available upgrade state
    │   │   │   └── utils.js               # UI-specific utility functions
    │   │   ├── BaseInput                  # Town Hall/base defense input form
    │   │   │   └── BaseInput.jsx          # Controlled input fields for defense levels
    │   │   ├── EconomyTab                 # Displays resources + builder count
    │   │   │   └── EconomyTab.jsx         # Fetches and renders user's economy status
    │   │   ├── UserInputForm              # General form for adding/updating defenses
    │   │   │   └── UserInputForm.jsx
    │   │   └── UserEconomySettings        # Economy configuration UI
    │   │       ├── constants.js           # Static constants (resource names, caps, etc.)
    │   │       ├── ResourceCard.jsx       # Card component showing single resource
    │   │       ├── UserEconomySettings.jsx# Parent form for adjusting economy
    │   │       ├── useUserEconomySettings.js # Hook for economy state handling
    │   │       └── utils.js               # Utility functions for economy form
    │   ├── pages                  # Full-screen views
    │   │   ├── authentication
    │   │   │   ├── index.js              # Barrel export for auth pages
    │   │   │   ├── Login.jsx              # Login form UI + Supabase auth calls
    │   │   │   └── SignUp.jsx             # Registration form UI + Supabase signup calls
    │   │   ├── BaseInputPage.jsx          # Step for initial defense setup
    │   │   ├── HomePage.jsx               # Main dashboard after login
    │   │   └── ProfileTab.jsx             # Displays/upgrades user profile and defenses
    │   ├── utils
    │   │   └── economyUtiles.js           # Client-side economy calculations (discounts, capacity checks)
    │   ├── App.jsx                        # React router + global layout wrapper
    │   ├── client.js                      # Supabase client initialization for frontend
    │   └── main.jsx                       # React app entry point
    └── public / package.json / etc.       # Static assets + frontend configuration

└── docs                       # folder for extra documentations
```

---

## **Data Flow**

**Upgrade initiation example:**

1. **User Action (Frontend)**

   * Player clicks an upgrade button in `AvailableUpgrades.jsx`.
   * Sends a `POST` request to `/api/user-economy/start-upgrade`.

2. **Routing Layer (Backend)**

   * `userEconomy.js` route calls `upgradeController.startUpgrade()`.

3. **Controller Logic**

   * Fetches economy data (`UserEconomy` model via repository).
   * Checks resource sufficiency & builder availability.
   * Applies discounts (e.g., Gold Pass -20%).
   * Deducts resources, updates `user_economy` table.
   * Updates or inserts into `user_base_data` table (via repository).

4. **Service Layer**

   * `upgradeService.js` calculates final cost, validates rules (e.g., no concurrent same-defense upgrades).
   * Returns updated state to controller.

5. **Repository Layer**

   * Executes Sequelize queries to persist changes.

6. **Response to Frontend**

   * JSON with success status, updated economy, and in-progress upgrades.

**Available upgrades check:**

* Triggered on dashboard load or after upgrade completion.
* Queries `user_base_data` + `defense_upgrades` to filter what’s available based on:

  * Town Hall level
  * Current defense levels
  * Max levels per TH

---

## **Design Patterns & Principles**

* **MVC (Backend)**:

  * **Model** → Sequelize models.
  * **View** → Frontend React components (SPA).
  * **Controller** → `upgradeController.js` + route handlers.

* **Separation of Concerns**:

  * **Backend**: Controllers handle orchestration, repositories handle DB queries, services enforce business rules.
  * **Frontend**: Components are small, reusable, and state management is handled by hooks.

* **SRP (Single Responsibility Principle)**:

  * Each module handles exactly one responsibility (e.g., `economy.js` only does economy calculations).

* **API-First Design**:

  * All backend logic exposed via RESTful endpoints; frontend only interacts through APIs.

* **Scalability in Mind**:

  * Repositories allow easy swap of DB provider.
  * Clear separation allows future migration to microservices if needed.

