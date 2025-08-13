# Clash of clans Web Simulation: A Resource Management Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


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
- [Authors](#authors)

---

## Project Overview

This project is a web-based simulation of a Clash of Clans-style economy. The user manages a "base" of defensive structures, each with a specific level. The central element of the simulation is the **economy**, where users can upgrade their defenses by spending in-game resources (gold and elixir). The system includes core simulation logic, such as:

- **Build Timers**: Upgrades take a specific amount of time to complete.
- **Gold Pass**: A premium in-game item that provides a 20% time and cost discount on upgrades.
- **Builder Count**: The number of builders a user has determines how many upgrades can be performed simultaneously. (1-6 builders)

## Features

- **User Authentication**: Secure user login and registration using Supabase.
- **Dynamic Base Management**: Users can recreate, update, and manage their in-game base layout by adding and leveling up various defensive structures.
- **Simulated Economy**: Users receive currency (gold and elixer) based on time. and can select their builder count, and their gold pass status.
- **Upgrade System**: Users can view available upgrades for their defenses and initiate them, with costs and timers calculated using the [Clash of clans wiki](https://clashofclans.fandom.com/wiki/Defensive_Buildings/Home_Village).
- **Real-time Data Persistence**: All user and economy data is stored persistently in a Supabase database.
- **Responsive UI**: A modular React frontend designed for a seamless user experience.

## Technologies

This project uses a modern JavaScript-based technology stack:

- **Frontend**: **React** for the user interface, with **React Router** for navigation.
- **Backend**: **Node.js** with the **Express** framework, providing a REST API to handle business logic. It uses **Sequelize** as an ORM.
- **Database**: **Supabase**, which provides a **PostgreSQL** database for persistent data storage and handles user authentication.

## Quick Start

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

# Terminal 1: Backend
cd backend
nodemon server.js

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Documentation

All detailed project documentation has been moved to the `/docs` folder.

- **[Getting Started](./docs/GETTING_STARTED.md)**: Full installation and setup instructions.
- **[Design & Architecture](./docs/DESIGN_AND_ARCHITECTURE.md)**: Information on the file structure, data flow, and design patterns.
- **[Database Schema](./docs/DATABASE_SCHEMA.md)**: Details on the Supabase (PostgreSQL) tables.
- **[API Reference](./docs/API_REFERENCE.md)**: A complete reference for all backend API endpoints.
- **[Conventions & Standards](./docs/CONVENTIONS.md)**: Project conventions for code, naming, and commits.
- **[Project Roadmap](./docs/ROADMAP.md)**: Future plans and features for the project.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) to get started. Also, be sure to review our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Authors

- [@Jochen Sunaert](https://github.com/JochenSunaert)

### Guidance
- Special thanks to **Everaert Jan** for guidance for this assignment.