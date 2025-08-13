# 🚀 CryptoGroup - Nuxt.js Edition

A modern, responsive cryptocurrency community website built with **Nuxt.js 3** and **Tailwind CSS**. This project showcases real-time crypto market data, interactive features, and a beautiful glassmorphism design.

## ✨ Features

- **🚀 Nuxt.js 3** - Latest Vue.js framework with SSR capabilities
- **🎨 Tailwind CSS** - Utility-first CSS framework with custom design system
- **📊 Real-time Crypto Data** - Live market prices via CoinGecko API
- **📱 Responsive Design** - Mobile-first approach with modern UI/UX
- **🔍 SEO Optimized** - Built-in meta tags and structured data
- **⚡ Performance** - Fast loading with optimized builds
- **🎭 Glassmorphism UI** - Beautiful semi-transparent design elements
- **🔄 Auto-refresh** - Live data updates every 30 seconds

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 3, Vue.js 3, Tailwind CSS
- **Styling**: Custom CSS with Tailwind utilities
- **API**: CoinGecko API for cryptocurrency data
- **Build Tool**: Nuxt.js built-in bundler
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cryptonuxt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
cryptonuxt/
├── components/           # Vue components
│   ├── CryptoHeader.vue    # Navigation header
│   ├── CryptoHero.vue      # Hero section
│   ├── LiveMarketData.vue  # Market data dashboard
│   ├── CryptoFeatures.vue  # Features showcase
│   ├── CryptoAbout.vue     # About section
│   └── CryptoFooter.vue    # Footer
├── composables/         # Vue composables
│   └── useCrypto.js       # Crypto data logic
├── services/            # API services
│   └── cryptoApi.js       # CoinGecko API service
├── assets/              # Static assets
│   └── css/
│       └── main.css       # Global styles + Tailwind
├── app.vue              # Main app component
├── nuxt.config.ts       # Nuxt.js configuration
└── package.json         # Dependencies
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`#0ea5e9` to `#8b5cf6`)
- **Secondary**: Purple gradient (`#d946ef` to `#ec4899`)
- **Accent**: Green gradient (`#10b981` to `#3b82f6`)
- **Dark**: Dark theme (`#0f172a` to `#1e293b`)

### Components
- **Glass Cards**: Semi-transparent with backdrop blur
- **Gradient Text**: Beautiful text effects
- **Animated Elements**: Smooth transitions and hover effects
- **Responsive Grid**: Mobile-first layout system

## 📊 API Integration

The website integrates with the **CoinGecko API** to provide:

- Real-time cryptocurrency prices
- Market cap and volume data
- 24h price changes
- Global market statistics
- Top gainers and losers

### Data Features
- **Auto-refresh**: Updates every 30 seconds
- **Caching**: Efficient data management
- **Fallback Data**: Works offline with sample data
- **Error Handling**: Graceful degradation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Generate Static Site
```bash
npm run generate
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Customization

### Adding New Components
1. Create a new `.vue` file in the `components/` directory
2. Nuxt.js will auto-import it
3. Use it directly in your templates

### Modifying Styles
- Edit `assets/css/main.css` for global styles
- Use Tailwind classes for component-specific styling
- Custom CSS variables in `nuxt.config.ts`

### API Configuration
- Modify `services/cryptoApi.js` for different data sources
- Update API endpoints in the service file
- Adjust caching strategies as needed

## 📱 Responsive Design

The website is fully responsive with:
- **Mobile First**: Optimized for small screens
- **Tablet**: Medium screen layouts
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Optimized for touch devices

## 🎯 Performance Features

- **Lazy Loading**: Components load as needed
- **Image Optimization**: Optimized crypto logos
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Efficient data and asset caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **CoinGecko** for providing the cryptocurrency API
- **Tailwind CSS** for the amazing utility framework
- **Nuxt.js** team for the excellent framework
- **Vue.js** community for the reactive framework

---

**Built with ❤️ using Nuxt.js 3 and Tailwind CSS**
