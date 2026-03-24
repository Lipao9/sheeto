<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;

test('source document is required', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('summaries.store'), []);

    $response->assertSessionHasErrors(['source_document']);
});

test('source document must be pdf, docx, or txt', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('spreadsheet.xlsx', 100);

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('source document cannot exceed 10mb', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf');

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('page range end must be greater than or equal to start', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('test.txt', str_repeat('Content. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
        'page_range_start' => 10,
        'page_range_end' => 5,
    ]);

    $response->assertSessionHasErrors(['page_range_end']);
});

test('page range cannot exceed 30 pages', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('test.txt', str_repeat('Content. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
        'page_range_start' => 1,
        'page_range_end' => 35,
    ]);

    $response->assertSessionHasErrors(['page_range_end']);
});

test('title is optional and limited to 255 characters', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('test.txt', str_repeat('Content. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
        'title' => str_repeat('a', 256),
    ]);

    $response->assertSessionHasErrors(['title']);
});

test('notes are optional and limited to 1000 characters', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('test.txt', str_repeat('Content. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
        'notes' => str_repeat('a', 1001),
    ]);

    $response->assertSessionHasErrors(['notes']);
});
