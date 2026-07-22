# Local Express Backend & MongoDB Docker Setup Guide

This guide describes how to configure, run, and verify the Node.js Express backend and connect it to your Dockerized MongoDB database.

---

## 📁 Updated Backend Project Structure

The files are organized according to standard production-ready Node.js structure:

```
backend/
├── config/
│     └── database.js      # Centralized database connection logic
├── models/
│     └── User.js          # User schema and model mapping
├── .env                   # Configuration parameters (ignored by git)
├── server.js              # Application entry point & server setup
├── package.json           # Service dependencies and start scripts
└── BACKEND_SETUP_GUIDE.md # This guide
```

---

## 🛠️ Step 1: Install Dependencies

To run the Express backend, navigate to the `backend` folder and run the installation command (if not already completed):

```bash
cd backend
npm install
```

This installs:
* **`express`**: Web framework for building the API endpoints.
* **`mongoose`**: ODM to model and connect to MongoDB schemas easily.
* **`dotenv`**: Utility to load variables from `.env` file into `process.env`.
* **`cors`**: Middleware to allow request handling across frontend origins.

---

## ⚙️ Step 2: Configuration (`.env`)

The `.env` file must reside in the `backend` directory (and is already created for you at [backend/.env](file:///c:/Users/SAMEED/Desktop/Skin_Analysis/SkinAnalysis/backend/.env)):

```env
PORT=5000
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/makeupai?authSource=admin
```

> [!NOTE]
> Since the backend runs locally on your host machine (outside Docker), the URI points to `localhost:27017`. The `authSource=admin` parameter tells MongoDB to authenticate the `admin` user against the default admin authentication database.

---

## 🐳 Step 3: Run and Verify Docker MongoDB

Before running the backend, make sure Docker Desktop is active and spin up the database container.

### Command List:

1. **Start the Database Container**:
   Run this in the directory containing `docker-compose.yml`:
   ```bash
   docker compose up -d
   ```
   * *Verifies*: Downloads the database image if needed, initializes the environment parameters, maps port `27017` to the host, and starts MongoDB/Mongo Express in detached mode.

2. **Verify Containers are Running**:
   ```bash
   docker ps
   ```
   * *Verifies*: Displays a table of all active containers. You should see `mongodb` (port `27017`) and `mongo-express` (port `8081`) with status **Up**.

3. **Inspect Database Logs**:
   ```bash
   docker logs mongodb
   ```
   * *Verifies*: Displays standard logs from the database engine. Look for `waiting for connections` at the bottom of the log stream to confirm it is ready to receive requests.

---

## 🚀 Step 4: Run the Express Server

To start the backend, run:
```bash
npm run server
```

If successful, you will see the logs:
```
🔌 Initializing connection to MongoDB...
✅ MongoDB Connected Successfully: localhost
🚀 Express server is active on http://localhost:5000
🩺 Health check status URL: http://localhost:5000/health
🧪 Test connection endpoint: POST http://localhost:5000/api/verify-connection
```

---

## 🧪 Step 5: Verify the Database Connection & Write Operations

To ensure the backend can read and write to MongoDB correctly:

### 1. Check API Service Health
Navigate to **[http://localhost:5000/health](http://localhost:5000/health)** in your browser. You should receive:
```json
{
  "success": true,
  "service": "Skin Analysis Express Backend",
  "database": "connected",
  "timestamp": "2026-07-22T..."
}
```

### 2. Verify Database Write Functionality
Send a `POST` request to the test endpoint to insert a sample document. You can do this via PowerShell or terminal:

**Using PowerShell**:
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/verify-connection"
```

**Using cURL / Bash**:
```bash
curl -X POST http://localhost:5000/api/verify-connection
```

You should receive a `201 Created` status with:
```json
{
  "success": true,
  "message": "Database write operation verified successfully!",
  "insertedDocument": {
    "message": "Connection verification success! Document successfully written from Node.js Express backend.",
    "_id": "...",
    "timestamp": "..."
  }
}
```

### 3. Verify in Mongo Express GUI
1. Open **[http://localhost:8081](http://localhost:8081)**.
2. Sign in (Username: `admin`, Password: `expresspassword`).
3. You will see a database named `makeupai` in the listing.
4. Click into `makeupai`, select the `testverifications` collection, and view the document you just wrote.

---

## 🔍 Troubleshooting Connection Errors

| Error Signature | Potential Root Cause | Solution |
| :--- | :--- | :--- |
| `MongooseError: Operation... timed out` or `ECONNREFUSED` | MongoDB Docker container is not active or port `27017` is in use. | Run `docker ps` to verify container is running. If not, run `docker compose up -d`. Check if another MongoDB server is running on the host. |
| `MongoServerError: Authentication failed` | Invalid credentials in `MONGODB_URI`. | Double-check that username/password in backend `.env` matches the ones defined in `docker-compose.yml`. |
| `Error: MONGODB_URI is not defined` | `.env` file is missing or not placed in the root directory where the process is running. | Ensure `.env` is located directly in `backend/` directory, and the start command is executed from there. |
