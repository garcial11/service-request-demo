# Service Request System

A Firebase-powered service request management system that allows project managers to create service requests and contractors to submit quotes and manage jobs.

## Features

- **Project Manager Dashboard**
  - Create service requests (Contractor, Handyman, Cleaning)
  - Review and approve/reject contractor quotes
  - Track active and completed jobs
  - Upload images for service requests

- **Contractor Dashboard**
  - View available service requests
  - Submit quotes with pricing and time estimates
  - Manage active jobs
  - Mark jobs as complete
  - View job history

- **Real-time Updates**
  - Live counter updates
  - Automatic data synchronization
  - Firebase Firestore integration

## File Structure

```
service-request-system/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # All CSS styles
├── js/
│   ├── config/
│   │   └── firebase-config.js # Firebase configuration
│   ├── services/
│   │   ├── firebase-service.js # Firebase operations
│   │   └── storage-service.js  # Image upload handling
│   ├── components/
│   │   ├── auth.js            # Authentication & navigation
│   │   ├── dashboard.js       # Dashboard functionality
│   │   ├── request-form.js    # Request form handling
│   │   └── modals.js          # Modal functionality
│   ├── utils/
│   │   └── helpers.js         # Utility functions
│   └── app.js                 # Main application initialization
└── README.md
```

## Setup Instructions

1. **Firebase Setup**
   - Update `js/config/firebase-config.js` with your Firebase project credentials
   - Ensure Firestore and Storage are enabled in your Firebase project

2. **Deploy**
   - Host the files on a web server (Firebase Hosting, Netlify, etc.)
   - Or run locally using a local development server

3. **Usage**
   - Open the application in a web browser
   - Choose "Project Manager Login" to create requests
   - Choose "Contractor Login" to view and quote on requests

## Key Components

### FirebaseService
Handles all Firebase operations including:
- Database initialization
- Real-time listeners
- Connection status monitoring
- Sample data creation

### Dashboard
Manages the display and interaction for both contractor and manager views:
- Request listings
- Quote management
- Job status updates

### RequestForm
Handles service request creation:
- Form validation
- Image upload
- Request submission

### Auth
Simple role-based navigation between contractor and manager dashboards.

## Database Structure

The Firestore database uses a single `requests` collection with documents containing:
- `serviceType`: contractor | handyman | cleaning
- `projectName`: Title of the project
- `description`: Detailed description
- `priority`: high | medium | low
- `deadline`: Date string
- `status`: pending | quoted | approved | completed
- `images`: Array of image URLs
- Timestamp fields for tracking workflow stages

## Customization

To modify the system:
1. Update `firebase-config.js` for your Firebase project
2. Modify `styles.css` for appearance changes
3. Extend functionality in the respective component files
4. Add new service types in the request form and display logic

## Browser Compatibility

Compatible with modern browsers that support:
- ES6+ JavaScript features
- Firebase SDK v9
- CSS Grid and Flexbox