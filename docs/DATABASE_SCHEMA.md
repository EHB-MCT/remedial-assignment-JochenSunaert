# Database Schema

The application uses a Supabase (PostgreSQL) database. The core tables are designed to handle user data, economy status, and upgrade information.

### `user_economy`

This table stores the user's current resources and other economy-related settings.

-   `id` (uuid): The unique ID 
-   `user_id` (text): Primary key: The unique ID of the user (linked to Supabase Auth).
-   `gold_amount` (int8): The current amount of gold the user has.
-   `elixir_amount` (int8): The current amount of elixir the user has.
-   `dark_elixir_amount` (int8): The current amount of elixir the user has.
-   `has_gold_pass` (boolean): A flag to indicate if the user has a gold pass.
-   `builders_count` (int2): The number of builders the user has available.
-   `last_updated` (timestamp): Timestamp to show when this was lastly updated.
-   `last_seen_at` (timestamp): Timestamp that shows when the user was lastly active.


### `user_base_data`

This table stores the specific defenses a user has placed on their base.

-   `id` (uuid): Primary key.
-   `user_id` (uuid): The unique ID of the user.
-   `type` (text): The defense type.
-   `name` (text): The name of the defense instance (e.g., "Cannon #1", "Town Hall").
-   `current_level` (int2): The current level of the defense.
-   `instance` (int2): The defense instance number.

### `defense_upgrades`

This table acts as a central repository for all possible defense upgrades, including costs and requirements.

The full data tables for each defense can be found in `backend/database/tables/defense`


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
-   `started_at` (timestamp): The timestamp when the upgrade started.
-   `finishes_at` (timestamp): The timestamp when the upgrade is scheduled to finish.
-   `status` (text): The current status of the upgrade (e.g., `in_progress`, `completed`).
-   `defense_instance_name` (text): the name of the specific defense. (e.g., "Cannon #1", "Archer Tower #7").