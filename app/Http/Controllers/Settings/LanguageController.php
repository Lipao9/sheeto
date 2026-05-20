<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/language');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:pt_BR,en'],
        ]);

        if ($request->user()) {
            $request->user()->update($validated);
        }

        return back()->withCookie(cookie()->forever('locale', $validated['locale']));
    }
}
