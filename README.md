# Aethera OTT Platform

Aethera is a modern, cloud-native Over-The-Top (OTT) streaming platform built with a highly decoupled **Microservices Architecture**. It leverages containerization (Docker), orchestration (Kubernetes/Minikube), cloud storage (AWS S3), and a globally distributed NoSQL database (MongoDB Atlas) to deliver a seamless and highly scalable video streaming experience.

## 🏗️ Architecture & Tech Stack

Aethera is broken down into independent services, solving the scaling bottlenecks of traditional monolithic applications.

### 1. The Microservices (Backend)
- **Auth Service (Port 3000):** Handles user registration and stateless JWT-based authentication.
- **Content Service (Port 3001):** Fetches movie metadata from MongoDB and dynamically injects AWS S3 image URLs.
- **Subscription Service (Port 3002):** Manages user subscription tiers (Basic vs. Premium) and database mutations.
- **Streaming Service (Port 3003):** Records user watch history into the database, then issues an HTTP 302 redirect to securely stream video directly from AWS S3.
- **Recommendation Service (Port 3004):** A custom-engineered content-filtering engine that connects to two separate databases simultaneously to analyze watch history against the full catalog, scoring unwatched movies based on genre frequency.

### 2. Infrastructure
- **Compute:** Node.js / Express
- **Containerization:** Docker
- **Orchestration:** Kubernetes (Minikube locally)
- **API Gateway:** Ingress-NGINX (Path-based routing)
- **Database:** MongoDB Atlas (Cloud NoSQL, dual databases for user data and content metadata)
- **Media Storage:** Amazon Web Services (AWS) S3
- **Local Tunnelling:** Ngrok (Exposes the local K8s cluster to the public internet)

### 3. Frontend
- **Framework:** React.js
- **UI/UX:** Framer Motion (glassmorphism UI, interactive hover states, dynamic UI based on Premium status)
- **Hosting:** Vercel (Global Edge CDN)

---

## 🚀 Deployment Guide & Nuances

Aethera uses a Hybrid Cloud deployment strategy. The frontend is hosted globally on Vercel, the databases and storage are fully managed in the cloud (Atlas and S3), and the compute microservices run in a local Minikube Kubernetes cluster bridged by Ngrok.

### Prerequisites
- Docker Desktop
- Minikube & kubectl
- Ngrok account
- MongoDB Atlas cluster with an active IP Whitelist (`0.0.0.0/0` recommended for dynamic IPs)
- AWS S3 bucket with public-read permissions and CORS configured
- Vercel CLI (optional)

### Step 1: Environment Variables
Create a `.env` file in the root of the backend and in the `frontend` directory. 
*(Note: `.env` files are ignored by git to protect secrets).*

Example backend `.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aethera
MONGO_CONTENT_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aethera_content
S3_BASE_URL=https://your-bucket-name.s3.amazonaws.com
JWT_SECRET=your_super_secret_key
```

### Step 2: Start the Kubernetes Cluster
A custom shell script (`start.sh`) automates the cluster spin-up:
```bash
./start.sh
```
**What this does:**
1. Starts Minikube.
2. Enables the `ingress` addon.
3. Points your terminal's Docker daemon to Minikube's internal Docker registry.
4. Builds the 5 Docker images directly inside the cluster.
5. Applies the Kubernetes Deployments, Services, and Ingress YAML configurations.

### Step 3: Establish the API Gateway Tunnel
Kubernetes needs a way to route `localhost:80` traffic to the internal Ingress controller. Keep this running in a separate terminal:
```bash
minikube tunnel
```

### Step 4: Expose to the Internet via Ngrok
To allow the Vercel-hosted frontend to communicate with your local Minikube cluster, run:
```bash
ngrok http 80
```
**Crucial Nuance:** Because we use the free tier of Ngrok, this command generates a *new, random public URL* every time it runs.

### Step 5: Update the Frontend
Whenever your Ngrok URL changes, you must inform the frontend:
1. Copy the new Ngrok URL (e.g., `https://random-words.ngrok-free.dev`).
2. Go to your Vercel Project Dashboard.
3. Navigate to **Settings > Environment Variables**.
4. Update `REACT_APP_API_URL` with the new Ngrok URL.
5. **CRITICAL:** Click **Deployments > Redeploy**. Vercel injects environment variables at *build time*, so simply saving the variable is not enough.

### Step 6: Bypassing Ngrok Warnings
Ngrok's free tier intercepts the first HTTP request with a warning screen. To prevent this from blocking our React API calls, all frontend `fetch` requests include a special header:
```javascript
headers: { 'ngrok-skip-browser-warning': 'true' }
```

---

## 🔄 Development Workflow

If you modify the backend Node.js code, you do not need to restart Minikube. Simply run:
```bash
./rebuild.sh
```
This script rebuilds the Docker images and uses `kubectl rollout restart deployment` to gracefully replace the running pods with zero downtime.

## 🛡️ Security Notes
- **IP Whitelisting:** If your microservices crash with `MongoNetworkError` or `SSL alert number 80`, it is highly likely your public IP address changed and MongoDB Atlas is blocking the connection. Update your Atlas Network Access settings.
- **Secrets:** Never commit `.env` files. A `.gitignore` is provided to prevent accidental credential leaks.
