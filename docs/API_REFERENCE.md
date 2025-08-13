# API Reference

All endpoints are prefixed with `/api`.

---

### General Endpoints

#### `GET /api/healthcheck`

-   **Description**: Checks if the server is running.
-   **Response**:
    ```json
    { "status": "ok" }
    ```

---

### User Base & Upgrades

#### `GET /api/user-base-data`

-   **Description**: Retrieves the full list of a user's defenses and their current levels.
-   **Query Parameters**: `userId` (string, required) - The user's unique ID.
-   **Response**: An array of objects.
    ```json
    [
      {
        "name": "Cannon",
        "current_level": 5
      }
    ]
    ```

#### `GET /api/upgrades/available`

-   **Description**: Fetches a list of all available upgrades for a user based on their base and Town Hall level.
-   **Query Parameters**: `userId` (string, required) - The user's unique ID.
-   **Response**: An array of objects.
    ```json
    [
      {
        "defense_instance": "Wizard Tower #4",
        "current_level": 16,
        "available_upgrades": [
          {
            "id": 92,
            "defense_name": "Wizard Tower",
            "level": 17,
            "unlocks_at_town_hall": 17,
            "build_cost": 20000000,
            "build_time_seconds": 1296000,
            "build_resource": "gold",
            "current_level": 16,
            "status": "not_started"
          }
        ]
      }
    ]
    ```

#### `POST /api/user-economy/start-upgrade`

-   **Description**: Initiates an upgrade for a specific defense.
-   **Body**: A JSON object as defined in `upgradeController.js`.
-   **Response**: A JSON object indicating success or failure.
    ```json
    { "success": true, "message": "Upgrade started successfully." }
    ```

---

### User Economy & Status

#### `GET /api/economy/status`

-   **Description**: Provides a comprehensive summary of a user's economy, including current resources, builder count, and calculated totals for all available upgrades.
-   **Query Parameters**: `userId` (string, required) - The user's unique ID.
-   **Response**:
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

#### `POST /api/economy/update` | `POST /api/user-economy/update` | `POST /api/user-economy/status`

-   **Description**: These endpoints are used to update a user's economy data (gold, elixir, builders, gold pass).
-   **Body**: A JSON object containing `userId` and the fields to update (`has_gold_pass`, `builders_count`, `gold_amount`, `elixir_amount`).
-   **Response**:
    ```json
    { "success": true }
    ```