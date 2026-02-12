<?php

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('google redirect endpoint redirects to provider', function () {
    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('redirect')
        ->once()
        ->andReturn(new RedirectResponse('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);

    $this->get(route('auth.google.redirect'))
        ->assertRedirect('https://accounts.google.com/o/oauth2/auth');
});

test('users are created and authenticated on first google login', function () {
    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('user')
        ->once()
        ->andReturn(makeGoogleUser(
            id: 'google-user-1',
            email: 'google-first@example.com',
            name: 'Google First',
            avatar: 'https://example.com/avatar-1.png',
        ));

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('worksheets.index'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'google-first@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user?->google_id)->toBe('google-user-1');
    expect($user?->avatar)->toBe('https://example.com/avatar-1.png');
    expect($user?->email_verified_at)->not->toBeNull();
});

test('existing users are linked by email and authenticated via google', function () {
    $existingUser = User::factory()
        ->withoutTwoFactor()
        ->unverified()
        ->create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'google_id' => null,
            'avatar' => null,
        ]);

    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('user')
        ->once()
        ->andReturn(makeGoogleUser(
            id: 'google-user-2',
            email: 'existing@example.com',
            name: 'Existing User',
            avatar: 'https://example.com/avatar-2.png',
        ));

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('worksheets.index'));
    $this->assertAuthenticatedAs($existingUser);

    $existingUser->refresh();

    expect($existingUser->google_id)->toBe('google-user-2');
    expect($existingUser->avatar)->toBe('https://example.com/avatar-2.png');
    expect($existingUser->email_verified_at)->not->toBeNull();
    expect(User::query()->where('email', 'existing@example.com')->count())->toBe(1);
});

test('users already linked by google id can login again', function () {
    $existingUser = User::factory()
        ->withoutTwoFactor()
        ->create([
            'name' => 'Linked User',
            'email' => 'linked@example.com',
            'google_id' => 'google-user-3',
            'avatar' => null,
        ]);

    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('user')
        ->once()
        ->andReturn(makeGoogleUser(
            id: 'google-user-3',
            email: 'linked@example.com',
            name: 'Linked User',
            avatar: 'https://example.com/avatar-3.png',
        ));

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('worksheets.index'));
    $this->assertAuthenticatedAs($existingUser);

    $existingUser->refresh();

    expect($existingUser->avatar)->toBe('https://example.com/avatar-3.png');
});

test('callback without email redirects back to login with oauth error', function () {
    $provider = \Mockery::mock(Provider::class);
    $provider->shouldReceive('user')
        ->once()
        ->andReturn(makeGoogleUser(
            id: 'google-user-4',
            email: null,
            name: 'No Email User',
            avatar: 'https://example.com/avatar-4.png',
        ));

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('oauth_error');
    $this->assertGuest();
});

function makeGoogleUser(string $id, ?string $email, string $name, ?string $avatar): SocialiteUser
{
    $user = new SocialiteUser;

    $user->id = $id;
    $user->email = $email;
    $user->name = $name;
    $user->avatar = $avatar;

    return $user;
}
