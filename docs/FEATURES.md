##  Detailed features

This section provides a more detailed, technical look at how each feature is validated.

### **Authentication**

* **Sign-up**:
    * Emails must be in a valid format, and passwords must meet a minimum length (e.g., 8 characters).
    * A verification email is sent upon successful account creation.
* **Email Verification**: Unverified accounts are blocked from accessing protected parts of the app.
* **Log-in**:
    * Upon success, a `session.access_token` and `user` object are stored.
    * Clear error messages are shown for invalid credentials or unverified emails.
* **Token/Session Lifetime**: The application is designed to handle expired sessions gracefully by prompting you to log in again.

---

### **Base & Profile**

* **Add/Remove Instance**:
    * Instance numbers and levels must be positive integers.
    * A unique naming pattern is used for each defense, like `${type} #${instance}`. The Town Hall is a special case without a number.
    * The app enforces the maximum number of instances for each defense type (e.g., 4 Mortars).
* **Save Base**: Your base data is securely saved via a `POST` request to the backend. A "Base saved" message confirms the action.

---

### **Economy**

* **Collect Resources**:
    * You cannot collect more resources than the `RESOURCE_CAP` (e.g., 24,000,000).
    * The backend calculates and updates your resource count, showing you the collected amount.
* **Toggle Gold Pass**: When the Gold Pass is active, the backend automatically applies a **20% discount** to upgrade costs and times.
* **Builders Count**: You can set a builder count between 1 and a configured maximum (e.g., 6).
* **Offline Production**: The system computes how many resources were produced while you were offline. A toast notification is shown only if the amount exceeds a certain threshold.

---

### **Upgrades**

* **List In-Progress Upgrades**: The app fetches a list of your active upgrades from the backend, including their completion times. The remaining time is calculated on the client side.
* **List Available Upgrades**: The backend determines available upgrades based on:
    * Your Town Hall level.
    * The current level of your defenses.
    * The number of new builds allowed.
    * Excluding defenses that are already being upgraded.
* **Start Upgrade**: The client sends a request to the backend, which performs several critical checks:
    1.  Verifies the user's account.
    2.  Confirms a builder is available.
    3.  Ensures you have enough resources (applying any Gold Pass discounts).
    4.  Atomically deducts resources and creates a new `user_upgrades` entry.
    * Success is indicated by a `200/201` response, while various error codes (`409`, `400`, `500`) are used for failures.
* **Complete Upgrade**:
    * When a timer finishes, the frontend or a backend worker triggers a completion request.
    * The backend marks the upgrade as complete, updates the defense's level in your base, and ensures this process is idempotent to prevent errors from duplicate requests.