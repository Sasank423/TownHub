# 📚 TownBook - Library Management System

## 🌟 Overview

TownBook is a comprehensive library management system designed to streamline the operations of modern libraries. The platform offers separate interfaces for librarians and members, enabling efficient management of books, rooms, reservations, and user accounts.

example librarian login :-  

    Email    : wisechoice953@gmail.com
    password : Admin@123

## 🚀 Features

### 📖 Book Management
- Complete book catalog with detailed information (title, author, description, etc.)
- Book availability tracking and management
- Add, edit, and delete books from the library collection
- Book reservation system for members

### 🏢 Room Management
- Room reservation system for study spaces and meeting rooms
- Availability calendar with time slot selection
- Room details including capacity, amenities, and location

### 👥 User Management
- Member registration and profile management
- Librarian administrative controls
- Role-based access control
- Authentication system with secure login

### 📅 Reservation System
- Book reservation workflow
- Room booking with date and time selection
- Reservation history tracking
- Approval queue for librarians

### 📊 Dashboard & Analytics
- Member dashboard with current and past reservations
- Librarian dashboard with system overview
- Activity feed showing recent actions
- Usage statistics and reports

## 🛠️ Technology Stack

### Frontend
- **React**: UI library for building the user interface
- **TypeScript**: For type-safe code
- **React Router**: For navigation and routing
- **Tailwind CSS**: For styling and responsive design
- **shadcn/ui**: For UI components and design system
- **Lucide React**: For icons
- **date-fns**: For date manipulation
- **React Hook Form**: For form handling
- **Zod**: For form validation

### Backend & Data
- **Supabase**: For database, authentication, and storage
  - PostgreSQL database
  - Authentication services
  - Storage for images and files

### Development Tools
- **Vite**: For fast development and building
- **ESLint**: For code linting
- **TypeScript**: For static type checking

## 📋 Database Structure

The application uses Supabase with the following main tables:

- **books**: Stores book information (title, author, description, etc.)
- **book_copies**: Tracks individual copies of books and their status
- **rooms**: Contains room information (name, capacity, amenities, etc.)
- **room_availability**: Manages room availability schedules
- **reservations**: Records book and room reservations
- **profiles**: Stores user profile information
- **activities**: Logs user activities for the activity feed

## 🔧 Installation & Setup

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd townbook

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔒 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth, Theme)
├── integrations/     # External service integrations (Supabase)
├── pages/            # Application pages
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

## 👨‍💻 Development Workflow

1. **Feature Development**: Create a new branch for each feature
2. **Testing**: Test the feature thoroughly
3. **Pull Request**: Create a PR for code review
4. **Merge**: After approval, merge to the main branch

## 🚢 Deployment

The application can be deployed using various platforms:

1. **Build the application**:
   ```
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Developed with ❤️ by the TownBook team
