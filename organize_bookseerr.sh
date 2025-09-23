#!/bin/bash
# Run this script from inside your exported-assets directory

# Create key directories
mkdir -p src/app/api src/components src/lib src/types portainer docs scripts

# Move API, component, types, and library files
mv app.js src/app/api/
mv index.html src/app/
mv globals.css src/app/
mv layout.tsx src/app/
mv page.tsx src/app/
mv providers.tsx src/components/
mv style.css src/app/
mv next.config.js .
mv tailwind.config.js .
mv tsconfig.json .
mv postcss.config.js .
mv LICENSE .
mv README.md .
mv QUICKSTART.md .
mv DEPLOYMENT.md docs/
mv DEPLOYMENT_INSTRUCTIONS.md docs/
mv API.md docs/
mv bookseerr_package_summary.md docs/
mv bookseerr-complete-deployment.zip .
mv bookseerr.zip .
mv package.json .
mv .env.example .
mv .dockerignore .
mv Dockerfile .
mv Dockerfile.dev .
mv docker-compose.yml .
mv docker-compose.dev.yml .

# Move typescript and source files
mv utils.ts src/lib/
mv database.ts src/lib/
mv auth.ts src/lib/
mv components.ts src/types/
mv api.ts src/types/
mv script_*.py scripts/

# Move any other *.ts and config files to types/src as appropriate
# You can extend this with more mv commands if needed

echo "Bookseerr files reorganized into final structure."

