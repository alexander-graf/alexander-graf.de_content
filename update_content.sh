#!/bin/bash
# Move to project directory
cd /home/admin/gemini/projekte/alexandergraf.de || exit 1

# Fetch changes
git fetch origin main

# Check if local branch is behind remote branch
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): New content updates found on GitHub. Updating..."
    
    # Temporarily stash local modifications if any
    git stash
    
    # Pull the remote changes
    git pull origin main
    
    # Apply local modifications back
    git stash pop
    
    # Rebuild and recreate the Astro container to apply changes
    echo "$(date): Rebuilding Astro Docker container..."
    docker compose up -d --build astro
    
    echo "$(date): Update completed."
else
    # Output to log only when there are changes or errors, 
    # to avoid filling up the logs with "Up-to-date" messages.
    :
fi
