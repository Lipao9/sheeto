<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return to_route('login')->with('oauth_error', 'Nao foi possivel autenticar com Google.');
        }

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();

        if (! is_string($email) || $email === '' || ! is_string($googleId) || $googleId === '') {
            return to_route('login')->with('oauth_error', 'Nao foi possivel obter os dados da conta Google.');
        }

        $user = User::query()->where('google_id', $googleId)->first();

        if (! $user instanceof User) {
            $user = User::query()->where('email', $email)->first();
        }

        if ($user instanceof User) {
            $attributes = [
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar(),
            ];

            if (! $user->hasVerifiedEmail()) {
                $attributes['email_verified_at'] = now();
            }

            $user->forceFill($attributes)->save();
        } else {
            $name = $googleUser->getName();

            $user = User::query()->forceCreate([
                'name' => is_string($name) && $name !== '' ? $name : Str::before($email, '@'),
                'email' => $email,
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar(),
                'password' => Str::password(32),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended(route('worksheets.index'));
    }
}
