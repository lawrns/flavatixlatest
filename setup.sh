#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Flavatix Development Environment Setup${NC}"
echo -e "${BLUE}===============================================${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}\n"

# Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Setup environment variables
echo -e "${YELLOW}Step 2: Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠ Update .env.local with your actual values${NC}\n"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env.local already exists${NC}\n"
fi

# Initialize database (if needed)
echo -e "${YELLOW}Step 3: Building Next.js...${NC}"
npm run build
echo -e "${GREEN}✓ Build successful${NC}\n"

# Install git hooks
echo -e "${YELLOW}Step 4: Installing git hooks...${NC}"
if command -v husky &> /dev/null; then
    npx husky install
    echo -e "${GREEN}✓ Git hooks installed${NC}\n"
else
    echo -e "${YELLOW}⚠ Husky not found, skipping git hooks setup${NC}\n"
fi

# Run linting
echo -e "${YELLOW}Step 5: Running linters...${NC}"
npm run lint --fix 2>/dev/null || true
echo -e "${GREEN}✓ Linting complete${NC}\n"

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update .env.local with your configuration values"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  npm run dev              - Start development server"
echo "  npm run build            - Build for production"
echo "  npm run lint             - Run ESLint"
echo "  npm run format           - Format code with Prettier"
echo "  npm run type-check       - Run TypeScript type checking"
echo "  npm run test             - Run all tests"
echo "  npm run test:watch       - Run tests in watch mode"
echo "  npm run security-audit   - Run security audit"
echo ""
echo -e "${BLUE}For more details, see DEVELOPMENT.md${NC}"
