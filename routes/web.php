<?php

use App\Http\Controllers\WorksheetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => to_route('worksheets.index'))
        ->name('dashboard');

    Route::get('fichas', [WorksheetController::class, 'index'])
        ->name('worksheets.index');

    Route::get('fichas/criar', [WorksheetController::class, 'create'])
        ->name('worksheets.create');

    Route::post('fichas', [WorksheetController::class, 'store'])
        ->name('worksheets.store');

    Route::delete('fichas/{worksheet}', [WorksheetController::class, 'destroy'])
        ->name('worksheets.destroy');
});

require __DIR__.'/settings.php';
