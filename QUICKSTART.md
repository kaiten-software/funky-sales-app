# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed (`node --version`)
- ✅ MariaDB or MySQL installed and running
- ✅ npm installed (`npm --version`)

## 5-Minute Setup

### 1. Database Setup (2 minutes)

```bash
# Login to MySQL/MariaDB
mysql -u root -p

# Create database
CREATE DATABASE pos_sales_tracker;

# Exit MySQL
exit

# Import schema
mysql -u root -p pos_sales_tracker < server/database/schema.sql
```

### 2. Environment Configuration (1 minute)

The `.env` file is already created with default settings. Update only if needed:

```bash
# Edit .env if you need to change database credentials
nano .env
```

Default settings:
- Database: `pos_sales_tracker`
- User: `root`
- Password: (empty)
- Port: `5000`

### 3. Install Dependencies (Already Done!)

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 4. Start the Application (2 minutes)

**Option A: Run Both Frontend and Backend Together**

```bash
# Terminal 1: Start Backend
npm run server

# Terminal 2: Start Frontend (in a new terminal)
npm run dev
```

**Option B: Quick Development Start**

```bash
# Start backend in background
npm run server &

# Start frontend
npm run dev
```

### 5. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🔐 Login Credentials

### Super Admin (Full Access)
- **Email**: `admin@playzone.com`
- **Password**: `admin123`

### Administrator (Reports & Tracking)
- **Email**: `manager@playzone.com`
- **Password**: `manager123`

### Regular User (Data Entry)
- **Email**: `user@playzone.com`
- **Password**: `user123`

## 🎯 First Steps After Login

### As Super Admin:
1. Go to **Admin Panel** (⚙️)
2. Review existing cities, locations, and POS
3. Create new users if needed
4. Assign users to POS terminals

### As Administrator:
1. Check **Dashboard** for overview
2. Go to **Reports** to see sales data
3. Use **Submission Tracker** to monitor daily entries

### As Regular User:
1. Click **Data Entry** (📝)
2. Select your assigned POS
3. Enter sales data for today
4. Upload required attachments
5. Review and submit

## 📊 Sample Data

The database comes pre-loaded with:
- 3 Cities (Mumbai, Delhi, Bangalore)
- 6 Locations (Various malls)
- 7 POS Terminals
- 5 Sales Types (Cash, Bank Deposit, Coupon, Card, UPI)
- 3 Demo Users
- Sample sales entries

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Or for MySQL
sudo systemctl status mysql

# Start if not running
sudo systemctl start mariadb
```

### Port 5000 Already in Use
```bash
# Change PORT in .env file
PORT=5001

# Update vite.config.js proxy target to match
```

### Cannot Login
```bash
# Verify database has users
mysql -u root -p pos_sales_tracker -e "SELECT email, role FROM users;"

# Re-import schema if needed
mysql -u root -p pos_sales_tracker < server/database/schema.sql
```

### File Upload Not Working
```bash
# Ensure uploads directory exists
mkdir -p server/uploads

# Check permissions
chmod 755 server/uploads
```

## 📱 Testing the System

### Test Data Entry Flow:
1. Login as `user@playzone.com`
2. Go to Data Entry
3. Select "POS-MUM-PHX-01"
4. Enter amounts for all sales types
5. Upload a test image for Bank Deposit
6. Submit

### Test Reports:
1. Login as `manager@playzone.com`
2. Go to Reports
3. Select "Last 7 Days"
4. View charts and tables

### Test Admin Functions:
1. Login as `admin@playzone.com`
2. Go to Admin Panel
3. Try viewing different tabs
4. Create a new sales type

## 🎨 Features to Explore

### Beautiful UI Elements:
- 🌈 Gradient backgrounds and glassmorphism effects
- ✨ Smooth animations on hover and interactions
- 📊 Interactive charts with Recharts
- 🎯 Progress indicators for multi-step forms
- 🔔 Status badges with color coding

### Key Functionality:
- 📝 Multi-step data entry wizard
- 📈 Real-time dashboard statistics
- 📊 Interactive reports with filters
- ✅ Submission tracking
- ⚙️ Complete admin configuration

## 🔄 Daily Workflow

### For Regular Users (Morning Routine):
1. Login to system
2. Select your POS terminal
3. Enter yesterday's closing sales
4. Upload bank deposit slip
5. Submit data

### For Administrators (Daily Check):
1. Login to system
2. Check submission tracker
3. Follow up on pending submissions
4. Review daily reports
5. Analyze trends

### For Super Admins (Weekly Tasks):
1. Review user activity
2. Add new locations/POS if needed
3. Manage user permissions
4. Configure new sales types
5. Monitor system health

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review database schema in `server/database/schema.sql`
- Check API routes in `server/routes/`
- Inspect frontend components in `src/`

## 🚀 Next Steps

1. **Customize**: Update company name, logo, and branding
2. **Configure**: Add your actual cities, locations, and POS
3. **Users**: Create real user accounts
4. **Security**: Change JWT_SECRET in production
5. **Deploy**: Set up on production server

---

**You're all set! Enjoy using the POS Sales Tracker! 🎉**
