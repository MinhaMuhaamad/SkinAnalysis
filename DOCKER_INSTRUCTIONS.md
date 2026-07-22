# Running MongoDB and Mongo Express with Docker

This guide explains how to spin up a **MongoDB** database and a **Mongo Express** web-based administration interface using Docker Desktop.

---

## Why Docker Compose?
Instead of a single `Dockerfile` (which is typically used to package a *single* custom application), running multiple pre-built services like MongoDB and Mongo Express together is done using **Docker Compose** (`docker-compose.yml`). 
This keeps the database and its web GUI isolated, yet connected to each other on a shared virtual network.

---

## Credentials Configuration
The configuration in [docker-compose.yml](file:///c:/Users/SAMEED/Desktop/Skin_Analysis/SkinAnalysis/docker-compose.yml) uses the following default credentials:

| Service | Username | Password | Purpose / Access |
| :--- | :--- | :--- | :--- |
| **MongoDB** | `admin` | `adminpassword` | Database connection authentication |
| **Mongo Express Web GUI** | `admin` | `expresspassword` | Logging into the web UI in browser |

---

## Step-by-Step Instructions

### Step 1: Open Docker Desktop
Ensure that **Docker Desktop** is open and running on your system. You should see the green "running" status icon in the bottom-left corner of Docker Desktop.

### Step 2: Open Terminal / PowerShell
Open your terminal (PowerShell, Command Prompt, or Git Bash) and navigate to the project directory:
```powershell
cd "c:\Users\SAMEED\Desktop\Skin_Analysis\SkinAnalysis"
```

### Step 3: Run the Containers
To start MongoDB and Mongo Express in the background (detached mode), run:
```bash
docker compose up -d
```

> [!NOTE]
> If you are using an older version of Docker, the command might be `docker-compose up -d` (with a hyphen).

### Step 4: Verify Containers are Running
To check the status of your running containers:
```bash
docker compose ps
```
You should see both the `mongodb` and `mongo-express` containers marked as **Up**.

### Step 5: Access the Interfaces

* **Mongo Express Web Interface**:
  Open your web browser and go to: **[http://localhost:8081](http://localhost:8081)**
  * **Username**: `admin`
  * **Password**: `expresspassword`
  
* **MongoDB Database Connection**:
  You can connect your backend application or database GUI client (like MongoDB Compass) using this connection URI:
  ```
  mongodb://admin:adminpassword@localhost:27017/
  ```

---

## Useful Docker Commands

### Stop the Containers
To stop the services without deleting any database data:
```bash
docker compose stop
```

### Start the Stopped Containers
To resume the stopped services:
```bash
docker compose start
```

### View Service Logs
To view the logs from both MongoDB and Mongo Express (helpful for debugging):
```bash
docker compose logs -f
```

### Shutdown and Remove Containers
To completely stop the containers and remove the virtual network:
```bash
docker compose down
```

> [!IMPORTANT]
> The database files are stored inside a persistent Docker volume named `mongodb_data`. Running `docker compose down` will **not** delete your database data. If you ever want to completely delete the database data and start fresh, run:
> ```bash
> docker compose down -v
> ```
