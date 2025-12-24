<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users are redirected to the worksheets page', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertRedirect(route('worksheets.index'));
});
