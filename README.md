# GeekUp_Concert_Ticket_Booking_Platform


A comprehensive, full-stack Concert Ticket Booking Platform featuring an interactive seat selection system, payment integration, and a powerful administrative dashboard.

## Key Features

### User Features (Customer Portal)
* **Discover Concerts:** Browse upcoming and currently showing concerts.
* **Interactive Seat Selection:** Concert-venue styled seating map grouped by categories (VIP, Balcony, Standard, Floor).
* **Checkout & Payments:** Secure checkout process integrated with **VNPay** for real-time ticket purchasing.
* **Vouchers & Discounts:** Apply discount codes (percentage or fixed amount) with usage limits.
* **Booking History:** View confirmed, pending, and cancelled bookings with digital ticket details.

### Admin Features (Management Dashboard)
* **Analytics Dashboard:** Real-time metrics on total revenue, tickets sold, and booking status breakdowns per concert.
* **Concert & Seat Management:** Create concerts and auto-generate physical seat maps based on predefined capacities.
* **Booking Moderation:** Manually confirm or cancel pending bookings.
* **Voucher Management:** Create promotional codes with usage limits, minimum order amounts, and expiration statuses.

## Technology Stack

### Frontend (React)
* **Framework:** React 18 with TypeScript
* **Routing & State:** React Router DOM
* **Styling:** Tailwind CSS + Material UI (MUI)
* **Animations & Charts:** Framer Motion (seat map micro-animations), Recharts (dashboard analytics)
* **QR Codes:** `qrcode.react` for digital ticket generation

### Backend (Spring Boot)
* **Framework:** Java 21, Spring Boot 3
* **Database:** MySQL 8.0 with Spring Data JPA
* **Security:** Spring Security with JWT Authentication & Role-Based Access Control (RBAC)
* **Object Mapping:** MapStruct & Lombok
* **Integrations:** Cloudinary (Image Hosting), VNPay (Payment Gateway)

## Running with Docker

The entire platform is containerized for seamless deployment.

### Prerequisites
* Docker & Docker Compose installed on your machine.

### Quick Start
1. Clone the repository and navigate to the project root:
   ```bash
   cd GeekUp_Concert_Ticket_Booking_Platform
   ```

2. Spin up the Database, Backend API, and Frontend using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

3. Access the applications:
   * **Frontend Application:** [http://localhost:3000](http://localhost:3000)
   * **Backend API Base URL:** `http://localhost:8080/api`
   * **MySQL Database:** Running on port `3307` locally.

### Stopping the platform
```bash
docker-compose down
```

## 📁 Project Structure

* `/concert-booking` - Spring Boot Backend API source code.
* `/concert-booking-frontend` - React Frontend application source code.
* `docker-compose.yml` - Orchestrates the MySQL, App (Backend), and Frontend containers.

## Contributors
Solisme developed this project for personal learning purpose for Backend Engineering.
