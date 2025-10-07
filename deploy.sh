#!/bin/bash

# LibraryMate Deployment Script
# This script will deploy your entire LibraryMate application

echo "🚀 Starting LibraryMate Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it with your environment variables."
    exit 1
fi

print_success "Environment file found."

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Build and start services
print_status "Building and starting services..."

# Build frontend
print_status "Building frontend..."
cd frontend
npm install
npm run build
cd ..

print_success "Frontend built successfully."

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p nginx/ssl

# Generate self-signed SSL certificates for development (replace with real certificates for production)
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_status "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_success "SSL certificates generated."
fi

# Start services with Docker Compose
print_status "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check database
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U librarymate_user -d librarymate > /dev/null 2>&1; then
    print_success "Database is healthy."
else
    print_warning "Database health check failed. It might still be starting up."
fi

# Check backend
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_success "Backend is healthy."
else
    print_warning "Backend health check failed. It might still be starting up."
fi

# Check nginx
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_success "Nginx is healthy."
else
    print_warning "Nginx health check failed. It might still be starting up."
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data (optional)
read -p "Do you want to seed initial admin data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding initial data..."
    docker-compose -f docker-compose.prod.yml exec backend npm run seed
    print_success "Initial data seeded."
fi

print_success "🎉 LibraryMate deployment completed!"
echo ""
echo "📋 Access Information:"
echo "  Frontend: http://localhost (or your domain)"
echo "  Backend API: http://localhost:4000"
echo "  Database: localhost:5432"
echo ""
echo "📝 Next Steps:"
echo "  1. Update your domain in nginx.conf and .env.production"
echo "  2. Replace self-signed SSL certificates with real ones for production"
echo "  3. Configure your email settings in .env.production"
echo "  4. Set up proper firewall rules"
echo ""
echo "🔧 Useful Commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo ""