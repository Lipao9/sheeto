<?php

use App\Jobs\ProcessSummary;
use App\Models\Summary;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access summaries', function () {
    $this->get(route('summaries.index'))->assertRedirect(route('login'));
});

test('guests cannot access summary creation page', function () {
    $this->get(route('summaries.create'))->assertRedirect(route('login'));
});

test('user can view the summaries index with empty list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('summaries.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/index')
            ->has('summaries.data', 0)
        );
});

test('user can view the summaries index with paginated list', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('summaries.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/index')
            ->has('summaries.data', 1)
            ->where('summaries.data.0.id', $summary->id)
            ->where('summaries.data.0.title', $summary->title)
        );
});

test('user can view a specific summary', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('summaries.show', $summary))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/show')
            ->where('summary.id', $summary->id)
            ->where('summary.title', $summary->title)
        );
});

test('user cannot view summaries from other users', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->create();

    $this->actingAs($user)
        ->get(route('summaries.show', $summary))
        ->assertNotFound();
});

test('user can view the create summary page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('summaries.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/create')
        );
});

test('user can create a summary with a text file', function () {
    Bus::fake();

    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('estudo.txt', str_repeat('Conteudo de estudo sobre algebra linear. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    $summary = Summary::query()->where('user_id', $user->id)->first();

    expect($summary)->not()->toBeNull()
        ->and($summary->status)->toBe(Summary::STATUS_PROCESSING)
        ->and($summary->source_file_name)->toBe('estudo.txt');

    $response->assertRedirect(
        route('summaries.show', ['summary' => $summary->id])
    );

    Bus::assertDispatched(ProcessSummary::class);
});

test('user can delete a summary', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(
        route('summaries.destroy', $summary)
    );

    $response->assertRedirect(route('summaries.index'));

    $this->assertDatabaseMissing('summaries', [
        'id' => $summary->id,
    ]);
});

test('user cannot delete summaries from other users', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->create();

    $response = $this->actingAs($user)->delete(
        route('summaries.destroy', $summary)
    );

    $response->assertNotFound();
});

test('index only shows summaries from the authenticated user', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();
    Summary::factory()->create(); // Belongs to another user

    $response = $this->actingAs($user)->get(route('summaries.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('summaries/index')
        ->has('summaries.data', 1)
        ->where('summaries.data.0.id', $summary->id)
    );
});
