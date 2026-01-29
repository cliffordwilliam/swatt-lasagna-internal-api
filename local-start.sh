#!/bin/bash

if [ ! -f .env ]; then
    echo ".env file not found, copying .env.example to .env"
    cp .env.example .env
fi

cleanup() {
    echo -e "\nCaught signal! Cleaning up..."
    docker compose down -v
    echo "Cleaned."
    exit 0
}

trap cleanup SIGINT SIGTERM

docker compose up --build -d

echo "Containers are running. Press Ctrl+C to stop..."
docker compose logs -f
