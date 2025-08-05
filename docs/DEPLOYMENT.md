# Hướng Dẫn Triển Khai

## Tổng Quan
Hướng dẫn triển khai hệ thống reservation backend sử dụng NestJS, Prisma ORM và PostgreSQL database.

## Prerequisites

### 1. Node.js & npm
```bash
# Kiểm tra version
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### 2. PostgreSQL Database
```bash
# Cài đặt PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql postgresql-contrib  # Ubuntu

# Khởi động service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu
```

### 3. Environment Setup
```bash
# Tạo database và user
psql postgres
CREATE USER deployment_user WITH PASSWORD 'secure_password';
CREATE DATABASE reservation_prod;
GRANT ALL PRIVILEGES ON DATABASE reservation_prod TO deployment_user;
\c reservation_prod
GRANT ALL ON SCHEMA public TO deployment_user;
\q
```

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd reservation-nestjs-be
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp env.example .env

# Edit .env file
DATABASE_URL="postgresql://deployment_user:secure_password@localhost:5432/reservation_prod?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Run Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Production Deployment

### 1. Environment Variables
```env
# Production environment
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/reservation_prod?schema=public"
JWT_SECRET=your_production_jwt_secret_here
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Database Migration
```bash
# Create production migration
npx prisma migrate deploy

# Or push schema directly
npx prisma db push
```

### 3. Build Application
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build
```

### 4. Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start dist/main.js --name "reservation-api"

# Using Docker
docker build -t reservation-api .
docker run -p 5000:5000 reservation-api
```

## Docker Deployment

### 1. Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "run", "start:prod"]
```

### 2. Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/reservation_db
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=reservation_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Build and Run
```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Cloud Deployment

### 1. Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### 2. AWS EC2
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contr 