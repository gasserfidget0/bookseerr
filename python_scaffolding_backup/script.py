import os
import json

# Create comprehensive deployment structure for Bookseerr
def create_deployment_files():
    
    # Create directory structure
    directories = [
        "bookseerr",
        "bookseerr/src",
        "bookseerr/src/app",
        "bookseerr/src/app/api",
        "bookseerr/src/app/api/auth",
        "bookseerr/src/app/api/books", 
        "bookseerr/src/app/api/requests",
        "bookseerr/src/app/api/users",
        "bookseerr/src/app/api/settings",
        "bookseerr/src/app/api/integrations",
        "bookseerr/src/app/(auth)",
        "bookseerr/src/app/(dashboard)",
        "bookseerr/src/components",
        "bookseerr/src/components/ui",
        "bookseerr/src/lib",
        "bookseerr/src/types",
        "bookseerr/src/hooks",
        "bookseerr/src/middleware",
        "bookseerr/config",
        "bookseerr/docker",
        "bookseerr/docs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    return "Directory structure created"

# Create package.json
def create_package_json():
    package_json = {
        "name": "bookseerr",
        "version": "1.0.0",
        "description": "Book request management system like Overseerr but for books",
        "main": "src/app/page.tsx",
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "type-check": "tsc --noEmit",
            "docker:build": "docker build -t bookseerr .",
            "docker:dev": "docker-compose -f docker-compose.dev.yml up --build",
            "docker:prod": "docker-compose up --build"
        },
        "dependencies": {
            "next": "^14.0.0",
            "@types/node": "^20.0.0",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            "react": "^18.0.0",
            "react-dom": "^18.0.0",
            "typescript": "^5.0.0",
            "tailwindcss": "^3.3.0",
            "autoprefixer": "^10.4.0",
            "postcss": "^8.4.0",
            "@tailwindcss/forms": "^0.5.0",
            "@headlessui/react": "^1.7.0",
            "@heroicons/react": "^2.0.0",
            "clsx": "^2.0.0",
            "jsonwebtoken": "^9.0.0",
            "@types/jsonwebtoken": "^9.0.0",
            "bcryptjs": "^2.4.0",
            "@types/bcryptjs": "^2.4.0",
            "sqlite3": "^5.1.0",
            "better-sqlite3": "^8.7.0",
            "@types/better-sqlite3": "^7.6.0",
            "zod": "^3.22.0",
            "class-variance-authority": "^0.7.0",
            "@tanstack/react-query": "^5.0.0",
            "axios": "^1.6.0",
            "react-hook-form": "^7.47.0",
            "@hookform/resolvers": "^3.3.0",
            "react-hot-toast": "^2.4.0",
            "date-fns": "^2.30.0",
            "lucide-react": "^0.294.0"
        },
        "devDependencies": {
            "eslint": "^8.0.0",
            "eslint-config-next": "^14.0.0",
            "@typescript-eslint/eslint-plugin": "^6.0.0",
            "@typescript-eslint/parser": "^6.0.0",
            "prettier": "^3.0.0",
            "prettier-plugin-tailwindcss": "^0.5.0"
        },
        "engines": {
            "node": ">=18.0.0"
        }
    }
    
    with open("bookseerr/package.json", "w") as f:
        json.dump(package_json, f, indent=2)
    
    return "package.json created"

print("Creating Bookseerr deployment structure...")
print(create_deployment_files())
print(create_package_json())