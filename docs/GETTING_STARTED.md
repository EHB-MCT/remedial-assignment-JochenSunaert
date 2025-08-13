# Getting Started

Follow these steps to get the project running locally.

## Prerequisites

- **Node.js**: The project's backend and build tools require Node.js (v18 or higher recommended).
- **Supabase Project**: A new Supabase project is needed. You must create the required tables as outlined in the [Database Schema](./DATABASE_SCHEMA.md) documentation.
- **Supabase Credentials**: Your Supabase Project URL and anon key are required.

## Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    ```

2.  Navigate to the project directory:
    ```bash
    cd <project-folder>
    ```

3.  Install dependencies for the frontend and backend:
    ```bash
    # Install frontend dependencies
    cd frontend
    npm install

    # Install backend dependencies
    cd ../backend
    npm install
    ```

4.  Create a `.env` file in the **`backend`** directory root and add your Supabase credentials. The file should look like this:
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
    PORT=3001
    ```

## Running the Application

You will need two separate terminal windows to run both the frontend and backend servers simultaneously.

1.  **Start the backend server:**
    ```bash
    cd backend
    node server.js
    ```
    The backend API will be running on `http://localhost:3001`.

2.  **Start the frontend application:** (in a second terminal)
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`. Open this address in your browser to use the application.