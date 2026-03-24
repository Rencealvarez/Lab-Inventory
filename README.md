Lab-Inventory
Laboratory Management System for School

A web-based application designed to streamline the tracking and management of laboratory equipment and supplies. This system helps lab administrators monitor stock levels, manage item distributions, and maintain an organized digital record of school assets.

🚀 Key Features
Inventory Dashboard: Real-time overview of available laboratory equipment.

Item Management: Add, update, and categorize lab tools and chemicals.

Search & Filter: Quickly find specific items by name or category.

User Authentication: Secure access for administrators and laboratory staff.

🛠️ Tech Stack
Framework: Laravel 11

Frontend: Tailwind CSS / Vite

Database: MySQL

Language: PHP, JavaScript

Installation & Setup
To run this project locally, follow these steps:

1. Clone the repository:
git clone https://github.com/Rencealvarez/Lab-Inventory.git

2. Install dependencies:
composer install
npm install && npm run build

3. Configure Environment:
Copy .env.example to .env.
Update your database credentials in the .env file.

4. Generate App Key & Migrate:
php artisan key:generate
php artisan migrate

5. Start the Server:
php artisan serve
