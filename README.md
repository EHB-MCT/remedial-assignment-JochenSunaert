# Economy Simulation: A Resource Management Game

An application that simulates a resource-based economy, focusing on the management of defensive structures and user-driven upgrades. This is a full-stack web application with a **React frontend** and a **Node.js backend**, using a persistent **Supabase database** to track user progress, resources, and building levels. The core of the application lies in its simulation logic, where an economic system drives the in-game progression and strategic decisions.

-----

## Table of Contents

1.  [Project Overview](https://www.google.com/search?q=%231-project-overview)
2.  [Features](https://www.google.com/search?q=%232-features)
3.  [Technologies](https://www.google.com/search?q=%233-technologies)
4.  [Getting Started](https://www.google.com/search?q=%234-getting-started)
5.  [File Structure](https://www.google.com/search?q=%235-file-structure)
6.  [Database Schema](https://www.google.com/search?q=%236-database-schema)
7.  [Design & Architecture](https://www.google.com/search?q=%237-design--architecture)
8.  [API Reference](https://www.google.com/search?q=%238-api-reference)
9.  [Conventions & Standards](https://www.google.com/search?q=%239-conventions--standards)
10. [Contributing](https://www.google.com/search?q=%2310-contributing)
11. [Roadmap](https://www.google.com/search?q=%2311-roadmap)
12. [License](https://www.google.com/search?q=%2312-license)
13. [Authors](https://www.google.com/search?q=%2313-authors)

-----

## 1\. Project Overview

This project is a web-based simulation of a Clash of Clans-style economy. The user manages a "base" of defensive structures, each with a specific level. The central element of the simulation is the **economy**, where users can upgrade their defenses by spending in-game resources (gold and elixir). The system includes core simulation logic, such as:

  * **Build Timers**: Upgrades take a specific amount of time to complete.
  * **Gold Pass**: A premium in-game item that provides a time and cost discount on upgrades.
  * **Builder Count**: The number of builders a user has determines how many upgrades can be performed simultaneously.

Data persistence is handled by **Supabase**, a PostgreSQL-based backend-as-a-service, which stores user authentication, base layouts, and economy data. The frontend is built with **React**, providing a responsive and interactive user experience.

-----

## 2\. Features

  * **User Authentication**: Secure user login and registration using Supabase.
  * **Dynamic Base Management**: Users can create, update, and manage their base layouts by adding and leveling up various defensive structures.
  * **Simulated Economy**: Tracks in-game resources (gold, elixir), builder count, and the user's gold pass status.
  * **Upgrade System**: Users can view available upgrades for their defenses and initiate them, with costs and timers dynamically calculated.
  * **Real-time Data Persistence**: All user and economy data is stored persistently in a Supabase database, ensuring progress is saved across sessions.
  * **Responsive UI**: A modular React frontend designed for a seamless user experience.

-----

## 3\. Technologies

This project uses a modern JavaScript-based technology stack:

  * **Frontend**: **React** for the user interface, with **React Router** for navigation.
  * **Backend**: **Node.js** with the **Express** framework, providing a REST API to handle business logic and database interactions. It uses **Sequelize** as an ORM.
  * **Database**: **Supabase**, which provides a **PostgreSQL** database for persistent data storage and handles user authentication.

-----

## 4\. Getting Started

Follow these steps to get the project running locally.

### Prerequisites

  * **Node.js**: The project's backend and build tools require Node.js.
  * **Supabase Project**: A new Supabase project is needed. You must create the required tables (`user_base_data`, `user_economy`, etc.) as outlined in the Database Schema section.
  * **Supabase Credentials**: Your Supabase URL and `anon` key are required.

### Installation

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install dependencies for the frontend and backend:
    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install
    ```
4.  Create a `.env` file in the **backend** directory root and add your Supabase credentials:
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
    PORT=3001
    ```

### Running the Application

To start the backend server:

```bash
cd backend
node server.js
```

To start the frontend application: (open a secondary terminal)

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

-----

## 5\. File Structure

The project is organized into two primary folders: `backend` and `frontend`. The React application lives inside the `frontend` folder, which contains the `src` directory.

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
│   │   └── userBaseData.js        # API for managing user's base data
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

-----

## 6\. Database Schema

The application uses a Supabase (PostgreSQL) database. The core tables are designed to handle user data, economy status, and upgrade information.

### `user_economy`

This table stores the user's current resources and other economy-related settings.

  * `id` (`uuid`): Primary key.
  * `user_id` (`text`): The unique ID of the user (linked to Supabase Auth).
  * `gold_amount` (`int8`): The current amount of gold the user has.
  * `elixir_amount` (`int8`): The current amount of elixir the user has.
  * `builders_count` (`int2`): The number of builders the user has available.
  * `has_gold_pass` (`boolean`): A flag to indicate if the user has a gold pass.

### `user_base_data`

This table stores the specific defenses a user has placed on their base.

  * `id` (`uuid`): Primary key.
  * `user_id` (`text`): The unique ID of the user.
  * `name` (`text`): The name of the defense instance (e.g., "Cannon \#1", "Town Hall").
  * `current_level` (`int2`): The current level of the defense.
  * `type` (`text`): The defense type.
  * `instance` (`int2`): The defense instance number.

### `defense_upgrades`

This table acts as a central repository for all possible defense upgrades, including costs and requirements.

  * `id` (`uuid`): Primary key.
  * `defense_name` (`text`): The name of the defense type (e.g., "Cannon", "Wizard Tower").
  * `level` (`int2`): The level of the upgrade.
  * `unlocks_at_town_hall` (`int2`): The minimum Town Hall level required to unlock this upgrade.
  * `build_cost` (`int8`): The cost of the upgrade.
  * `build_resource` (`text`): The resource that the upgrade uses (`gold`, `elixir`, `dark_elixir`).
  * `build_time_seconds` (`int8`): The time required for the upgrade to complete, in seconds.

### `user_upgrades`

This table tracks upgrades that are currently in progress for a user.

  * `id` (`uuid`): Primary key.
  * `user_id` (`text`): The unique ID of the user.
  * `defense_id` (`uuid`): A reference to the `defense_upgrades` entry for this upgrade.
  * `upgrade_level` (`int2`): The target level of the upgrade.
  * `started_at` (`timestamptz`): The timestamp when the upgrade started.
  * `finishes_at` (`timestamptz`): The timestamp when the upgrade is scheduled to finish.
  * `status` (`text`): The current status of the upgrade (`in_progress`, `completed`, etc.).

-----

## 7\. Design & Architecture

### Data Flow

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

### Design Patterns & Principles

  * **Model-View-Controller (MVC)**: The project's backend follows a clear MVC pattern, with routes acting as the Controller and controller functions containing the core Model logic. The React frontend serves as the View.
  * **Separation of Concerns**: Database connections, API routes, and business logic are all separated into their own dedicated files.
  * **Single Responsibility Principle (SRP)**: Each file and function has a single, well-defined purpose, such as `startUpgrade` focusing only on processing a single upgrade.

-----

## 8\. API Reference

All endpoints are prefixed with `/api/`.

### General Endpoints

#### `GET /api/healthcheck`

  * **Description**: Checks if the server is running.
  * **Response**:
    ```json
    {"status": "ok"}
    ```

-----

### User Base & Upgrades

#### `GET /api/user-base-data?userId=[Your user ID]`

  * **Description**: Retrieves the full list of a user's defenses and their current levels.
  * **Parameters**: `userId` (query parameter)
  * **Response**: An array of objects.
    ```json
    [{
      "name": "Cannon",
      "current_level": 5
    }]
    ```

#### `GET /api/upgrades/available?userId=[Your user ID]`

  * **Description**: Fetches a list of all available upgrades for a user based on their base and Town Hall level.
  * **Parameters**: `userId` (query parameter)
  * **Response**: An array of objects.
    ```json
    [{
      "defense_instance": "Wizard Tower #4",
      "current_level": 16,
      "available_upgrades": [{
        "id": 92,
        "defense_name": "Wizard Tower",
        "level": 17,
        "unlocks_at_town_hall": 17,
        "build_cost": 20000000,
        "build_time_seconds": 1296000,
        "build_resource": "gold",
        "current_level": 16,
        "status": "not_started"
      }]
    }]
    ```

#### `POST /api/user-economy/start-upgrade`

  * **Description**: Initiates an upgrade for a specific defense.
  * **Parameters**: JSON body (defined in `upgradeController.js`).
  * **Response**: A JSON object indicating success or failure.

-----

### User Economy & Status


#### `GET /api/economy/status?userId=[Your user ID]`

  * **Description**: Provides a comprehensive summary of a user's economy, including current resources, builder count, and calculated totals for all available upgrades.
  * **Parameters**: `userId` (query parameter)
  * **Response**:
    ```json
    {
      "gold_amount": 500000,
      "elixir_amount": 300000,
      "has_gold_pass": true,
      "builders_count": 3,
      "total_gold_needed": 1500000,
      "total_time_seconds": 86400
    }
    ```

#### `POST /api/economy/update`, `POST /api/user-economy/update`, `POST /api/user-economy/status`

  * **Description**: These endpoints are used to update a user's economy data.
  * **Parameters**: JSON body containing `userId`, `has_gold_pass`, `builders_count`, `gold_amount`, and `elixir_amount`.
  * **Response**:
    ```json
    {"success": true}
    ```

-----

## 9\. Conventions & Standards

  * **Naming**: Files, functions, and variables follow **camelCase**. Components are named using **PascalCase**.
  * **Styling**: The project uses External Stylesheets and basic CSS for prototyping.
  * **Modularity**: Code is organized into logical modules with a clear separation of concerns.
  * **Git Commits**: Commit messages follow the Conventional Commits specification (e.g., `feat: add upgrade logic`, `fix: correct gold pass discount`).

-----

## 10\. Contributing

Contributions are welcome\! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature (`git checkout -b feature/new-feature`).
3.  Commit your changes (`git commit -am 'feat: new-feature'`).
4.  Push to the branch (`git push origin feature/new-feature`).
5.  Create a new Pull Request.

-----

## 11\. Roadmap

  * **Implement Advanced Simulation Logic**: Add a worker process to handle the build timers, allowing upgrades to progress even when the user is offline.
  * **Expand Economy**: Introduce new resources and a market system for trading.
  * **Data Visualization**: Add a dedicated dashboard with charts and graphs to visualize user progress and resource generation over time.

-----

## 12\. License

This project is licensed under the MIT License. For more information, see the `LICENSE` file in the repository.

-----

## 13\. Authors

  * [@Jochen Sunaert](https://github.com/JochenSunaert)


## 13\. Acknowledgements

- [Supabase](https://supabase.com/) for the backend database and authentication services.
- [Express.js](https://expressjs.com/) for building the API.
- [Node.js](https://nodejs.org/) for the runtime environment.
- [PostgreSQL](https://www.postgresql.org/) as the database solution.
- [OpenAI ChatGPT](https://openai.com/) for assistance in code generation and debugging.
- [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
- [Awesome README](https://github.com/matiassingers/awesome-readme)
- [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)
- [HUser Authentication (React + Supabase](https://www.youtube.com/watch?v=qj9YexzvzTs&list=PLl6EcvA_AoxEU455Yi1JoYVwHfpHpNkAw)
  
- This project was built with the assistance of Gemini. Its collaborative support was instrumental in debugging, writing, and refining the core logic and user interface.

- Special Thanks to Everaert Jan for guidance for this assignement.