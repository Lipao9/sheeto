<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;

test('guests cannot detect page count', function () {
    $this->postJson(route('summaries.detect-pages'))
        ->assertUnauthorized();
});

test('detect page count requires a pdf file', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('summaries.detect-pages'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['source_document']);
});

test('detect page count rejects non-pdf files', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('test.txt', 'Some text content');

    $response = $this->actingAs($user)->postJson(route('summaries.detect-pages'), [
        'source_document' => $file,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['source_document']);
});

test('detect page count returns page count for a pdf', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $response = $this->actingAs($user)->postJson(route('summaries.detect-pages'), [
        'source_document' => $file,
    ]);

    $response->assertOk()
        ->assertJsonStructure(['page_count']);
});
