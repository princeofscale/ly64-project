#!/bin/bash

# Lyceum 64 - Universal Start Script
# Запускает backend и frontend одновременно

echo "🚀 Starting Lyceum 64 Platform..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(pwd)"

if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "${YELLOW}⚠️  Root dependencies not found. Installing...${NC}"
    cd "$ROOT_DIR"
    npm install
fi

if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
    echo "${YELLOW}⚠️  Backend dependencies not found. Installing...${NC}"
    cd "$ROOT_DIR/backend"
    npm install
    cd "$ROOT_DIR"
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
    echo "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    cd "$ROOT_DIR/frontend"
    npm install
    cd "$ROOT_DIR"
fi

if [ ! -f "$ROOT_DIR/backend/prisma/dev.db" ]; then
    echo "${YELLOW}⚠️  Database not found. Running migrations and seed...${NC}"
    cd "$ROOT_DIR/backend"
    npx prisma migrate deploy
    npx prisma db seed
    cd "$ROOT_DIR"
fi

echo ""
echo "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "${BLUE}📦 Starting Backend (http://localhost:3001)...${NC}"
echo "${BLUE}🎨 Starting Frontend (http://localhost:5173)...${NC}"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

trap 'kill $(jobs -p); echo "\n\n🛑 Shutting down..."; exit' INT TERM

mkdir -p "$ROOT_DIR/logs"

cd "$ROOT_DIR/backend" && npm run dev > "$ROOT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!

sleep 2

cd "$ROOT_DIR/frontend" && npm run dev > "$ROOT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!

cd "$ROOT_DIR"

echo "${GREEN}✅ Backend started${NC} (PID: $BACKEND_PID)"
echo "${GREEN}✅ Frontend started${NC} (PID: $FRONTEND_PID)"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""

wait
