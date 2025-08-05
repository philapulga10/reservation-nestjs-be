# Reservation Backend - NestJS

This is a NestJS version of the reservation backend system, converted from Express.js.

## Features

- User authentication and authorization
- Hotel management
- Booking system
- Admin panel with audit logs
- Reward points system
- Rate limiting
- Input validation

## Installation

```bash
npm install
```

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL for CORS

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/me` - Get current user info

### Hotels
- `GET /hotels` - Get all hotels with filters
- `GET /hotels/:id` - Get hotel by ID

### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings` - Get user bookings
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Admin
- `GET /bookings/admin/all` - Get all bookings (admin)
- `GET /bookings/admin/:id` - Get booking detail (admin)
- `PUT /bookings/admin/:id/toggle` - Toggle booking status (admin)
- `GET /bookings/admin/stats` - Get booking statistics (admin)
- `GET /admin/logs` - Get admin logs

### Audit
- `GET /audits` - Get audit logs

### Rewards
- `POST /ireward/earn` - Earn points
- `GET /ireward/history` - Get point history

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # Users module
├── hotels/              # Hotels module
├── bookings/            # Bookings module
├── admin/               # Admin module
├── audit/               # Audit logs module
├── rewards/             # Rewards module
├── config/              # Configuration
├── guards/              # Guards
└── main.ts              # Application entry point
```

## Technologies Used

- NestJS
- MongoDB with Mongoose
- JWT for authentication
- Passport.js
- Rate limiting with @nestjs/throttler 