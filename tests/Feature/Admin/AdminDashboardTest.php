<?php

use App\Models\User;
use App\Models\Worksheet;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('guests are redirected to login', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('non admin users cannot access the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin users can access the dashboard', function () {
    $admin = User::factory()->admin()->create();
    Worksheet::factory()->count(2)->for($admin)->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('metrics.users_total')
            ->has('metrics.worksheets_total')
            ->has('topUsers')
            ->has('latestWorksheet')
        );
});
