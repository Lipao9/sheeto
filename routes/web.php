<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WorksheetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('sitemap.xml', function () {
    $urls = [
        [
            'loc' => url('/'),
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ],
        [
            'loc' => url('/login'),
            'changefreq' => 'monthly',
            'priority' => '0.5',
        ],
        [
            'loc' => url('/register'),
            'changefreq' => 'monthly',
            'priority' => '0.5',
        ],
    ];

    $content = '<?xml version="1.0" encoding="UTF-8"?>';
    $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    foreach ($urls as $url) {
        $content .= '<url>';
        $content .= '<loc>'.htmlspecialchars($url['loc']).'</loc>';
        $content .= '<changefreq>'.$url['changefreq'].'</changefreq>';
        $content .= '<priority>'.$url['priority'].'</priority>';
        $content .= '</url>';
    }

    $content .= '</urlset>';

    return response($content, 200, ['Content-Type' => 'application/xml']);
})->name('sitemap');

Route::middleware('guest')->group(function () {
    Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])
        ->name('auth.google.redirect');

    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])
        ->name('auth.google.callback');
});

Route::get('fichas/compartilhada/{worksheet}', [WorksheetController::class, 'shared'])
    ->middleware('signed')
    ->name('worksheets.shared.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)
        ->name('dashboard');

    Route::get('fichas', [WorksheetController::class, 'index'])
        ->name('worksheets.index');

    Route::get('fichas/criar', [WorksheetController::class, 'create'])
        ->name('worksheets.create');

    Route::post('fichas', [WorksheetController::class, 'store'])
        ->name('worksheets.store');

    Route::post('fichas/{worksheet}/compartilhar', [WorksheetController::class, 'trackShareClick'])
        ->name('worksheets.share.click');

    Route::delete('fichas/{worksheet}', [WorksheetController::class, 'destroy'])
        ->name('worksheets.destroy');
});

Route::middleware(['auth', 'verified', 'can:isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', AdminDashboardController::class)
            ->name('dashboard');
    });

require __DIR__.'/settings.php';
