# 🌾 KisaanConnect - Smart Agricultural Marketplace Platform

> **KisaanConnect** is a modern, responsive web application designed to empower India's agricultural community. It connects farmers, buyers, and equipment providers directly, eliminating middle-men and offering real-time weather forecasting, live commodity price information, direct chat messaging, and an admin-supported helpdesk.

---

## 🚀 Key Features

*   🌱 **Direct Agricultural Marketplace**: Sellers (farmers) can upload crop listings and farming equipment for rent/sale, specifying name, quantity, price, unit, location, and images.
*   💬 **Real-time Live Chat**: A direct chat module between buyers and sellers, built on **Socket.io** for instant communication.
*   🔔 **Firebase Push Notifications**: Real-time push alerts via **Firebase Cloud Messaging (FCM)** for incoming chat messages and admin replies to support tickets. Supports background notification handling using a dedicated service worker.
*   ☁️ **Cloudinary Image Optimization**: Cloud-hosted image storage with automatic cropping (e.g., face detection for profile photos), format optimization, and global CDN delivery. No local file storage required, making the app fully compatible with ephemeral hosts like Render.com.
*   🌡️ **Live Weather Forecast**: Integration with the **OpenWeatherMap API** to fetch and display local weather conditions for crop planning.
*   📋 **Government Schemes Directory**: A curated page displaying active government schemes, grants, and subsidies helpful to farmers.
*   📊 **Live Market Prices**: A dedicated tracking page for active crop and commodity prices.
*   🤖 **AI Price Chatbot**: A smart virtual assistant that suggests pricing details and answers crop queries.
*   🌗 **Day/Night Theme Toggle**: A modern, smooth dark-mode switch that dynamically transitions styles across the entire application.
*   🛡️ **Secure Access & Auditing**:
    *   Authentication and signups with password hashing using **bcrypt**.
    *   Admin interface for handling support tickets and querying market prices.
    *   Strict Content Security Policy (CSP) headers protecting resources.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JS, Bootstrap 5, jQuery | Responsive layout, modern UI cards, animations, and custom stylesheets |
| **Real-time Engine** | Socket.io | Bidirectional event-based communication for live chat |
| **Backend** | Node.js, Express.js | Robust MVC API endpoints and routing services |
| **Database** | MongoDB & Mongoose | Document database for storage of users, crops, chats, orders, and tickets |
| **Cloud Storage** | Cloudinary | CDN-delivered cloud media uploads for crops and profile pictures |
| **Notifications** | Firebase Cloud Messaging (FCM) | Cross-platform messaging service for background/foreground push alerts |
| **Mail Services** | Nodemailer | Transactional emails for support, registration, and password recovery |

---

## 📁 Directory Structure

```text
WT_Project/
├── client/                     # Frontend Client Code
│   ├── index.html              # Landing Page
│   ├── HomePage_DetailsFilling.html # Marketplace Listing Page
│   ├── Login.html              # Login Page
│   ├── registration.html       # Signup Form
│   ├── buy-now.html            # Product Details
│   ├── checkout.html           # Checkout & Cart Page
│   ├── chats.html              # Real-Time Chat Dashboard
│   ├── equipment.html          # Equipment Listings
│   ├── weather.html            # Weather Forecast Dashboard
│   ├── schemes.html            # Government Schemes Listing
│   ├── help.html               # User Support Desk
│   ├── admin-help.html         # Admin Support Ticket Resolution Desk
│   ├── reset-password.html     # Password Recovery
│   ├── firebase-messaging-sw.js # FCM Background Service Worker
│   └── js/
│       ├── api-client.js       # Main AJAX API calls
│       └── firebase-config.js  # FCM Client Initialization
│
├── server/                     # Backend API Server
│   ├── app.js                  # Main server entry & socket configuration
│   ├── config/
│   │   ├── db.js               # MongoDB/Mongoose connection
│   │   └── cloudinary.js       # Cloudinary integration setup
│   ├── models/                 # Mongoose Database Models
│   │   ├── Address.js, Cart.js, Chat.js, Crop.js, Farmer.js,
│   │   └── MarketPrice.js, Message.js, Order.js, Ticket.js, Wishlist.js
│   ├── routes/                 # Express API Route Handlers
│   │   ├── register.js, login.js, crops.js, chats.js, ecommerce.js,
│   │   └── forgot-password.js, help.js, market-prices.js
│   └── services/
│       └── notificationService.js # Firebase Cloud Messaging alerts wrapper
│
├── uploads/                    # Local upload directory (fallback)
└── package.json                # Project dependencies and startup scripts
```

---

## ⚙️ Environment Configuration

To run KisaanConnect, create a `.env` file in the root directory based on the `.env.example` template:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_secure_session_secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kisaanconnect # Or your MongoDB Atlas connection string

# Email/Nodemailer Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
SUPPORT_EMAIL=your-email@gmail.com

# Firebase Cloud Messaging Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

*Note: For Firebase messaging setup, place your service account credential JSON file in the project root and point `FIREBASE_SERVICE_ACCOUNT_PATH` to it.*

---

## 💻 Local Setup & Installation

### Prerequisites
- Install **Node.js** (v18.0.0 or higher recommended)
- Install and run **MongoDB** locally, or set up a cluster on **MongoDB Atlas**

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thanush2205/Kisaan-Connect.git
    cd Kisaan-Connect
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Rename `.env.example` to `.env` and fill in your MongoDB, Cloudinary, Firebase, and SMTP mail configurations.

4.  **Start the server:**
    *   For development (uses nodemon):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```

5.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ☁️ Cloudinary Configuration

Cloudinary is used for hosting optimized, CDN-delivered images (profile pictures and crop/equipment listings).

1.  **Create a Free Cloudinary Account**: Register at [Cloudinary](https://cloudinary.com).
2.  **Get Credentials**: Retrieve your Cloud Name, API Key, and API Secret from the Cloudinary dashboard.
3.  **Environment Variables**: Add these credentials to your `.env` file (see the configuration section above).
4.  **Automatic Processing**:
    *   **Profile Pictures**: Saved under the `kisaan-connect/profiles/` folder, auto-cropped (face detection) to 500x500px.
    *   **Crops/Equipment**: Saved under the `kisaan-connect/crops/` folder, scaled to fit within a maximum bounding box of 800x600px.

---

## 🔔 Firebase Cloud Messaging (FCM) Setup

To configure real-time push notifications for chat and admin support responses:

1.  **Create a Firebase Project**: Open the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g., `kisaan-connect`).
2.  **Generate Service Account Private Key**:
    *   Go to **Project Settings** -> **Service Accounts**.
    *   Click **Generate New Private Key**.
    *   Download the JSON file and place it in your project's root folder as `firebase-service-account.json`. (Make sure it matches the name in your `.env` file).
3.  **Enable Cloud Messaging**:
    *   Go to **Project Settings** -> **Cloud Messaging**.
    *   Under **Web Configuration**, generate a key pair (**VAPID Key**).
4.  **Configure Client credentials**:
    *   Add your Firebase Web Config snippet (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) and the VAPID key inside [client/js/firebase-config.js](file:///d:/WT_Project/client/js/firebase-config.js).
    *   Ensure the VAPID Key is also set in the service worker file: [client/firebase-messaging-sw.js](file:///d:/WT_Project/client/firebase-messaging-sw.js).

---

## 🧪 Testing Real-Time Notifications

### 1. Chat Message Notifications
1.  Open two different browser windows (e.g., Chrome and Firefox) and navigate to `http://localhost:3000/Login.html`.
2.  Login as **User A** in Browser 1 and **User B** in Browser 2. Approve browser notifications when prompted.
3.  Have User A navigate to the marketplace and click **Chat** on a listing owned by User B, or open `/chats` directly.
4.  Send a message from User A to User B.
5.  User B will receive an instant desktop push notification alert even when the browser tab is minimized or in the background.

### 2. Admin Support Ticket Updates
1.  Log in as a regular user and open the Support page at `/help`.
2.  Create and submit a support ticket query.
3.  Open another browser/session and log in using an Admin account (such as `thanushreddy934@gmail.com`).
4.  Go to the Admin Desk at `/admin-help` and submit a reply/resolution to the ticket.
5.  The user instantly receives a push notification confirming that the ticket has been resolved/responded to by the admin.

---

## 🚀 Deployment to Render.com

This project is configured with zero-downtime deployment for Render.com.

### 📋 Prerequisites
1.  **MongoDB Atlas Database**: Set network access IP to `0.0.0.0/0` (allowing Render's dynamic IPs access).
2.  **Gmail App Password**: Set up standard App Passwords in your Google Account dashboard to enable email notifications.
3.  **Firebase & Cloudinary accounts**: Get keys and download the credentials JSON file.

### ⚡ Deployment Configuration
You can configure a Web Service on Render using the following parameters:
-   **Environment**: `Node`
-   **Build Command**: `npm install`
-   **Start Command**: `npm start`
-   **Environment Variables**: Input all variables specified in the `.env` section.
-   **Secret Files**: Create a secret file named `firebase-service-account.json` and paste your Firebase credential JSON contents directly into it.

Once deployed, remember to add your newly generated Render domain (e.g., `https://kisaan-connect-3.onrender.com`) to the **Authorized Domains** section of your Firebase Console.

---

## 📝 License & Authors

- **Authors**:
  - Thanush ([thanush2205](https://github.com/thanush2205))
  - Chandragiri Sai Tharun ([ChandragiriSaiTharun](https://github.com/ChandragiriSaiTharun))
- **License**: ISC License

