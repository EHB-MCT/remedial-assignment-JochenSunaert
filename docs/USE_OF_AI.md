## Overview

This document outlines the use of Artificial Intelligence (AI) assistance in the development of the **Clash of Clans Web Simulation** project. The purpose is to provide transparency about which parts of the project were influenced or generated with AI support and to confirm that all AI-assisted work was reviewed, verified, and adjusted by the developer to meet project requirements.

AI was used as a **development assistant**, helping with coding, debugging, architecture recommendations, and documentation, but all final decisions and implementations were performed by the developer.

---

## AI Provider & Model

* **Provider**: OpenAI
* **Model**: GPT-5 (code & design assistance)
* **Interaction Mode**: Conversational prompt-response
---
* **Provider**: Gemeni
* **Model**: 2.5
* **Interaction Mode**: Conversational prompt-response
---

## Scope of AI Assistance

### 1. Code Implementation

AI assisted in the creation, refactoring, and optimization of several key scripts and modules in this project, including:

#### Frontend (React)

* **Resource & Builder System**

  * Logic for calculating resource accumulation over time.
  * Implementation of builder count logic and simultaneous upgrade management.
* **Upgrade System**

  * UI components displaying upgrade availability, costs, and timers.
  * Integration of **Gold Pass** discounts for speed and cost reductions.
* **Base Management**

  * Dynamic layout updates for defensive structures.
  * Real-time display of building levels and upgrade progress.

#### Backend (Node.js / Express)

* **Economy Simulation**

  * APIs for calculating resource gains and upgrade costs.
  * Handling multiple simultaneous upgrades based on builder count.
* **Database Integration**

  * Supabase ORM/SQL queries for persisting user progress, building levels, and resources.

---

### 2. Debugging & Problem Solving

AI was used to:

* Identify and resolve issues with **resource accumulation timers**.
* Correct race conditions when multiple upgrades are triggered simultaneously.
* Suggest improvements for API endpoints to prevent data inconsistency.
* Recommend React state management strategies to ensure **real-time UI updates** without excessive re-renders.
* Provide guidance for handling **Supabase authentication and security rules** correctly.

---

### 3. Code Organization & Naming Conventions

AI provided recommendations for:

* **Folder structure**:

  * `/frontend/components` for UI components
  * `/backend/routes` for API endpoints
  * `/backend/services` for business logic
* Consistent **naming conventions** for React components, Express route handlers, and utility functions.
* Avoiding overuse of generic names like `Manager` and promoting descriptive names for clarity.

---

### 4. Best Practices Guidance

AI guidance included:

* Writing fixes for **modular and maintainable code** for both frontend and backend.
* Structuring database queries and API responses for **scalability** and **performance**.
* Recommendations for user experience improvements, including **responsive layouts**, **timers**, and **real-time updates**.
* refactoring of my code files to multiple conventional smaller files.

---

## Human Oversight

All AI-generated or AI-assisted work was:

* Reviewed by the developer.
* Tested in both frontend (React) and backend (Node.js) environments to ensure correct functionality.
* Modified as needed to align with project style, architecture, and gameplay requirements.

---

## License & Compliance

* The developer retains full authorship and copyright over this project.
* AI-generated content is considered **tool-assisted creation** and does not transfer copyright to any third party.
* All open-source dependencies (React, Node.js, Supabase, etc.) remain under their respective licenses.

---

## Contact

For questions regarding AI usage in this project, contact:

**Jochen Sunaert — Lead Developer**
[GitHub Profile](https://github.com/JochenSunaert)

