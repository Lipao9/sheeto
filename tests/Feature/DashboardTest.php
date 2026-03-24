<?php

use App\Models\Summary;
use App\Models\User;
use App\Models\Worksheet;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can access the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertSuccessful();
});

test('dashboard shows recent activity from worksheets and summaries', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    Worksheet::factory()->for($user)->create(['topic' => 'Derivadas']);
    Summary::factory()->for($user)->create(['title' => 'Resumo de Algebra']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('worksheetCount', 1)
            ->where('summaryCount', 1)
            ->has('recentActivity', 2)
        );
});

test('dashboard has empty recent activity for new users', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('worksheetCount', 0)
            ->where('summaryCount', 0)
            ->has('recentActivity', 0)
        );
});
