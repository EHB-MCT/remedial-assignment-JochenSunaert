# API Reference

All endpoints are prefixed with `/api`.

---

## Table of Contents

1. [General Endpoints](#general-endpoints)
2. [User Base & Upgrades](#user-base--upgrades)
3. [User Economy & Status](#user-economy--status)

---

## General Endpoints

### if running local, the server should be at ### `http://localhost:3001`

### `GET /api/healthcheck`

* **Description**: Checks if the server is running.
* **Response**:

```json
{ "status": "ok" }
```

---

## User Base & Upgrades

### `GET /api/user-base-data`

* **Description**: Retrieves the full list of a user's defenses and their current levels.
* **Query Parameters**:

  * `?userId` (string, required) — The user's unique ID.
* **Response**:

```json
[
  {
    "name": "Cannon",
    "current_level": 5
  }
]
```

### `GET /api/upgrades/available`

* **Description**: Fetches all available upgrades for a user based on their base and Town Hall level.
* **Query Parameters**:

  * `?userId` (string, required) — The user's unique ID.
* **Response**:

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

### `POST /api/user-economy/start-upgrade`

* **Description**: Initiates an upgrade for a specific defense.
* **Body**: JSON object as defined in `upgradeController.js`.
* **Response**:

```json
{ "success": true, "message": "Upgrade started successfully." }
```

---

## User Economy & Status

### `GET /api/economy/status`

* **Description**: Returns a summary of a user's economy, including current resources, builder count, and totals for all upgrades.
* **Query Parameters**:

  * `userId` (string, required) — The user's unique ID.
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

### `POST /api/economy/update`

### `POST /api/user-economy/update`

### `POST /api/user-economy/status`

* **Description**: Updates a user's economy data (gold, elixir, builders, gold pass).
* **Body**: JSON object containing `userId` and fields to update:

```json
{
  "userId": "12345",
  "has_gold_pass": true,
  "builders_count": 3,
  "gold_amount": 500000,
  "elixir_amount": 300000
}
```

* **Response**:

```json
{ "success": true }
```
