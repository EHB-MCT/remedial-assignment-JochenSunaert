

# Clash of clans Web Simulation: A Resource Management Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![Game: Clash of Clans Simulation](https://img.shields.io/badge/Game-Clash%20of%20Clans-blue?style=flat)](https://supercell.com/en/games/clashofclans/)
[![Data Source: CoC Wiki](https://img.shields.io/badge/Data%20Source-Clash%20of%20Clans%20Wiki-lightgrey?style=flat)](https://clashofclans.fandom.com/wiki/Defensive_Buildings/Home_Village)
[![Full-Stack](https://img.shields.io/badge/Full--Stack-Yes-brightgreen?style=flat)]()
[![Web App](https://img.shields.io/badge/Web%20App-Online-orange?style=flat)]()


An application that simulates a resource-based economy, based on [Clash of clans](https://supercell.com/en/games/clashofclans/) focusing on the management of defensive structures and user-driven upgrades. This is a full-stack web application with a **React frontend** and a **Node.js backend**, using a persistent **Supabase database** to track user progress, resources, and building levels.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies](#technologies)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [sources](#Sources)
- [Authors](#authors)

---

## Project Overview

This project is a web-based simulation of a Clash of Clans-style economy. The user manages a "base" of defensive structures, each with a specific level. The central element of the simulation is the **economy**, where users can upgrade their defenses by spending in-game resources (gold and elixir). The system includes core simulation logic, such as:

- **Build Timers**: Upgrades take a specific amount of time to complete.
- **Gold Pass**: A premium in-game item that provides a 20% time and cost discount on upgrades.
- **Builder Count**: The number of builders a user has determines how many upgrades can be performed simultaneously. (1-6 builders)

## Features

for a more detailed list, **[➡️ See the full feature list](./docs/FEATURES.md)**

### **Account Management**

* **Sign-up**: Create a new account with email and password. Email verification is required.
* **Log-in/Log-out**: Securely access and exit your account.
* **Session Persistence**: Your user data and session token are saved locally for a seamless experience.



### **Base & Profile**

* **Edit Base**: You can add or remove defense structures and set their levels.
* **Data Persistence**: All changes to your base are saved in your profile.



### **Economy**

* **Resource Collection**: Collect Gold and Elixir, up to a set maximum capacity.
* **Gold Pass**: Toggle a Gold Pass for a **20% discount** on upgrade costs and times.
* **Builder Management**: Set the number of builders you have available for upgrades.
* **Offline Production**: The app calculates and credits you with resources produced while you were away.



### **Upgrades**

* **In-Progress Upgrades**: View a list of your current upgrades with a live countdown.
* **Available Upgrades**: See a list of all upgrades you can currently afford, including new structures you can build.
* **Start Upgrade**: Begin a new upgrade after verifying you have the required resources and an available builder.
* **Complete Upgrade**: Finish an upgrade to update your base and free up your builder.

## Technologies

This project uses a modern JavaScript-based technology stack:

- **Frontend**: **React** for the user interface, with **React Router** for navigation.
- **Backend**: **Node.js** with the **Express** framework, providing a REST API to handle business logic. It uses **Sequelize** as an ORM.
- **Database**: **Supabase**, which provides a **PostgreSQL** database for persistent data storage and handles user authentication.

## Quick Start

### Code 
To get the project running locally, you'll need Node.js and a Supabase project. For full instructions, see the detailed guide:

**[➡️ See the full Getting Started Guide](./docs/GETTING_STARTED.md)**

```bash
# Clone, install dependencies, and run
git clone https://github.com/EHB-MCT/remedial-assignment-JochenSunaert.git


# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up your .env file in /backend, and the /client.js file in the /frontend/src then start the servers
# (in two separate terminals)
# For these files, or for a more detailed setup refer to the full getting started guide

# Terminal 1: Backend
cd backend
nodemon server.js

# Terminal 2: Frontend
cd frontend
npm run dev
```

### App

1. **Create an Account** – Sign up with your email and password.
2. **Set Up Your Base** – Go to the **Edit Base** page and enter your Clash of Clans account data (structures and levels). (most important = townhall level).
3. **Claim Resources** – Collect your starting Gold and Elixir **once** to begin upgrading your base.

### quick test

1. **go to the site** – [click here](https://remedial-assignment-jochen-sunaert.vercel.app/)
2. **Login into the admin account.**  name: Jochen.sunaert@student.ehb.be  testing password: 12345678
3. **navigate through the site** – Collect your  Gold and Elixir and do your upgrades!

## Documentation

All detailed project documentation has been moved to the `/docs` folder.

- **[Getting Started](./docs/GETTING_STARTED.md)**: Full installation and setup instructions.
- **[Design & Architecture](./docs/DESIGN_AND_ARCHITECTURE.md)**: Information on the file structure, data flow, and design patterns.
- **[Database Schema](./docs/DATABASE_SCHEMA.md)**: Details on the Supabase (PostgreSQL) tables.
- **[API Reference](./docs/API_REFERENCE.md)**: A complete reference for all backend API endpoints.
- **[Conventions & Standards](./docs/CONVENTIONS.md)**: Project conventions for code, naming, and commits.
- **[Project Roadmap](./docs/ROADMAP.md)**: Future plans and features for the project.
- **[Attributions](./docs/ATTRIBUTIONS.md)**: use of attributions or sources.
- **[USE_OF_AI](./docs/ATTRIBUTIONS.md)**: extra information about where AI was used.
- **[Features](./docs/FEATURES.md)**: extra videos and explenations about the different features.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) to get started. Also, be sure to review our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Sources 

for more information or sources of this project, go to the - **[Attributions page](./docs/ATTRIBUTIONS.md)**.
## Authors

- [@Jochen Sunaert](https://github.com/JochenSunaert).

### Guidance
- Special thanks to **Everaert Jan** for guidance for this assignment.
