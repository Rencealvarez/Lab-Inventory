<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacilitiesController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/inventory', [InventoryController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('inventory');
Route::post('/inventory', [InventoryController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('inventory.store');
Route::put('/inventory/{item}', [InventoryController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('inventory.update');
Route::delete('/inventory/{item}', [InventoryController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('inventory.destroy');

Route::get('/transactions', [TransactionController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('transactions');
Route::post('/transactions', [TransactionController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('transactions.store');
Route::patch('/transactions/{transaction}/return', [TransactionController::class, 'returnItem'])
    ->middleware(['auth', 'verified'])
    ->name('transactions.return');

Route::get('/facilities', [FacilitiesController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('facilities');

Route::get('/reports', function () {
    return Inertia::render('Reports');
})->middleware(['auth', 'verified'])->name('reports');

Route::get('/reports/pdf/inventory', [ReportController::class, 'inventoryReport'])
    ->middleware(['auth', 'verified'])
    ->name('reports.inventory');
Route::get('/reports/pdf/transactions', [ReportController::class, 'transactionReport'])
    ->middleware(['auth', 'verified'])
    ->name('reports.transactions');
Route::get('/reports/pdf/maintenance', [ReportController::class, 'maintenanceReport'])
    ->middleware(['auth', 'verified'])
    ->name('reports.maintenance');

Route::get('/maintenance', [MaintenanceController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('maintenance');
Route::post('/maintenance', [MaintenanceController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('maintenance.store');
Route::patch('/maintenance/{incident}/resolve', [MaintenanceController::class, 'resolve'])
    ->middleware(['auth', 'verified'])
    ->name('maintenance.resolve');

Route::get('/users', [UserController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('users');
Route::post('/users', [UserController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('users.store');
Route::put('/users/{user}', [UserController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('users.update');
Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('users.destroy');

Route::middleware('auth', 'verified')->group(function () {
    Route::get('/profile/show', function () {
        return Inertia::render('Profile/Show');
    })->name('profile.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
