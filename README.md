# 🚀 CryptoGroup - Modern Crypto Website with Live API

A cutting-edge, responsive static website built with Vue.js 3 and Vite, featuring real-time cryptocurrency data, modern design, and interactive components. This website showcases a cryptocurrency community group with live market data integration.

## ✨ Features

- **🚀 Real-Time Crypto Data**: Live market prices, trends, and statistics via CoinGecko API
- **🎨 Modern Design System**: Beautiful gradient backgrounds with glassmorphism effects
- **📱 Responsive Layout**: Mobile-first design that works perfectly on all devices
- **⚡ Interactive Components**: Hover effects, animations, and smooth transitions
- **🔄 Auto-Refresh**: Configurable data refresh intervals (10s to 5min)
- **📊 Live Market Dashboard**: Real-time crypto prices, top gainers/losers, and market overview
- **🔧 API Demo Section**: Interactive testing and demonstration of crypto API functionality
- **🎯 Vue.js 3 Composition API**: Modern, maintainable code structure
- **⚙️ Vite Build Tool**: Fast development and build tooling
- **🎭 CSS Grid & Flexbox**: Modern CSS layout techniques
- **♿ Accessibility**: Proper focus states and semantic HTML

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CryptoHeader.vue      # Navigation header
│   ├── CryptoHero.vue        # Hero section with live crypto cards
│   ├── LiveMarketData.vue    # Real-time market data dashboard
│   ├── CryptoFeatures.vue    # Features grid with badges
│   ├── CryptoAbout.vue       # About section with stats
│   ├── CryptoDemo.vue        # API demo and testing interface
│   └── CryptoFooter.vue      # Footer with contact info
├── composables/
│   └── useCrypto.js          # Vue 3 composable for crypto data
├── services/
│   └── cryptoApi.js          # CoinGecko API service
├── assets/
│   ├── main.css              # Global styles and design system
│   └── base.css              # Base CSS reset
├── App.vue                   # Main app component
└── main.js                   # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cryptostaticweb
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design Features

- **CSS Design System**: Comprehensive CSS variables for consistent theming
- **Gradient Backgrounds**: Beautiful purple-blue gradients throughout
- **Glassmorphism**: Semi-transparent cards with backdrop blur effects
- **Interactive Elements**: Hover animations, smooth transitions, and micro-interactions
- **Modern Typography**: Inter font family for clean readability
- **Responsive Grid**: CSS Grid layouts that adapt to screen sizes
- **Animation System**: Fade-in, float, and shimmer animations
- **Color Schemes**: Success, warning, and accent color gradients

## 📊 Crypto API Integration

### Features
- **Real-time Market Data**: Live prices from CoinGecko API
- **Auto-refresh**: Configurable intervals (10s, 30s, 1min, 5min)
- **Data Caching**: 30-second cache to reduce API calls
- **Error Handling**: Graceful fallback with offline data
- **Multiple Endpoints**: Market data, trending coins, global stats

### API Endpoints Used
- Market data for selected cryptocurrencies
- Trending cryptocurrencies
- Global market statistics
- Individual coin details

### Data Display
- Live price updates with change indicators
- Market cap and volume formatting
- Top gainers and losers
- Comprehensive market table
- Interactive crypto selection

## 🔧 Interactive Components

### Hero Section
- Live crypto price cards with real-time data
- Market statistics overview
- Trending cryptocurrencies
- Animated background elements

### Live Market Data
- Global market overview cards
- Top performers (gainers/losers)
- Comprehensive market table
- Real-time data refresh

### API Demo
- Interactive cryptocurrency selector
- Configurable refresh intervals
- API status monitoring
- Error handling demonstration

### Features Grid
- Animated feature cards with badges
- Hover effects and transitions
- Responsive grid layout

## 📱 Responsive Design

The website is fully responsive and includes:
- **Mobile-first approach** with progressive enhancement
- **Flexible grid layouts** that adapt to screen sizes
- **Adaptive typography** using CSS clamp()
- **Touch-friendly interactions** optimized for mobile
- **Responsive images** and components
- **Breakpoint system** for consistent layouts

## 🛠️ Technologies Used

- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Vite**: Next-generation frontend tooling
- **CSS3**: Modern CSS features including Grid, Flexbox, and animations
- **HTML5**: Semantic markup and accessibility features
- **CoinGecko API**: Free cryptocurrency data API
- **Inter Font**: Modern, readable typography

## 📄 Website Sections

1. **Header**: Fixed navigation with smooth scrolling
2. **Hero**: Engaging headline with live crypto price cards and market stats
3. **Live Market Data**: Real-time cryptocurrency dashboard with global overview
4. **Features**: Six key benefits with interactive cards and badges
5. **About**: Community information with statistics and values
6. **API Demo**: Interactive testing and demonstration of crypto functionality
7. **Footer**: Contact information and social links

## 🎯 Customization

The website is easily customizable:
- **CSS Variables**: Update colors, shadows, and spacing in `:root`
- **Component Content**: Modify text and data in Vue components
- **API Configuration**: Adjust endpoints and refresh intervals
- **Design System**: Customize gradients, borders, and effects
- **Crypto Selection**: Add/remove cryptocurrencies from the API calls

## 🔌 API Configuration

### Environment Variables
The CoinGecko API is free and doesn't require authentication, but you can:
- Modify the base URL in `cryptoApi.js`
- Adjust cache timeout settings
- Change default cryptocurrency selection
- Customize refresh intervals

### Rate Limiting
- CoinGecko API: 50 calls/minute for free tier
- Built-in caching reduces API calls
- Configurable refresh intervals
- Graceful fallback to offline data

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🚀 Deployment

This is a static website that can be deployed anywhere:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Deploy from the `dist` folder
- **Any Web Server**: Upload the built files to any hosting service

---

Built with ❤️ using Vue.js 3, Vite, and the CoinGecko API
