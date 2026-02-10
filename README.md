# Staffly HRMS

Staffly is a modern Human Resource Management System (HRMS) designed to streamline workforce management. It provides a comprehensive solution for managing employees, attendance, payroll, and more, wrapped in a beautiful and responsive user interface.

## 🚀 Features

-   **Role-Based Access Control**: Secure login for Admins and Employees.
-   **Employee Management**: Add, update, and manage employee records.
-   **Attendance Tracking**: Monitor employee attendance and working hours.
-   **Payroll Management**: Generate and view payroll slips.
-   **Leave Management**: Apply for leaves and manage approval workflows.
-   **Responsive Design**: Built with a mobile-first approach using Tailwind CSS.
-   **Modern UI/UX**: clean and intuitive interface with smooth animations.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Vite
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v14 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## ⚙️ Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Staffly
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

## 🔧 Configuration

Create a `.env` file in the `server` directory with the following environment variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/staffly
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

> **Note**: Replace `your_jwt_secret_key` with a secure random string. If using MongoDB Atlas, update `MONGODB_URI` with your connection string.

## 🏃‍♂️ Running the Application

1.  **Start the Backend Server**
    ```bash
    cd server
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the Frontend Client**
    ```bash
    cd client
    npm run dev
    ```
    The client will start on `http://localhost:5173` (or the next available port).

3.  **Access the App**
    Open your browser and navigate to the client URL provided by Vite.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
