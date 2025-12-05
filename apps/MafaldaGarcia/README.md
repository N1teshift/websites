# Mafalda Garcia Portfolio

A Next.js portfolio website for Mafalda Garcia, a performance artist exploring artivism, rituals & well-being through interdisciplinary dialogue.

## Features

- **Modern React/Next.js** - Built with TypeScript and modern React patterns
- **Internationalization** - Multi-language support with next-i18next
- **Firebase Integration** - Images served from Firebase Storage
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Performance Optimized** - Image optimization and lazy loading
- **SEO Ready** - Meta tags and structured data

## Project Structure

```
MafaldaGarcia/
├── src/
│   ├── features/
│   │   ├── api/
│   │   │   └── firebase/          # Firebase API integration
│   │   ├── i18n/                  # Internationalization
│   │   ├── logging/               # Error logging and handling
│   │   ├── mafalda-garcia/        # Main portfolio components
│   │   └── shared/                # Shared UI components
│   ├── pages/                     # Next.js pages and API routes
│   └── styles/                    # Global styles
├── public/                        # Static assets
├── locales/                       # Translation files
└── env.example                    # Environment variables template
```

## Image Management

Images are stored in Firebase Storage and served dynamically through the API. The system:
- Automatically scans for available images in Firebase Storage
- Provides placeholder images for missing content
- Handles errors gracefully with fallback images
- Supports multiple image formats (JPG, PNG, WebP)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MafaldaGarcia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env.local
   ```
   
   Configure the following environment variables:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account JSON
   - `FIREBASE_STORAGE_BUCKET` - Firebase Storage bucket name
   - `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL

4. **Run development server**
   ```bash
   npm run dev
   ```

## Deployment

The project is configured for deployment on Vercel with:
- Automatic image optimization
- Edge functions for API routes
- Environment variable management
- Build optimization

## Technologies Used

- **Next.js 13+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Backend services
- **next-i18next** - Internationalization
- **Vercel** - Deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.
