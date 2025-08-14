# Features

This page documents the user-visible features of the project and suggests short demo steps and media (GIFs) to show them. Use GIFs to show each feature in action — place them in `docs/videos/features/` and reference them below.

> Recommended GIF settings: 800×450 or 720×405 px, \~5–8s, 10–20 FPS, optimized (use `gifsicle` or an online optimizer). Put caption text under each GIF.

---

## Table of contents

* Authentication

  * Log in
  * Sign up
  * Email verification
  * Log out
* Base / Profile Management

  * Edit your base profile (add / remove rows, add defenses)
* User Economy

  * Collect gold / elixir
  * Toggle Gold Pass
  * Change builder count
  * Offline production / Welcome back notice
* Economy Overview

  * See gold, elixir, builder counts
  * Total time to max upgrades / time per builder
* Upgrades

  * In-progress upgrades (timer + finish)
  * Available upgrades (what can be built/upgraded)
  * Start an upgrade
  * Complete an upgrade (frontend triggers backend)
* Suggested extras (features you may add)

---

## Authentication

### Log in

**What it does**
User signs in with email/password; app saves token + user in session storage.

**Demo checklist**

* Open login page
* Enter credentials, submit
* Redirect to dashboard

**Frontend**: `pages/authentication/Login.jsx`
**Backend endpoints**: Supabase Auth (client-side), no custom backend route required.
**GIF filename**: `docs/images/features/login.gif`

```md
![Login demo](./videos/features/signup.mp4)
*Demo: user logs in and is redirected to /home*
```

---

### Sign up

**What it does**
User creates account; sends verification email via Supabase.

**Demo checklist**

* Open sign-up page
* Fill name / email / password
* Submit and show the confirmation message

**Frontend**: `pages/authentication/SignUp.jsx`
**Backend**: Supabase Auth (client-side)
**GIF filename**: `docs/images/features/signup.gif`

```md
![signup demo](./videos/features/signup.mp4)
*Demo: user signs up and receives a verification notice*
```

---

### Email verification

**What it does**
Account must be verified by the user via the email link.

**Demo checklist**

* Sign up (or show email being sent)
* Show in-app messaging that verification is required / pending

**Notes**: Supabase handles the actual email; show the “check your inbox” flow.
**GIF filename**: `docs/images/features/email_verification.gif`

---

### Log out

**What it does**
Clears session storage and returns the user to login.

**Demo checklist**

* Click logout
* Verify session cleared and redirect to login

**Frontend**: `HomePage.jsx` (logout handler)
**GIF filename**: `docs/images/features/logout.gif`

---

## Base / Profile Management

### Edit your base profile

**What it does**
Create, update, and remove defense instances. Save them to `user_base_data`.

**Demo checklist**

* Open profile/base page
* Add a defense instance (e.g., `Cannon #1`, set level)
* Remove a row or change a level
* Save and show success message

**Frontend**: `pages/ProfileTab.jsx`, `components/BaseInput/*`, `components/UserInputForm.jsx`
**Backend**: `GET /api/user-base-data?userId=...`, `POST/UPSERT` via `userBaseData.js` route
**GIF filename**: `docs/images/features/edit_base.gif`

---

## User Economy

### Collect Gold / Elixir

**What it does**
Collect produced resources (client uses `producedGold`/`producedElixir`, then upserts `user_economy`).

**Demo checklist**

* Wait for production to accumulate (or simulate)
* Click Collect Gold / Collect Elixir
* Show toast / UI update and DB update

**Frontend**: `components/UserEconomySettings/*` (ResourceCard, buttons)
**Backend**: `POST /api/user-economy/update` or direct Supabase upsert
**GIF filename**: `docs/images/features/collect_resources.gif`

---

### Toggle Gold Pass

**What it does**
Enables/disables a 20% cost/time reduction in calculations.

**Demo checklist**

* Toggle Gold Pass in settings
* Start an upgrade to show discounted cost/time

**Frontend**: `UserEconomySettings.jsx`
**Backend**: `POST /api/user-economy/update`
**GIF filename**: `docs/images/features/gold_pass_toggle.gif`

---

### Change Builder Count

**What it does**
Change the number of concurrent builders; affects available builders and economy calculations.

**Demo checklist**

* Change builder count in settings
* Start multiple upgrades to show builder limits enforced

**Frontend**: `UserEconomySettings.jsx`
**Backend**: `POST /api/user-economy/update`
**GIF filename**: `docs/images/features/builder_count.gif`

---

### Offline production / Welcome-back notice

**What it does**
When user returns, calculates production since `last_seen_at` and shows a toast.

**Demo checklist**

* Simulate a last-seen time in the past
* Reload app -> show "Welcome back" toast with produced amounts

**Frontend**: `UserEconomySettings.jsx` (initial fetch + `calculateInitialOfflineProduction`)
**GIF filename**: `docs/images/features/welcome_back.gif`

---

## Economy Overview

### See gold, elixir, builders amount

**What it does**
Shows current amounts pulled from backend / `GET /api/economy/status`.

**Demo checklist**

* Open Economy tab
* Show gold, elixir, builders, gold pass, totals

**Frontend**: `components/EconomyTab/EconomyTab.jsx`
**Backend**: `GET /api/economy/status?userId=...`
**GIF filename**: `docs/images/features/economy_overview.gif`

---

### Total time to max / time per builder

**What it does**
Calculates total time to upgrade all pending or needed defenses; shows per-builder estimation.

**Demo checklist**

* Show total\_time\_seconds from `GET /api/economy/status`
* Show computed per-builder time using `builders_count`

**GIF filename**: `docs/images/features/time_to_max.gif`

---

## Upgrades

### In-progress upgrades

**What it does**
List of active upgrades with countdown timers; when finish hits 0, frontend calls complete endpoint.

**Demo checklist**

* Start an upgrade
* Show in-progress upgrade list with countdown
* Let countdown reach 0 -> show completion flow

**Frontend**: `AvailableUpgrades` → `InProgressList.jsx`
**Backend**: `GET /api/upgrades?userId=...` (in-progress), `POST /api/user-economy/complete`
**GIF filename**: `docs/images/features/in_progress.gif`

---

### Available upgrades

**What it does**
Shows what can be built/upgraded based on Town Hall and placed defenses.

**Demo checklist**

* Open Available Upgrades view
* See entries for new builds and upgrades
* Confirm busy names excluded

**Frontend**: `AvailableList.jsx`, `UpgradeItem.jsx`
**Backend**: `GET /api/upgrades/available?userId=...`
**GIF filename**: `docs/images/features/available_upgrades.gif`

---

### Start an upgrade

**What it does**
Initiates upgrade: checks resources, builders, deducts cost, inserts `user_upgrades`.

**Demo checklist**

* Click Start Upgrade
* Show toast (starting)
* Check economy update & new in-progress row

**Frontend**: `UpgradeItem.jsx` (button)
**Backend**: `POST /api/user-economy/start-upgrade` or `POST /api/user-economy/start-upgrade` route
**GIF filename**: `docs/images/features/start_upgrade.gif`

---

### Complete an upgrade

**What it does**
When an upgrade finishes, delete/mark the `user_upgrades` row and update `user_base_data` (increment level or insert new defense row).

**Demo checklist**

* When timer hits 0, ensure `POST /api/user-economy/complete` is called
* Verify DB updates and UI refresh

**Backend**: `POST /api/user-economy/complete`
**GIF filename**: `docs/images/features/complete_upgrade.gif`

---

## Extras — features you may have forgotten (or consider adding)

* **Cancel/Refund upgrade**: Allow user to cancel an in-progress upgrade and refund a portion of cost.
* **Speed-up with premium**: Allow paying to finish an upgrade earlier (if you want a monetization mockup).
* **Notifications/Toasts with history**: Show a notification center for completed upgrades.
* **Builder queue UI**: Visualize builder slots (occupied / free).
* **Export / Import base layout**: JSON export/import of base setup for sharing.
* **Leaderboard / Social**: Public base display or ranking by total defense level.
* **Dark mode & Theme selector**
* **Accessibility improvements**: keyboard nav, aria labels, focus states.
* **Unit / Integration tests**: add tests for controllers and a couple key components.
* **Worker / Cron upgrade processor**: backend worker to finish upgrades server-side (instead of frontend-triggered completion).
* **Image attachments**: allow users to attach a screenshot for their base (for sharing).
* **Animated progress bars** for upgrades (better UX).
* **Rate-limiting & backend validation**: ensure endpoints are robust.

---

## GIF hosting & embedding recommendations

1. Create directory: `docs/images/features/`
2. Save GIFs as the suggested filenames (e.g., `login.gif`, `start_upgrade.gif`).
3. Reference them in your `docs/FEATURES.md` or `README.md`:

```md
### Start an upgrade
![Start upgrade demo](./images/features/start_upgrade.gif)
*User selects an upgrade and starts the timer; economy is updated.*
```

4. If GIFs are large: convert to MP4 + autoplay muted loop for smaller file size:

```html
<video autoplay loop muted playsinline style="max-width: 800px">
  <source src="./images/features/start_upgrade.mp4" type="video/mp4" />
</video>
```

(Use GIF for GitHub preview if you prefer — GitHub supports both.)

---

## Mapping: feature → key files & endpoints

| Feature           |                               Frontend component(s) | Backend endpoint(s)                                            |
| ----------------- | --------------------------------------------------: | -------------------------------------------------------------- |
| Log in / Sign up  |                            `pages/authentication/*` | Supabase Auth                                                  |
| Edit base         |    `pages/ProfileTab.jsx`, `components/BaseInput/*` | `GET /api/user-base-data`, `UPSERT user_base_data`             |
| Economy overview  |                           `components/EconomyTab/*` | `GET /api/economy/status`                                      |
| Start upgrade     | `components/AvailableUpgrades/*`, `UpgradeItem.jsx` | `POST /api/user-economy/start-upgrade`                         |
| In-progress       |           `AvailableUpgrades`, `InProgressList.jsx` | `GET /api/upgrades?userId=`, `POST /api/user-economy/complete` |
| Collect resources |                               `UserEconomySettings` | `POST /api/user-economy/update`                                |

---

## Quick contributions checklist for GIFs & docs

* [ ] Record each demo (use OBS or ScreenToGif).
* [ ] Crop + optimize GIFs (gifsicle / ezgif).
* [ ] Save to `docs/images/features/` with suggested name.
* [ ] Add GIF embed + a one-line caption under each GIF in this file.
* [ ] Commit as `docs(features): add demo GIFs` (follow Conventional Commits).

---

### Example short snippet you can paste into `docs/FEATURES.md`

```md
### Start an upgrade
![Start upgrade demo](./images/features/start_upgrade.gif)
*User selects an upgrade, cost is deducted and an in-progress upgrade appears with a countdown.*
```

