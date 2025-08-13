# Database Schema

The application uses a Supabase (PostgreSQL) database. The core tables are designed to handle user data, economy status, and upgrade information.

### `user_economy`

This table stores the user's current resources and other economy-related settings.

-   `id` (uuid): Primary key.
-   `user_id` (text): The unique ID of the user (linked to Supabase Auth).
-   `gold_amount` (int8): The current amount of gold the user has.
-   `elixir_amount` (int8): The current amount of elixir the user has.
-   `builders_count` (int2): The number of builders the user has available.
-   `has_gold_pass` (boolean): A flag to indicate if the user has a gold pass.

### `user_base_data`

This table stores the specific defenses a user has placed on their base.

-   `id` (uuid): Primary key.
-   `user_id` (text): The unique ID of the user.
-   `name` (text): The name of the defense instance (e.g., "Cannon #1", "Town Hall").
-   `current_level` (int2): The current level of the defense.
-   `type` (text): The defense type.
-   `instance` (int2): The defense instance number.

### `defense_upgrades`

This table acts as a central repository for all possible defense upgrades, including costs and requirements.

-   `id` (uuid): Primary key.
-   `defense_name` (text): The name of the defense type (e.g., "Cannon", "Wizard Tower").
-   `level` (int2): The level of the upgrade.
-   `unlocks_at_town_hall` (int2): The minimum Town Hall level required to unlock this upgrade.
-   `build_cost` (int8): The cost of the upgrade.
-   `build_resource` (text): The resource that the upgrade uses (gold, elixir, dark_elixir).
-   `build_time_seconds` (int8): The time required for the upgrade to complete, in seconds.

### `user_upgrades`

This table tracks upgrades that are currently in progress for a user.

-   `id` (uuid): Primary key.
-   `user_id` (text): The unique ID of the user.
-   `defense_id` (uuid): A reference to the `defense_upgrades` entry for this upgrade.
-   `upgrade_level` (int2): The target level of the upgrade.
-   `started_at` (timestamptz): The timestamp when the upgrade started.
-   `finishes_at` (timestamptz): The timestamp when the upgrade is scheduled to finish.
-   `status` (text): The current status of the upgrade (e.g., `in_progress`, `completed`).