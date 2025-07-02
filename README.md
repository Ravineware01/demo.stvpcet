# SalesMart - Complete E-Commerce Platform

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</div>

## 🚀 Overview

SalesMart is a full-featured, modern e-commerce platform built with the MERN stack. It includes advanced features like AI-powered product recommendations, comprehensive admin dashboard, secure payment processing with Stripe, and a beautiful, responsive user interface.

## ✨ Features

### 🛍️ **Customer Features**
- **User Authentication & Authorization** - JWT-based secure login/registration
- **Product Browsing** - Advanced search, filtering, and sorting capabilities
- **Shopping Cart & Wishlist** - Persistent cart and wishlist functionality
- **Secure Checkout** - Stripe payment integration with multiple payment methods
- **Order Tracking** - Real-time order status updates and history
- **Product Reviews & Ratings** - User-generated content and feedback
- **User Profiles** - Manage addresses, preferences, and order history
- **AI-Powered Recommendations** - Personalized product suggestions

### 👨‍💼 **Admin Features**
- **Comprehensive Dashboard** - Real-time analytics and insights
- **Inventory Management** - Product CRUD operations and stock tracking
- **Order Management** - Process orders, update status, and handle refunds
- **User Management** - View and manage customer accounts
- **Sales Analytics** - Revenue tracking, best-selling products, and trends
- **Content Management** - Manage categories, brands, and product data

### 🤖 **AI Features**
- **Collaborative Filtering** - Recommendations based on user behavior
- **Content-Based Filtering** - Suggestions based on product attributes
- **Trending Products** - AI-driven trend analysis
- **Seasonal Recommendations** - Context-aware product suggestions
- **Search Intelligence** - NLP-powered search improvements

### 🔧 **Technical Features**
- **Responsive Design** - Mobile-first, cross-device compatibility
- **Real-time Updates** - Live notifications and status updates
- **Data Security** - Encrypted passwords, secure API endpoints
- **Performance Optimized** - Efficient database queries and caching
- **Scalable Architecture** - Microservices-ready structure
- **Error Handling** - Comprehensive error management
- **API Documentation** - Well-documented REST API

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching
- **Stripe React** - Payment form components
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form validation and management
- **Chart.js** - Data visualization
- **React Icons** - Icon library

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email functionality
- **Express Validator** - Input validation
- **Helmet** - Security middleware

### **AI/ML**
- **TensorFlow.js** - Machine learning library
- **Natural** - Natural language processing
- **ML-Matrix** - Matrix operations for recommendations

### **DevOps & Tools**
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server
- **Compression** - Response compression
- **Morgan** - HTTP request logging
- **Rate Limiting** - API protection

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account for payments
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/salesmart-ecommerce.git
cd salesmart-ecommerce
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salesmart
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Start MongoDB (if local)
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start the Application
```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately
npm run server  # Backend only
npm run client  # Frontend only
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Default Login Credentials

After seeding the database, you can use these credentials:

### Admin Account
- **Email**: admin@salesmart.com
- **Password**: admin123

### User Account
- **Email**: john.doe@email.com
- **Password**: password123

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update user profile
PUT  /api/auth/password    - Change password
POST /api/auth/forgot-password - Forgot password
PUT  /api/auth/reset-password/:token - Reset password
```

### Product Endpoints
```
GET    /api/products              - Get all products (with filters)
GET    /api/products/:id          - Get single product
POST   /api/products              - Create product (Admin)
PUT    /api/products/:id          - Update product (Admin)
DELETE /api/products/:id          - Delete product (Admin)
POST   /api/products/:id/reviews  - Add product review
GET    /api/products/top/rated    - Get top rated products
GET    /api/products/featured/list - Get featured products
```

### Order Endpoints
```
POST /api/orders              - Create new order
GET  /api/orders/my-orders    - Get user's orders
GET  /api/orders/:id          - Get order by ID
PUT  /api/orders/:id/pay      - Mark order as paid
PUT  /api/orders/:id/cancel   - Cancel order
GET  /api/orders              - Get all orders (Admin)
PUT  /api/orders/:id/status   - Update order status (Admin)
```

### User Management Endpoints
```
POST   /api/users/cart                    - Add to cart
GET    /api/users/cart                    - Get cart
PUT    /api/users/cart/:productId         - Update cart item
DELETE /api/users/cart/:productId         - Remove from cart
POST   /api/users/wishlist/:productId     - Add to wishlist
GET    /api/users/wishlist                - Get wishlist
DELETE /api/users/wishlist/:productId     - Remove from wishlist
POST   /api/users/addresses               - Add address
GET    /api/users/addresses               - Get addresses
PUT    /api/users/addresses/:addressId    - Update address
DELETE /api/users/addresses/:addressId    - Delete address
```

### AI Recommendations Endpoints
```
GET /api/recommendations/personalized      - Get personalized recommendations
GET /api/recommendations/product/:id       - Get product-specific recommendations
GET /api/recommendations/trending          - Get trending products
GET /api/recommendations/search            - Get search-based recommendations
GET /api/recommendations/seasonal          - Get seasonal recommendations
```

### Payment Endpoints
```
POST /api/payments/create-payment-intent  - Create Stripe payment intent
POST /api/payments/confirm-payment        - Confirm payment
POST /api/payments/refund                 - Process refund (Admin)
GET  /api/payments/methods                - Get payment methods
POST /api/payments/webhook                - Stripe webhook handler
```

### Admin Dashboard Endpoints
```
GET /api/admin/dashboard           - Get dashboard analytics
GET /api/admin/users              - Get all users
GET /api/admin/users/:id          - Get single user
PUT /api/admin/users/:id          - Update user
DELETE /api/admin/users/:id       - Delete user
GET /api/admin/products/analytics - Get product analytics
GET /api/admin/sales/analytics    - Get sales analytics
GET /api/admin/export/:type       - Export data
```

## 🏗️ Project Structure

```
salesmart-ecommerce/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   ├── utils/             # Utility functions
│   │   ├── styles/            # CSS/SCSS files
│   │   └── App.js             # Main App component
│   └── package.json
├── server/                     # Node.js backend
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route handlers
│   ├── middleware/            # Custom middleware
│   ├── scripts/               # Utility scripts
│   ├── server.js              # Express server setup
│   └── package.json
├── package.json               # Root package.json
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas for production
3. **Stripe**: Configure webhooks in Stripe dashboard
4. **Build**: The server is ready for production deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build**: `npm run build` in client directory
2. **Environment**: Set React environment variables
3. **Routing**: Configure redirects for SPA routing

### Docker Deployment

```dockerfile
# Example Dockerfile for the backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Performance Optimizations

- **Database Indexing** - Optimized MongoDB indexes for fast queries
- **API Caching** - Redis caching for frequently accessed data
- **Image Optimization** - Cloudinary for image processing and CDN
- **Code Splitting** - React lazy loading for better performance
- **Compression** - Gzip compression for API responses
- **Rate Limiting** - API protection against abuse

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Input Validation** - Express-validator for data validation
- **CORS Protection** - Configured CORS policies
- **Helmet Security** - Security headers middleware
- **Rate Limiting** - Protection against brute force attacks
- **SQL Injection Prevention** - Mongoose built-in protection

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run all tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [@yourlinkedin](https://linkedin.com/in/yourlinkedin)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Stripe](https://stripe.com) for payment processing
- [MongoDB](https://mongodb.com) for database
- [Unsplash](https://unsplash.com) for sample images
- [React](https://reactjs.org) team for the amazing library
- All open-source contributors

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact the maintainer.

---

<div align="center">
  Made with ❤️ by the SalesMart Team
</div>
