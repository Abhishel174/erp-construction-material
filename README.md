# Ichhya Kamana Suppliers - ERP System

A complete, modern Enterprise Resource Planning (ERP) web application for managing vehicles, drivers, trips, wages, and reports for Nepali construction material suppliers.

## 🎯 Features

### Core Modules
- **Dashboard**: Real-time overview with stats, charts, and recent activities
- **Vehicle Management**: Complete vehicle lifecycle management with trip history
- **Driver Management**: Driver records and independent management
- **Trip Recording**: Vehicle-wise trip tracking with wages
- **Driver Advances**: Manage driver advance payments and balances
- **Reports**: Comprehensive reporting with PDF/Excel export
- **Settings**: Company configuration and system settings

### Technical Features
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Modern, clean UI with professional cards and animations
- ✅ Authentication & Authorization
- ✅ Advanced filtering and search
- ✅ Beautiful charts and data visualization
- ✅ Multi-format export (PDF, Excel, CSV)
- ✅ Print-friendly reports
- ✅ Local data persistence (SQLite)
- ✅ Toast notifications
- ✅ Auto-save functionality
- ✅ Keyboard shortcuts
- ✅ Recent activity logging

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- SQLite Database
- JWT Authentication
- Sequelize ORM
- Joi Validation

### Frontend
- React 18 + Vite
- Modern CSS with CSS Variables
- Context API for state management
- Chart.js for visualization
- jsPDF & xlsx for exports

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Default Credentials
```
Username: admin
Password: admin123
```

## 📋 Project Structure

```
backend/              # Node.js + Express API
├── config/           # Configuration files
├── controllers/      # Business logic
├── models/          # Database models
├── middleware/      # Auth, validation
├── routes/          # API endpoints
└── utils/           # Helper functions

frontend/            # React + Vite UI
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── context/     # Global state
│   ├── utils/       # Helpers
│   └── styles/      # CSS
```

## 🎯 Core Modules

### 1. Dashboard
- Total vehicles, drivers, trips, wages
- Daily and monthly charts
- Recent activities
- Quick navigation

### 2. Vehicle Management
- CRUD operations
- Vehicle status tracking
- Trip history per vehicle
- Search and filter

### 3. Driver Management
- Driver information
- Contact details
- License & citizenship
- Status tracking

### 4. Trip Recording
- Vehicle-wise trips (Date, From, To, Material, Wage)
- No driver selection required
- Complete trip history
- CRUD operations

### 5. Driver Advances
- Advance payment tracking
- Balance calculation
- Remarks and notes
- Advance reports

### 6. Reports
- Daily, weekly, monthly, yearly
- Vehicle-wise analysis
- Material-wise tracking
- PDF/Excel/CSV export

### 7. Settings
- Company info configuration
- User password management
- Database backup/restore
- Dark mode toggle

## 🔐 Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- CORS protection
- Rate limiting

## 📱 Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop experience
- Touch-friendly UI

## 📞 Support

For issues, contact the development team.

---

**Built for Ichhya Kamana Suppliers**
