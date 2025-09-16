# ExpenseTracker

A beautiful expense tracking application built with React, featuring a deep navy theme with glass morphism cards and gradient accents.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔐 Demo Credentials

For quick testing, use these demo credentials:

- **Email**: `demo@local.test`
- **Password**: `DemoPass123`

You can also click the "Demo Login" button on the login page for instant access.

## ✨ Features

- **Beautiful UI**: Deep navy theme with glass morphism cards and gradient accents
- **Transaction Management**: Add, edit, delete, and categorize income/expenses
- **Interactive Dashboard**: Balance cards, charts, and recent transactions
- **Data Export**: Export your transactions to CSV format
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: All data persists in your browser's local storage
- **Demo Data**: Pre-populated with sample transactions for testing

## 🎨 Design System

### Colors
- **Background**: Deep navy (#071124)
- **Cards**: Glass effect with rgba(255,255,255,0.04)
- **Accent Gradient**: Purple to Pink (#5D3FD3 → #FF4D8A)
- **Primary Accent**: Teal (#00C2A8)
- **Text**: Light (#E6EEF8) and muted (#A8B3C6)

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family

## 📊 Data Management

### Reset Demo Data

To reset all data back to the original demo state:

1. Go to **Settings** page
2. Click **"Reset Demo Data"** in the Data Management section
3. Confirm the action

Alternatively, you can manually clear the data:
```javascript
// In browser console:
localStorage.clear();
// Then refresh the page
```

### Data Storage

All data is stored in localStorage with these keys:
- `et_users` - User accounts
- `et_currentUser` - Current session
- `et_categories` - Transaction categories
- `et_transactions` - All transactions

### Seed Data Location

Demo data and seeding logic is located in:
- `src/seed/seedData.js` - Contains all seed data generation
- Automatically runs on first app load

## 🔧 Technical Stack

- **Frontend**: React 18 (JavaScript/JSX)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **State**: React Context API
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main app layout
│   ├── Sidebar.jsx      # Collapsible navigation
│   ├── TopBar.jsx       # Header with user menu
│   ├── BalanceCard.jsx  # Gradient balance display
│   └── TransactionChart.jsx # Weekly trend chart
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.jsx   # Main dashboard
│   ├── TransactionsPage.jsx # Transaction list
│   ├── TransactionForm.jsx  # Add/edit form
│   ├── ProfilePage.jsx # User profile
│   └── SettingsPage.jsx # App settings
├── context/            # React contexts
│   └── AuthContext.jsx # Authentication state
├── utils/              # Utility functions
│   └── transactionUtils.js # Data operations
├── seed/               # Demo data
│   └── seedData.js     # Seed generation
└── styles/            # CSS and design tokens
    └── index.css      # Design system
```

## 🔄 Switching to Real Backend

This app uses localStorage for demo purposes. To connect to a real backend:

1. **API Endpoints**: Replace localStorage calls in `utils/transactionUtils.js` with API calls
2. **Environment Variables**: Add your API base URL to `.env`
3. **Authentication**: Update `context/AuthContext.jsx` to use real auth endpoints
4. **Data Models**: The existing data models are ready for API integration

Example API integration:
```javascript
// In transactionUtils.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export async function getTransactions(userId) {
  const response = await fetch(`${API_BASE}/transactions?userId=${userId}`);
  return response.json();
}
```

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routing in `App.jsx`
2. **Components**: Add to `src/components/` following existing patterns
3. **Utilities**: Add helper functions to `src/utils/`
4. **Styling**: Use design tokens from `src/index.css`

## 🎯 Production Deployment

1. **Build**: `npm run build`
2. **Deploy**: Upload `dist/` folder to your hosting service
3. **Configure**: Set up routing for SPA (redirect all routes to index.html)

## 📱 Mobile Support

The app is fully responsive and works great on mobile devices:
- Collapsible sidebar becomes a mobile menu
- Touch-friendly buttons and inputs
- Optimized layouts for small screens
- Swipe gestures supported

## 🚨 Troubleshooting

### Data Issues
- **Blank app**: Clear localStorage and refresh to re-seed demo data
- **Login issues**: Ensure demo credentials are correct or reset demo data

### Development Issues
- **Port conflicts**: Change port in `vite.config.js` if needed
- **Dependencies**: Delete `node_modules` and run `npm install` if issues persist

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript enabled
- Local storage available

## 📄 License

This project is created for demonstration purposes. Feel free to use and modify as needed.

---

**Built using React + Vite**