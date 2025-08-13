# Conventions & Standards

To maintain consistency and readability across the project, we adhere to the following conventions.

### Naming Conventions

-   **JavaScript/TypeScript**: Files, functions, and variables follow **camelCase** (`upgradeController.js`, `startUpgrade`).
-   **React Components**: Components are named using **PascalCase** (`AvailableUpgrades.jsx`).
-   **CSS**: Class names use **kebab-case** (`.main-container`).
-   **API Endpoints**: Endpoints use **kebab-case** (`/api/user-base-data`).

### Styling

-   The project uses External Stylesheets (`.css` files) and basic CSS for prototyping and styling.
-   Components should be styled in a modular way, keeping styles scoped to the component where possible.

### Code Organization

-   **Modularity**: Code is organized into logical modules with a clear separation of concerns (e.g., routes, controllers, models).
-   **Single Responsibility Principle**: Each function and component should have a single, well-defined purpose.

### Git & Commits

-   **Commit Messages**: Commit messages must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). This helps in automating changelogs and makes the project history easier to understand.
    -   `feat:` for new features.
    -   `fix:` for bug fixes.
    -   `docs:` for documentation changes.
    -   `style:` for code style changes (formatting, etc.).
    -   `refactor:` for code changes that neither fix a bug nor add a feature.
    -   `test:` for adding or correcting tests.
    -   `chore:` for build process or auxiliary tool changes.

    **Example**: `feat: add gold pass discount to upgrade cost calculation`