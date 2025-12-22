#!/bin/bash

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
