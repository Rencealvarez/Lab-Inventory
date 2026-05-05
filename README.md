# LAB INVENTORY

Laboratory Management System for school laboratories.

This web-based system is designed to manage laboratory equipment, supplies, and related transactions.  
It helps administrators and staff keep records organized, monitor inventory status, and manage laboratory operations more efficiently.


## Project Structure

### Actual Laravel Project Structure

- Backend application code: `app/`
- Frontend code (React/Inertia): `resources/js/`
- Blade templates/reports: `resources/views/`
- Routes: `routes/`
- Config files: `config/`
- Database files: `database/` (migrations, seeders, factories)
- Public assets: `public/`
- Uploaded files: `storage/app/public/` (via `php artisan storage:link`)


## Project Objective

To build a centralized laboratory inventory and management platform that supports:

- Item listing and stock monitoring
- Borrow/return transaction management
- Facility and department management
- Reporting and operational visibility
- Role-based access for secure usage

## Key Features

- Inventory dashboard for quick lab stock overview
- Item management (create, update, categorize, track availability)
- Search and filtering for faster lookup
- Facility and department administration modules
- User authentication and account management
- Report generation for inventory and transactions

## Technology Stack

- Backend: `Laravel 11` (PHP)
- Frontend: `React` via Inertia + `Vite`
- Styling: `Tailwind CSS`
- Database: `MySQL`
- Language(s): `PHP`, `JavaScript`

## System Requirements

Before installation, make sure you have:

- PHP 8.2+ (recommended for Laravel 11)
- Composer
- Node.js 18+ and npm
- MySQL / MariaDB
- Git

## Installation and Setup

### 1) Clone the repository

```bash
git clone https://github.com/Rencealvarez/Lab-Inventory.git
cd Lab-Inventory
```

### 2) Install backend dependencies

```bash
composer install
```

### 3) Install frontend dependencies

```bash
npm install
```

### 4) Configure environment

```bash
copy .env.example .env
```

Then edit `.env` and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lab_inventory
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5) Generate application key

```bash
php artisan key:generate
```

### 6) Run database migrations

```bash
php artisan migrate
```

### 7) Build frontend assets

```bash
npm run build
```

For development mode, you may use:

```bash
npm run dev
```

### 8) Run the application

```bash
php artisan serve
```

Open: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Detailed Installation Guide (Windows)

If you are setting up this project on Windows for the first time:

### A) Install required software

- Install PHP 8.2+ and make sure `php` works in PowerShell
- Install [Composer](https://getcomposer.org/)
- Install [Node.js LTS](https://nodejs.org/) (includes npm)
- Install MySQL Server (or use XAMPP/WAMP with MySQL)
- Install [Git](https://git-scm.com/)

Verify installations:

```bash
php -v
composer -V
node -v
npm -v
git --version
```

### B) Create database

Create a new database in MySQL (example name: `lab_inventory`).

Then make sure your `.env` values match your local database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lab_inventory
DB_USERNAME=root
DB_PASSWORD=
```

### C) Complete app setup

Run these commands inside the project folder:

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
```

### D) Start development servers

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Visit: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Daily Development Commands

Use these commands during active development:

- Start frontend dev server:

```bash
npm run dev
```

- Start backend server:

```bash
php artisan serve
```

- Create storage symlink for uploaded files (example: incident report images):

```bash
php artisan storage:link
```

## Migration and Database Commands

Run these when working on database changes:

- Create a new migration file:

```bash
php artisan make:migration create_example_table
```

- Run migrations after creating/editing migrations:

```bash
php artisan migrate
```

- Force migrations in non-interactive/production environments:

```bash
php artisan migrate --force
```

## Notifications Setup

If notification tables are not yet created:

```bash
php artisan notifications:table
php artisan migrate
```

> `php artisan notifications:table` only generates the migration file.  
> You still need `php artisan migrate` to apply it.

## Chatbox Dependency (Supabase)

Install Supabase client package for chatbox integration:

```bash
npm install @supabase/supabase-js
```

## Ziggy Route Helper

Generate frontend route definitions when routes are updated:

```bash
php artisan ziggy:generate
```

If there are stale generated routes, regenerate `resources/js/ziggy.js`.

## Quick Troubleshooting

- If `composer install` fails, update Composer and check PHP version.
- If `php artisan migrate` fails, verify DB credentials and that MySQL is running.
- If frontend styles/scripts are missing, run `npm run dev` or `npm run build`.
- If app key error appears, run `php artisan key:generate` again.
- If config/cache issues happen after `.env` edits, run:

```bash
php artisan config:clear
php artisan cache:clear
```

## Suggested Development Workflow

Run these in separate terminals during development:

- `php artisan serve`
- `npm run dev`

Optional checks:

- `php artisan test`

## Documentation Notes


- Setup progress and environment changes
- Database changes and migration notes
- Feature implementation notes
- Testing and deployment observations

## Author

- Rence Alvarez
