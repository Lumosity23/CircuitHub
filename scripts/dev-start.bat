@echo off
REM CircuitHub Development Startup Script for Windows

echo 🚀 Starting CircuitHub Development Environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.development .env
    echo ✅ .env file created. Please review and update if needed.
)

REM Start services
echo 🐳 Starting Docker containers...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for PostgreSQL to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
:wait_loop
docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U circuithub_dev_user -d circuithub_dev >nul 2>&1
if errorlevel 1 (
    echo Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto wait_loop
)

echo ✅ PostgreSQL is ready!

REM Run database migrations
echo 🔄 Running database migrations...
docker-compose -f docker-compose.dev.yml exec -T app npx prisma db push

REM Generate Prisma client
echo 🔧 Generating Prisma client...
docker-compose -f docker-compose.dev.yml exec -T app npx prisma generate

REM Seed database (optional)
echo 🌱 Seeding database...
docker-compose -f docker-compose.dev.yml exec -T app npx tsx packages/db/src/seed.ts

echo 🎉 CircuitHub is ready!
echo 📱 Frontend: http://localhost:3000
echo 🗄️  Database: localhost:5432
echo 📊 Redis: localhost:6379
echo.
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
echo To stop: docker-compose -f docker-compose.dev.yml down
pause