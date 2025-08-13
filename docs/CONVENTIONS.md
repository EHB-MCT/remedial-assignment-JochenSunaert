
# Conventions & Standards

To maintain consistency and readability across the project, we adhere to the following conventions.

---

## Naming Conventions

* **JavaScript/TypeScript**: Files, functions, and variables follow **camelCase** (`upgradeController.js`, `startUpgrade`).
* **React Components**: Components are named using **PascalCase** (`AvailableUpgrades.jsx`).
* **CSS**: Class names use **kebab-case** (`.main-container`).
* **API Endpoints**: Endpoints use **kebab-case** (`/api/user-base-data`).

---

## Styling

* The project uses **external stylesheets** (`.css` files) and basic CSS for prototyping and styling.
* Components should be styled in a **modular way**, keeping styles scoped to the component where possible.
* Avoid global CSS unless absolutely necessary.

---

## Code Organization

* **Modularity**: Code is organized into logical modules with a clear separation of concerns (e.g., routes, controllers, models).
* **Single Responsibility Principle**: Each function and component should have a single, well-defined purpose.
* **Folder Structure**:

  * `components/` → UI components (grouped by feature when appropriate).
  * `pages/` → Page-level components for routing.
  * `utils/` → Shared helper functions.
  * `hooks/` → Custom React hooks.
  * `styles/` → CSS files.

---

## Documentation & Comments

### JSDoc

* Use **JSDoc** for functions, classes, and important logic.
* Example:

  ```js
  /**
   * Calculates the total gold needed for all upgrades.
   * @param {Array<Object>} upgrades - List of upgrade objects.
   * @returns {number} Total gold required.
   */
  function calculateTotalGold(upgrades) {
    return upgrades.reduce((total, u) => total + u.build_cost, 0);
  }
  ```

### Inline Comments

* Use inline comments **sparingly** for clarity — not to restate obvious code.
* Example:

  ```js
  // Apply gold pass discount if applicable
  finalCost = hasGoldPass ? cost * 0.9 : cost;
  ```

---

## Git & Commits

* **Commit Messages** must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/):

  * `feat:` for new features.
  * `fix:` for bug fixes.
  * `docs:` for documentation changes.
  * `style:` for code style changes (formatting, etc.).
  * `refactor:` for code changes that neither fix a bug nor add a feature.
  * `test:` for adding or correcting tests.
  * `chore:` for build process or auxiliary tool changes.

  **Example**:

  ```
  feat: add gold pass discount to upgrade cost calculation
  ```

---

## Sources & References

* **Conventional Commits** → [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)
* **JSDoc Official Docs** → [https://jsdoc.app/](https://jsdoc.app/)
* **Airbnb JavaScript Style Guide** → [https://airbnb.io/javascript/](https://airbnb.io/javascript/)
* **React Official Docs** → [https://react.dev/](https://react.dev/)


