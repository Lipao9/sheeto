<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $recentWorksheets = $user->worksheets()
            ->latest()
            ->limit(5)
            ->get(['id', 'topic', 'discipline', 'created_at']);

        return Inertia::render('dashboard', [
            'worksheetCount' => $user->worksheets()->count(),
            'recentWorksheets' => $recentWorksheets,
        ]);
    }
}
