#!/bin/bash

echo "Starting Skin Analysis FastAPI Backend..."
echo "Installing dependencies..."

# Install Python dependencies
pip install -r requirements.txt

echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation will be available at http://localhost:8000/docs"

# Start the server
python run.py
