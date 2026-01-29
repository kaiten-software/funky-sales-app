# 🎮 PlayZone POS Sales Tracker

A modern, comprehensive sales tracking and reporting system for multi-location entertainment businesses with multiple POS terminals across different cities.

## ✨ Features

### 🔐 User Management
- **Three User Roles**: Super Admin, Administrator, and Regular User
- **Role-Based Access Control**: Different permissions for different user types
- **JWT Authentication**: Secure token-based authentication
- **User-POS Assignment**: Flexible assignment of users to multiple POS terminals

### 📊 Sales Data Entry
- **Multi-Step Wizard**: Intuitive step-by-step data entry process
- **POS Selection**: Easy selection from assigned POS terminals
- **Configurable Sales Types**: Cash, Bank Deposit, Coupons, and custom types
- **File Attachments**: Upload receipts and supporting documents
- **Validation**: Ensures all required fields are filled
- **Date Restrictions**: Regular users can only enter data for current date (IST)

### 📈 Reports & Analytics
- **Interactive Charts**: Line charts, bar charts, and pie charts using Recharts
- **Date Range Filters**: Today, Yesterday, Last 7 Days, Last Month, This Quarter, Custom Range
- **Location Filters**: Filter by city, location, or specific POS
- **Sales Type Filters**: Toggle individual sales types on/off
- **Detailed Tables**: Comprehensive breakdown of all sales data
- **Export Capabilities**: Export reports for further analysis

### ✅ Submission Tracking
- **Daily Monitoring**: Track which POS terminals have submitted data
- **Status Indicators**: Visual indicators for submitted/not submitted
- **User Information**: See who is responsible for each POS
- **Follow-up Tools**: Easy identification of pending submissions

### ⚙️ Admin Panel
- **Cities Management**: Add, edit, delete, and manage cities
- **Locations Management**: Manage locations within cities
- **POS Management**: Configure POS terminals
- **User Management**: Create and manage user accounts
- **Sales Types Configuration**: Define and configure sales types with attachment rules
- **Status Management**: Activate/deactivate entities while preserving historical data

## 🎨 Design Features

### Modern UI/UX
- **Dark Theme**: Beautiful dark mode with vibrant gradients
- **Glassmorphism**: Modern glass-effect cards with backdrop blur
- **Smooth Animations**: Micro-animations for enhanced user experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Premium Typography**: Google Fonts (Inter, Outfit)
- **Color Palette**: Deep purple/blue, vibrant cyan/teal, warm orange/pink accents

### Visual Effects
- **Gradient Backgrounds**: Animated gradient orbs on login page
- **Hover Effects**: Interactive hover states on all clickable elements
- **Loading States**: Elegant loading spinners and skeleton screens
- **Status Badges**: Color-coded badges for different statuses
- **Chart Visualizations**: Beautiful, interactive charts

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Lightning-fast build tool
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Recharts**: Beautiful, responsive charts
- **date-fns**: Date manipulation library

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **MariaDB/MySQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Multer**: File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MariaDB or MySQL (v10.5 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd jatin-accounting-software
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup

1. Create a new MariaDB database:
```bash
mysql -u root -p
CREATE DATABASE pos_sales_tracker;
exit
```

2. Import the database schema:
```bash
mysql -u root -p pos_sales_tracker < server/database/schema.sql
```

### Step 4: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update with your settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_sales_tracker
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
```

### Step 5: Create Uploads Directory
```bash
mkdir server/uploads
```

### Step 6: Generate Password Hashes

You need to generate bcrypt hashes for the demo users. Run this script:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log('admin123:', bcrypt.hashSync('admin123', 10)); console.log('manager123:', bcrypt.hashSync('manager123', 10)); console.log('user123:', bcrypt.hashSync('user123', 10));"
```

Update the password hashes in `server/database/schema.sql` with the generated values, then re-import the schema.

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the server:
```bash
NODE_ENV=production npm run server
```

## 👥 Demo Credentials

### Super Admin
- **Email**: admin@playzone.com
- **Password**: admin123
- **Permissions**: Full system access, manage all configurations

### Administrator
- **Email**: manager@playzone.com
- **Password**: manager123
- **Permissions**: View all data, access reports, track submissions

### Regular User
- **Email**: user@playzone.com
- **Password**: user123
- **Permissions**: Enter data for assigned POS, view today's data only

## 📁 Project Structure

```
jatin-accounting-software/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Layout.jsx           # Main layout with sidebar
│   │   └── Layout.css
│   ├── pages/                    # Page components
│   │   ├── Login.jsx            # Login page
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── DataEntry.jsx        # Sales data entry
│   │   ├── Reports.jsx          # Reports and analytics
│   │   ├── SubmissionTracker.jsx # Submission tracking
│   │   └── AdminPanel.jsx       # Admin configuration
│   ├── context/                  # React context
│   │   └── AuthContext.jsx      # Authentication context
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── server/                       # Backend source code
│   ├── config/                   # Configuration files
│   │   └── database.js          # Database connection
│   ├── routes/                   # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── dashboard.js         # Dashboard routes
│   │   ├── pos.js               # POS routes
│   │   ├── salesTypes.js        # Sales types routes
│   │   ├── salesEntries.js      # Sales entries routes
│   │   ├── reports.js           # Reports routes
│   │   ├── submissions.js       # Submissions routes
│   │   └── admin.js             # Admin routes
│   ├── middleware/               # Express middleware
│   │   └── auth.js              # Authentication middleware
│   ├── database/                 # Database files
│   │   └── schema.sql           # Database schema
│   ├── uploads/                  # File uploads directory
│   └── index.js                  # Server entry point
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
└── README.md                     # This file
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Different permissions for different roles
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Validation**: Type and size restrictions
- **CORS Protection**: Configured CORS policy

## 📊 Database Schema

### Main Tables
- **users**: User accounts and permissions
- **cities**: City master data
- **locations**: Location master data (linked to cities)
- **pos**: POS terminal master data
- **user_pos**: User-POS assignments (many-to-many)
- **sales_types**: Configurable sales types
- **sales_entries**: Daily sales entries
- **sales_entry_details**: Detailed breakdown of each entry

### Views
- **v_sales_entries_complete**: Complete sales entry information
- **v_sales_by_type**: Sales breakdown by type

## 🎯 Key Workflows

### Regular User Workflow
1. Login with credentials
2. Select assigned POS terminal
3. Enter sales data for all types
4. Upload required attachments
5. Review and submit

### Administrator Workflow
1. Login with admin credentials
2. View dashboard with overall stats
3. Access reports with filters
4. Track daily submissions
5. Follow up on pending submissions

### Super Admin Workflow
1. Login with super admin credentials
2. Access admin panel
3. Manage cities, locations, POS
4. Create and manage users
5. Configure sales types
6. Assign users to POS terminals

## 🔧 Configuration

### Adding New Sales Types
1. Login as Super Admin
2. Go to Admin Panel → Sales Types
3. Click "Add New"
4. Configure name and attachment rules
5. Save

### Adding New POS Terminal
1. Ensure city and location exist
2. Go to Admin Panel → POS
3. Click "Add New"
4. Select city and location
5. Enter POS name
6. Save

### Assigning Users to POS
1. Go to Admin Panel → Users
2. Select user
3. Assign POS terminals
4. Save

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MariaDB is running
- Check credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `.env`
- Update proxy in `vite.config.js`

### File Upload Issues
- Ensure `server/uploads` directory exists
- Check file permissions
- Verify file size limits

## 📈 Future Enhancements

- [ ] Email notifications for pending submissions
- [ ] SMS alerts for administrators
- [ ] Advanced analytics with AI insights
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export to Excel/PDF
- [ ] Automated backup system
- [ ] Audit logs

## 📄 License

This project is proprietary software developed for entertainment business management.

## 👨‍💻 Support

For support, please contact your system administrator or development team.

---

**Built with ❤️ using modern web technologies**
