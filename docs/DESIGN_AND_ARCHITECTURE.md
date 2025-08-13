# Design & Architecture

This document outlines the project's file structure, data flow, and the key design principles that guide its development.

## File Structure

The project is organized into two primary folders: `backend` and `frontend`.

```
/
├── backend                        # The Node.js server and API
│   ├── controllers                # Contains the business logic for API endpoints
│   │   └── upgradeController.js   # Logic for handling upgrades and fetching available ones
│   ├── database                   # Database connection setup
│   │   └── supabaseClient.js      # Supabase client initialization
│   ├── models                     # Defines the Sequelize database models
│   │   ├── Upgrade.js             # Model for a user's in-progress upgrade
│   │   ├── UserEconomy.js         # Model for user's economy data
│   │   └── index.js               # Sequelize setup and model imports
│   ├── routes                     # Defines the API endpoints for the server
│   │   ├── userEconomy.js         # API for managing economy status and updates
│   │   ├── userBaseData.js        # API for managing user's base data
│   │   └── upgrades.js            # Main API for managing user's base data
│   └── server.js                  # Main Express server entry point
└── frontend                       # The React frontend application
    ├── src                        # Main source code for the React app
    │   ├── components             # Reusable UI components
    │   │   ├── AvailableUpgrades.jsx  # Displays a list of available upgrades
    │   │   ├── BaseInput.jsx          # A form component for defense level inputs
    │   │   ├── EconomyTab.jsx         # Shows the user's current resources and builder count
    │   │   └── UserInputForm.jsx      # A form to add or update a defense in the base
    │   ├── pages                  # Top-level components for each view/page
    │   │   ├── BaseInputPage.jsx      # Page for initial base setup
    │   │   ├── HomePage.jsx           # Main user dashboard after login
    │   │   ├── Login.jsx              # User login form
    │   │   ├── ProfileTab.jsx         # User profile and base management page
    │   │   ├── SignUp.jsx             # User registration form
    │   │   ├── UserEconomySettings.jsx # Page to modify user's economy variables
    │   │   └── index.js               # Exports page components for easy import
    │   ├── utils                     # Utility functions
    │   │   └── economyUtiles.js      # Contains functions for economy calculations like discounts
    │   ├── App.jsx                # The main application component and router
    │   ├── client.js              # Supabase client setup for the frontend
    │   └── main.jsx               # The React application's entry point
    └── ...                        # Other frontend files (index.html, package.json, etc.)
```

## Data Flow

The backend logic is centralized in the `upgradeController.js` file, which is called by the various routes in the `routes` directory. The main flow for an upgrade request is as follows:

1.  **Frontend Request**: A user clicks to start an upgrade. The React frontend sends a `POST` request to the `/api/user-economy/start-upgrade` endpoint on the Node.js backend.
2.  **Route Handling**: The `userEconomy.js` route receives the request and calls the `startUpgrade` function from the `upgradeController`.
3.  **Controller Logic**: The `startUpgrade` function performs the core logic:
    * It fetches the user's economy data to check for sufficient resources and the gold pass status.
    * It calculates the final cost, applying a 20% discount if the user has the gold pass.
    * It deducts the cost from the user's resources and updates the `user_economy` table.
    * It checks the user's `user_base_data` to see if the defense instance already exists.
    * If the defense exists, it updates the `current_level` in the `user_base_data` table.
    * If the defense does not exist (a new one is being built), it inserts a new row into the `user_base_data` table.
4.  **Response**: The controller sends a JSON response back to the frontend, indicating success or failure.

Similarly, the `getAvailableUpgrades` function in the `upgradeController` determines which defenses can be upgraded or built based on the user's current Town Hall level and existing defenses by querying the `user_base_data` and `defense_upgrades` tables.

## Design Patterns & Principles

-   **Model-View-Controller (MVC)**: The project's backend follows a clear MVC pattern.
    -   **Model**: The Sequelize models and database interaction logic.
    -   **View**: The React frontend serves as the View.
    -   **Controller**: The Express routes and controller functions (`upgradeController.js`).
-   **Separation of Concerns**: Database connections, API routes, and business logic are all separated into their own dedicated files.
-   **Single Responsibility Principle (SRP)**: Each file and function has a single, well-defined purpose, such as `startUpgrade` focusing only on processing a single upgrade.