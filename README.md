# To-Do Application

A modern, full-stack to-do application built with ASP.NET Core backend and Next.js frontend, featuring user authentication via Firebase and task management capabilities.

## 🚀 Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Task Management**: Create, read, update, and delete tasks
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS
- **API Documentation**: Interactive Swagger UI for backend APIs
- **Database Integration**: MySQL database hosted on Aiven Cloud
- **Docker Support**: Containerized deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **Framework**: ASP.NET Core 9.0
- **Language**: C#
- **Database**: MySQL (Aiven Cloud)
- **ORM**: Entity Framework Core
- **Authentication**: Firebase JWT
- **API**: RESTful with Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **HTTP Client**: Axios
- **Authentication**: Firebase SDK

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: Netlify (Frontend), Railway/Aiven (Backend)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [Git](https://git-scm.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/poorna-madusith/To-Do-App.git
   cd hospital-appointment-system
   ```

2. **Set up environment variables**

   Copy the `.env` file from the backend directory and configure your environment variables:
   ```bash
   cp ToDo_backend/.env.example ToDo_backend/.env
   ```

   Update the following variables in `ToDo_backend/.env`:
   - Firebase project configuration
   - Aiven MySQL database credentials
   - Other environment-specific settings

3. **Backend Setup**
   ```bash
   cd ToDo_backend
   
   # Restore dependencies
   dotnet restore
   
   # Run database migrations
   dotnet ef database update
   
   # Run the application
   dotnet run
   ```

   The backend will be available at `http://localhost:5286`

4. **Frontend Setup**
   ```bash
   cd ../todo-frontend
   
   # Install dependencies
   pnpm install
   
   # Run development server
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment (Alternative)

For containerized deployment:

1. Ensure Docker and Docker Compose are installed
2. Set up your `.env` file as described above
3. Run the following command from the `ToDo_backend` directory:

   ```bash
   docker-compose up --build
   ```

   - Backend: `http://localhost:8080`
   - Frontend: `http://localhost:3000`

## 📖 Usage

1. **Register**: Create a new account using the registration form
2. **Login**: Sign in with your credentials
3. **Dashboard**: View and manage your tasks
4. **Add Tasks**: Create new tasks with titles and descriptions
5. **Edit/Delete**: Modify or remove existing tasks

## 🔌 API Documentation

When running in development mode, the API documentation is available at:
`http://localhost:5286/swagger`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



