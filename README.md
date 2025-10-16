# Global Real Estate Blockchain Transfer Platform

A blockchain-integrated platform for secure, fast international real estate transactions.

## 🚀 Quick Deploy to Web

### Option 1: Deploy to Railway (Recommended - Full Stack)

Railway hosts both your backend and PostgreSQL database together.

#### Steps:

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository: `valeriotuci-tech/Valerio-Tuci`
   - Railway will auto-detect Node.js

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create and link the database

4. **Set Environment Variables**
   - Go to your service → "Variables"
   - Add these variables:
     ```
     NODE_ENV=production
     JWT_SECRET=your_secure_random_string_here
     JWT_EXPIRE=24h
     PORT=3000
     ```
   - `DATABASE_URL` is automatically set by Railway

5. **Deploy**
   - Railway automatically deploys on every push to main
   - Your app will be live at: `https://your-app.up.railway.app`

---

### Option 2: Deploy to Render (Alternative)

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: real-estate-blockchain
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Copy the Internal Database URL

4. **Set Environment Variables**
   - In your web service, go to "Environment"
   - Add:
     ```
     DATABASE_URL=<your_postgres_url>
     NODE_ENV=production
     JWT_SECRET=<generate_random_string>
     JWT_EXPIRE=24h
     ```

5. **Deploy**
   - Render automatically deploys
   - Your app will be live at: `https://your-app.onrender.com`

---

### Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway:
Follow Railway steps above for backend + database.

#### Deploy Frontend to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (we're using EJS server-side)
   - **Output Directory**: Leave empty
4. Add environment variable:
   ```
   API_URL=<your_railway_backend_url>
   ```

---

### Option 4: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_here
   heroku config:set JWT_EXPIRE=24h
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

## 🔧 Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/valeriotuci-tech/Valerio-Tuci.git
   cd Valerio-Tuci
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/real_estate_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb real_estate_db
   
   # Run migrations (create tables)
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📦 Database Setup

Create the database schema by running these SQL commands:

```sql
-- See db/schema.sql for full schema
-- Or run: npm run migrate
```

---

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRE` | JWT token expiration time | No (default: 24h) |
| `INFURA_PROJECT_ID` | Infura project ID for blockchain | No |
| `CONTRACT_ADDRESS` | Smart contract address | No |

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure PostgreSQL database
- [ ] Run database migrations
- [ ] Test authentication endpoints
- [ ] Test property listing endpoints
- [ ] Configure CORS for production
- [ ] Set up SSL/HTTPS
- [ ] Configure domain name (optional)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (seller only)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Transactions
- `POST /api/transactions` - Create transaction (buyer only)
- `PATCH /api/transactions/:id/verify` - Verify transaction (agent only)
- `PATCH /api/transactions/:id/complete` - Complete transaction (agent only)
- `GET /api/transactions/user` - Get user transactions

### Dashboard
- `GET /api/dashboard` - Get dashboard data

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: EJS, Tailwind CSS, Vanilla JavaScript
- **Authentication**: JWT, bcrypt
- **Blockchain**: Web3.js (ready for integration)

---

## 📝 License

MIT License

---

## 👤 Author

Valerio Tuci
- Email: valerio.tuci@gmail.com
- GitHub: [@valeriotuci-tech](https://github.com/valeriotuci-tech)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!
