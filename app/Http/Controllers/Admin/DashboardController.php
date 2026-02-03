<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Worksheet;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = Carbon::now();

        $usersTotal = User::query()->count();
        $usersVerified = User::query()->whereNotNull('email_verified_at')->count();
        $usersAdmins = User::query()->where('is_admin', true)->count();
        $usersLast30Days = User::query()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->count();

        $worksheetsTotal = Worksheet::query()->count();
        $worksheetsLast7Days = Worksheet::query()
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->count();
        $worksheetsLast30Days = Worksheet::query()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->count();
        $worksheetsWithContent = Worksheet::query()
            ->whereNotNull('content')
            ->count();
        $worksheetsAverageQuestions = (float) (Worksheet::query()->avg('question_count') ?? 0);
        $worksheetsAveragePerUser = $usersTotal > 0
            ? round($worksheetsTotal / $usersTotal, 2)
            : 0;

        $latestWorksheet = Worksheet::query()
            ->with('user:id,name,email')
            ->latest()
            ->first();

        $topUsers = User::query()
            ->withCount('worksheets')
            ->orderByDesc('worksheets_count')
            ->limit(5)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'worksheets_count' => $user->worksheets_count,
            ]);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'users_total' => $usersTotal,
                'users_verified' => $usersVerified,
                'users_admins' => $usersAdmins,
                'users_last_30_days' => $usersLast30Days,
                'worksheets_total' => $worksheetsTotal,
                'worksheets_last_7_days' => $worksheetsLast7Days,
                'worksheets_last_30_days' => $worksheetsLast30Days,
                'worksheets_with_content' => $worksheetsWithContent,
                'worksheets_average_questions' => $worksheetsAverageQuestions,
                'worksheets_average_per_user' => $worksheetsAveragePerUser,
            ],
            'latestWorksheet' => $latestWorksheet ? [
                'id' => $latestWorksheet->id,
                'topic' => $latestWorksheet->topic,
                'discipline' => $latestWorksheet->discipline,
                'created_at' => $latestWorksheet->created_at->toIso8601String(),
                'user' => [
                    'name' => $latestWorksheet->user?->name,
                    'email' => $latestWorksheet->user?->email,
                ],
            ] : null,
            'topUsers' => $topUsers,
        ]);
    }
}
