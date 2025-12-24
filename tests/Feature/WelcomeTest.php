<?php

use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('home page can be rendered', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('canRegister', Features::enabled(Features::registration()))
        );
});
