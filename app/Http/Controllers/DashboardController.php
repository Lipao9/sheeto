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
            ->get(['id', 'topic', 'discipline', 'created_at'])
            ->map(fn ($ws) => [
                'id' => $ws->id,
                'type' => 'worksheet',
                'title' => $ws->topic,
                'discipline' => $ws->discipline,
                'created_at' => $ws->created_at->toIso8601String(),
            ]);

        $recentSummaries = $user->summaries()
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'discipline', 'created_at'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'type' => 'summary',
                'title' => $s->title,
                'discipline' => $s->discipline,
                'created_at' => $s->created_at->toIso8601String(),
            ]);

        $recentActivity = $recentWorksheets
            ->merge($recentSummaries)
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        return Inertia::render('dashboard', [
            'worksheetCount' => $user->worksheets()->count(),
            'summaryCount' => $user->summaries()->count(),
            'recentActivity' => $recentActivity,
        ]);
    }
}
