#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."
npm run build
node tools/generate-openapi.js
