# 🪐 Orbit Workspace

> An enterprise-grade project management and collaboration SaaS.

Link - https://enterprise-project-management-syste.vercel.app/login

Orbit Workspace is a high-fidelity, full-stack application designed to streamline team workflows. It features a real-time Kanban board, granular Role-Based Access Control (RBAC), team communication channels, and dynamic data visualization, all wrapped in a premium, highly interactive user interface.

## ✨ Key Features

*   **Advanced Role-Based Access Control (RBAC):** 
    *   Secure multi-tier hierarchy (`SUPER_ADMIN`, `ADMIN`, `EMPLOYEE`, `VIEWER`).
    *   UI dynamically adapts to user permissions (e.g., Viewers experience a strictly read-only environment with locked inputs and grayed-out action states).
*   **Real-Time Kanban Board:** 
    *   Live task synchronization across all connected clients.
    *   Advanced column sorting (Priority, Due Date, Latest) and localized search capsules.
    *   Full CRUD operations with strict authorization checks.
*   **Team Collaboration:** 
    *   Real-time chat channels with text formatting.
    *   Dynamic team directory with role-based color badges and management controls.
*   **Enterprise Dashboard Analytics:** 
    *   Live task velocity charts parsing multi-day workflow data.
    *   Real-time activity feed and automated notification badge tracking.
*   **Premium UI/UX:** 
    *   Custom animated "mesh gradient" authentication screens.
    *   Smooth CSS module transitions, interactive overlays, and precise event-bubbling management.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript
*   **State Management:** Redux Toolkit (Global UI & Auth states)
*   **Backend & Database:** Firebase (Firestore, Authentication)
*   **Styling:** SCSS / CSS Modules
*   **Icons & Visualization:** Lucide React, Recharts (or D3)

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   npm or yarn or pnpm

### Installation

1. **Clone the repository:**
```bash
   git clone https://github.com/RohanMathad/Enterprise_Project_Management_System.git
   cd Enterprise_Project_Management_System

```

2. **Install dependencies:**
```bash
npm install

```


3. **Environment Setup:**
Create a `.env` file in the root directory and add your Firebase configuration keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```


4. **Start the development server:**
```bash
npm run dev

```



## 🔐 Authorization Architecture

Orbit Workspace enforces strict data boundaries. By default, newly registered users are assigned the `VIEWER` role, restricting them to read-only access. `ADMIN` or `SUPER_ADMIN` accounts are required to promote users, delete workspace resources, or modify organizational structures, ensuring high-level security for enterprise data.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
