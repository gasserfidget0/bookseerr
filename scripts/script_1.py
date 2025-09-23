# Create Next.js configuration files
def create_nextjs_config():
    # next.config.js
    nextjs_config = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3600',
    DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./bookseerr.db',
    READARR_URL: process.env.READARR_URL,
    READARR_API_KEY: process.env.READARR_API_KEY,
    QBITTORRENT_URL: process.env.QBITTORRENT_URL,
    QBITTORRENT_USERNAME: process.env.QBITTORRENT_USERNAME,
    QBITTORRENT_PASSWORD: process.env.QBITTORRENT_PASSWORD,
  },
  images: {
    domains: ['books.google.com', 'covers.openlibrary.org'],
  },
}

module.exports = nextConfig
'''
    
    # tailwind.config.js
    tailwind_config = '''/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Overseerr-like colors
        overseer: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
}
'''
    
    # tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "es5",
            "lib": ["dom", "dom.iterable", "es6"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "node",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [
                {"name": "next"}
            ],
            "baseUrl": ".",
            "paths": {
                "@/*": ["./src/*"],
                "@/components/*": ["./src/components/*"],
                "@/lib/*": ["./src/lib/*"],
                "@/types/*": ["./src/types/*"],
                "@/hooks/*": ["./src/hooks/*"]
            }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }
    
    # .env.example
    env_example = '''# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=3600

# Database
DATABASE_URL=sqlite:./bookseerr.db

# Readarr Integration
READARR_URL=http://localhost:8787
READARR_API_KEY=your-readarr-api-key

# QBittorrent Integration  
QBITTORRENT_URL=http://localhost:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminpass

# External APIs
GOOGLE_BOOKS_API_KEY=your-google-books-api-key

# Application
NODE_ENV=development
PORT=5055
'''
    
    # Write files
    with open("bookseerr/next.config.js", "w") as f:
        f.write(nextjs_config)
    
    with open("bookseerr/tailwind.config.js", "w") as f:
        f.write(tailwind_config)
    
    with open("bookseerr/tsconfig.json", "w") as f:
        json.dump(tsconfig, f, indent=2)
    
    with open("bookseerr/.env.example", "w") as f:
        f.write(env_example)
    
    # postcss.config.js
    postcss_config = '''module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
'''
    
    with open("bookseerr/postcss.config.js", "w") as f:
        f.write(postcss_config)
    
    return "Next.js configuration files created"

print(create_nextjs_config())