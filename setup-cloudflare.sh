#!/bin/bash

echo "Setting up Cloudflare deployment for Fire Protection Tracker..."
echo ""

# Set Cloudflare API Token
export CLOUDFLARE_API_TOKEN="mpS6C4ckWX6xoQVRD7RiZBHsifGKKjMwQbTgzbzg"

echo "Step 1: Setting Cloudflare authentication..."
wrangler login

echo ""
echo "Step 2: Building the project..."
npm run build

echo ""
echo "Step 3: Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=fire-protection-tracker --compatibility-date=2024-01-01

echo ""
echo "Deployment complete!"
echo "Your site will be live at: https://fire-protection-tracker.pages.dev"







