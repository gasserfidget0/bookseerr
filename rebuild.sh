#!/bin/bash

# A script to rebuild the Bookseerr container and re-authenticate.

# --- Step 1: Rebuild and restart the container ---
echo "Rebuilding and restarting the Bookseerr container..."
docker compose up --build -d

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed. Aborting."
  exit 1
fi

# --- Step 2: Wait for the application to be ready ---
echo "Waiting for the application to start..."
sleep 5 # Wait 5 seconds for the server to initialize

# --- Step 3: Re-authenticate to get a new cookie ---
echo "Re-authenticating and creating a new cookies.txt..."
curl -s -c cookies.txt -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  http://localhost:5057/api/auth/login

# --- Step 4: Check if authentication was successful ---
if grep -q "token" cookies.txt; then
  echo "Authentication successful. A new cookies.txt has been created."
else
  echo "Authentication failed. The application may not be ready or the login is incorrect."
fi

echo "Rebuild and re-authentication complete."
