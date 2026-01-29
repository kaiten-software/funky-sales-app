# Entertainment POS Sales Tracking System - Implementation Plan

## Project Overview
A modern, comprehensive sales tracking and reporting system for a multi-location entertainment business (kids play zones) with multiple POS terminals across different cities.

## Technology Stack
- **Frontend**: React with Vite
- **Styling**: Modern CSS with glassmorphism, gradients, and animations
- **Backend**: Node.js with Express
- **Database**: MariaDB
- **Authentication**: JWT-based authentication
- **UI Components**: Custom-built with premium design

## Core Features

### 1. User Management
- **User Types**:
  - Super Admin (full access)
  - Administrator (view all data, manage reports)
  - Regular User (limited to data entry for current date)
  
- **User Attributes**:
  - Name, Email, Password
  - Role (Super Admin/Administrator/Regular User)
  - Assigned POS terminals
  - Status (Active/Pending/Disabled)
  - Permissions (Can Delete, Can Edit, Can View All)

### 2. Location & POS Management
- **Hierarchy**: Cities → Locations → POS Terminals
  
- **City Management**:
  - City Name
  - Status (Active/Inactive)
  - CRUD operations
  
- **Location Management**:
  - Location Name (e.g., "ABC Mall")
  - Associated City
  - Status (Active/Inactive)
  - CRUD operations
  
- **POS Management**:
  - POS Name/Number (auto-generated or custom)
  - Associated Location & City
  - Assigned Users
  - Status (Active/Inactive)
  - CRUD operations

### 3. Sales Type Configuration
- **Configurable Sales Types**:
  - Default types: Cash Sales, Bank Deposit, Coupon Sales
  - Custom types can be added
  
- **Sales Type Attributes**:
  - Type Name
  - Attachment Applicable (Yes/No)
  - Attachment Required (Yes/No)
  - Status (Active/Inactive)
  - CRUD operations

### 4. Daily Sales Entry (Regular Users)
- **Entry Flow**:
  1. Login → Select POS (if multiple assigned)
  2. Select Date (default: today's date IST)
  3. System displays all active sales types
  4. User enters amount for each type (0 if no sales)
  5. Attach photo if applicable/required
  6. Submit entry
  
- **Validation Rules**:
  - All sales types must have values entered (even if 0)
  - Required attachments must be uploaded
  - Regular users can only enter data for current date (IST)
  - Once submitted, regular users cannot delete
  - Regular users can only view today's data

### 5. Administrative Dashboard
- **Date Range Filters**:
  - Today
  - Yesterday
  - Last 7 Days
  - Last Month
  - This Quarter
  - Custom Date Range (From - To)
  
- **Location Filters**:
  - All Locations
  - Specific City
  - Specific Location
  - Specific POS
  
- **Sales Type Filters**:
  - Toggle individual sales types on/off
  - View combined or separated data
  
- **Data Views**:
  - **Table View**: Detailed breakdown by date, location, POS, sales type
  - **Chart View**: 
    - Line charts for trends
    - Bar charts for comparisons
    - Pie charts for distribution
    - Area charts for cumulative data
  
- **Reports**:
  - Consolidated sales by location
  - Consolidated sales by date
  - Consolidated sales by POS
  - Sales type breakdown
  - Submission status report (who submitted/who didn't)

### 6. Submission Tracking
- **Daily Submission Dashboard**:
  - Select date
  - View all POS terminals
  - Status indicators:
    - ✅ Submitted (green)
    - ❌ Not Submitted (red)
    - ⚠️ Partially Submitted (yellow)
  - Click to view details
  - Contact information for follow-up

### 7. Data Integrity & Permissions
- **Status Management**:
  - Inactive cities/locations/POS cannot accept new entries
  - Historical data remains intact
  - Clear visual indicators for status
  
- **Permission Levels**:
  - Regular User: Add only, view today only
  - Administrator: View all, edit all, delete with permission
  - Super Admin: Full control, manage users, configure system

## Database Schema

### Users Table
```sql
- id (PK)
- name
- email (unique)
- password_hash
- role (enum: super_admin, administrator, regular_user)
- can_delete (boolean)
- can_edit (boolean)
- can_view_all (boolean)
- status (enum: active, pending, disabled)
- created_at
- updated_at
```

### Cities Table
```sql
- id (PK)
- name
- status (enum: active, inactive)
- created_at
- updated_at
```

### Locations Table
```sql
- id (PK)
- name
- city_id (FK)
- status (enum: active, inactive)
- created_at
- updated_at
```

### POS Table
```sql
- id (PK)
- name
- location_id (FK)
- city_id (FK)
- status (enum: active, inactive)
- created_at
- updated_at
```

### User_POS Table (Many-to-Many)
```sql
- id (PK)
- user_id (FK)
- pos_id (FK)
- assigned_at
```

### Sales_Types Table
```sql
- id (PK)
- name
- attachment_applicable (boolean)
- attachment_required (boolean)
- status (enum: active, inactive)
- created_at
- updated_at
```

### Sales_Entries Table
```sql
- id (PK)
- user_id (FK)
- pos_id (FK)
- entry_date (date)
- submitted_at (timestamp)
- status (enum: draft, submitted, approved)
- created_at
- updated_at
```

### Sales_Entry_Details Table
```sql
- id (PK)
- sales_entry_id (FK)
- sales_type_id (FK)
- amount (decimal)
- attachment_path (varchar, nullable)
- notes (text, nullable)
- created_at
- updated_at
```

## UI/UX Design Principles

### Design Aesthetics
- **Color Scheme**: 
  - Primary: Deep purple/blue gradients (#6366f1 to #8b5cf6)
  - Secondary: Vibrant cyan/teal (#06b6d4 to #14b8a6)
  - Accent: Warm orange/pink (#f59e0b to #ec4899)
  - Background: Dark mode with glassmorphism
  
- **Typography**:
  - Headings: 'Outfit' or 'Poppins'
  - Body: 'Inter' or 'Roboto'
  
- **Effects**:
  - Glassmorphism cards with backdrop blur
  - Smooth transitions and hover effects
  - Micro-animations for interactions
  - Gradient borders and backgrounds
  - Shadow depth for hierarchy

### Key Pages
1. **Login Page**: Modern, centered card with gradient background
2. **Dashboard**: Grid layout with stat cards, charts, and quick actions
3. **Data Entry**: Step-by-step wizard with progress indicator
4. **Reports**: Filterable table with interactive charts
5. **Admin Panel**: Tabbed interface for managing all configurations
6. **Submission Tracker**: Calendar view with status indicators

## Implementation Phases

### Phase 1: Project Setup & Database
- Initialize Vite React project
- Set up MariaDB database
- Create database schema
- Set up Express backend with API structure

### Phase 2: Authentication & User Management
- Implement JWT authentication
- Create user registration/login
- Build user management interface
- Implement role-based access control

### Phase 3: Configuration Management
- Build City/Location/POS management
- Create Sales Type configuration
- Implement user-POS assignment
- Add status management

### Phase 4: Data Entry Interface
- Create POS selection interface
- Build sales entry form
- Implement file upload for attachments
- Add validation and submission logic

### Phase 5: Reporting & Analytics
- Build admin dashboard
- Create date range filters
- Implement data visualization (charts)
- Add export functionality

### Phase 6: Submission Tracking
- Create submission status dashboard
- Build notification system
- Add reminder functionality

### Phase 7: Polish & Optimization
- Refine UI/UX
- Add animations and transitions
- Optimize performance
- Implement error handling
- Add loading states

## Security Considerations
- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- SQL injection prevention
- File upload validation
- Role-based access control
- HTTPS enforcement
- Rate limiting on API endpoints

## Deployment Considerations
- Environment variables for configuration
- Database migration scripts
- Backup and recovery procedures
- Logging and monitoring
- Error tracking
- Performance monitoring
