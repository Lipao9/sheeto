<?php

it('returns a successful response', function () {
    $response = $this->withHeader('X-Forwarded-Proto', 'https')
        ->get('/');

    $response->assertSuccessful();

    expect($response->getContent())
        ->toMatch('/https:\\/\\/[^"\\\']+\\/build\\/assets\\/|http:\\/\\/(\\[::1\\]|localhost):5173\\/.*@vite\\/client/');
});
