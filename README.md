# ⚔️ Legends of Ymir Account Marketplace

A modern, user-friendly web application for buying and selling Legends of Ymir game accounts. Built with Nuxt 3, Vue 3, Tailwind CSS, and Supabase.

## ✨ Features

- 🎮 **Beautiful UI/UX** - Modern, friendly design with smooth animations and dark/light mode
- 📝 **Easy Listing Creation** - Simple form to post account listings with images
- 🔍 **Browse Listings** - View all available accounts in a beautiful card layout
- 🔐 **User Authentication** - Register and login system
- 💾 **Persistent Storage** - Uses Supabase PostgreSQL database (with in-memory fallback)
- 📸 **Image Upload** - Upload multiple screenshots of your account
- ⚔️ **Class Selection** - Choose from Archer, Skald, Volva, or Warlord
- 🌐 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd middleman-webapp
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Supabase database (see Database Setup below)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Setup

This app uses **Supabase** (PostgreSQL) for persistent data storage. The app will work without a database (using in-memory storage), but data will be lost when the server restarts.

### Option 1: Supabase (Recommended)

**Supabase** is a free, open-source Firebase alternative with PostgreSQL database, authentication, and real-time features.

#### Steps:

1. **Create a Supabase account** at [https://supabase.com](https://supabase.com)

2. **Create a new project**:
   - Go to your dashboard
   - Click "New Project"
   - Choose a name, database password, and region
   - Wait for the project to be created (takes ~2 minutes)

3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your "Project URL" (SUPABASE_URL)
   - Copy your "anon public" key (SUPABASE_ANON_KEY)

4. **Set up the database schema**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run" to execute the SQL

5. **Configure environment variables**:
   - Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   - Replace with your actual values from step 3

6. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Option 2: Other Database Options

If you prefer a different database, here are some alternatives:

#### MongoDB Atlas
- Free tier: 512MB storage
- NoSQL database
- Easy to set up
- Would require updating `server/utils/db.ts` to use MongoDB driver

#### PlanetScale
- Free tier: 5GB storage
- MySQL-compatible
- Serverless scaling
- Would require updating schema to MySQL syntax

#### Firebase Firestore
- Free tier: 1GB storage, 50K reads/day
- NoSQL database
- Real-time updates
- Would require Firebase SDK integration

#### Railway / Render PostgreSQL
- Free tier available
- Managed PostgreSQL
- Would use same Supabase client (just change connection string)

### Current Database Schema

The app uses two main tables:

- **users**: Stores user accounts (email, password)
- **listings**: Stores account listings (nickname, server, growth power, price, images, etc.)

See `database/schema.sql` for the complete schema.

## 🛠️ Development

### Project Structure

```
middleman-webapp/
├── app/
│   ├── app.vue          # Main application component
│   └── assets/
│       └── css/
│           └── main.css # Tailwind CSS
├── server/
│   ├── api/
│   │   ├── auth/        # Authentication endpoints
│   │   └── listings.*    # Listing endpoints
│   └── utils/
│       ├── db.ts        # Database utilities
│       ├── supabase.ts  # Supabase client
│       ├── listingsStore.ts  # In-memory fallback
│       └── usersStore.ts     # In-memory fallback
├── database/
│   └── schema.sql       # Database schema
└── nuxt.config.ts       # Nuxt configuration
```

### Tech Stack

- **Framework**: Nuxt 3
- **UI**: Vue 3 + Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript

## 📝 Usage

1. **Register/Login**: Click "Login / Register" to create an account
2. **Post Listing**: Fill out the form with account details, upload images, and submit
3. **Browse Listings**: View all available accounts in the "Browse Listings" tab
4. **Contact Sellers**: Use the contact information provided in each listing

## 🔒 Security

This application includes comprehensive security measures:

✅ **Implemented Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- Input validation and sanitization
- Rate limiting (5 req/min for auth, 100 req/min for API)
- Security headers (CSP, XSS Protection, etc.)
- File upload validation (type, size limits)
- SQL injection prevention (via Supabase)
- Error handling that doesn't expose sensitive info
- Row Level Security (RLS) policies

📖 **See [SECURITY.md](./SECURITY.md) for detailed security documentation**

⚠️ **Production Requirements:**
1. Always use HTTPS in production
2. Set environment variables securely
3. Review and test RLS policies
4. Use strong admin passwords
5. Enable database backups
6. Monitor for suspicious activity

📦 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide**

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Create new site in Netlify
3. Add environment variables
4. Deploy!

### Deploy to Railway / Render

1. Connect your GitHub repository
2. Add environment variables
3. Deploy!

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Future Enhancements

- [ ] Search and filter listings
- [ ] User profiles and seller ratings
- [ ] Favorite/bookmark listings
- [ ] Email notifications
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Image optimization and CDN
- [ ] Real-time chat between buyers and sellers
