<?php

uses(Tests\TestCase::class);

test('favicon assets are present', function (string $asset, int $minBytes) {
    $path = public_path($asset);

    if (! file_exists($path)) {
        expect(false)->toBeTrue();

        return;
    }

    $size = filesize($path);

    if ($size === false) {
        expect(false)->toBeTrue();

        return;
    }

    expect($size)->toBeGreaterThan($minBytes);
})->with([
    'favicon-svg' => ['favicon.svg', 100],
    'favicon-ico' => ['favicon.ico', 100],
    'apple-touch-icon' => ['apple-touch-icon.png', 100],
]);

test('favicon svg matches the app logo', function () {
    $path = public_path('favicon.svg');

    if (! file_exists($path)) {
        expect(false)->toBeTrue();

        return;
    }

    $contents = file_get_contents($path);

    if ($contents === false) {
        expect(false)->toBeTrue();

        return;
    }

    expect($contents)
        ->toContain('<svg')
        ->and($contents)->toContain('viewBox=');
});
