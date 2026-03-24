<?php

use App\Models\Summary;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access summaries', function () {
    $this->get(route('summaries.index'))->assertRedirect(route('login'));
});

test('guests cannot access summary creation page', function () {
    $this->get(route('summaries.create'))->assertRedirect(route('login'));
});

test('user can view the summaries index without a selected summary', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('summaries.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/index')
            ->where('summary', null)
        );
});

test('user can view the summaries index with a selected summary', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('summaries.index', ['summary' => $summary->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summaries/index')
            ->where('summary.id', $summary->id)
            ->where('summary.title', $summary->title)
        );
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
    $user = User::factory()->create();

    Http::fake([
        '*/chat/completions' => Http::sequence([
            Http::response([
                'choices' => [
                    ['message' => ['content' => "STATUS: ok\nDISCIPLINE: Matematica\nTOPIC: Algebra"]],
                ],
            ]),
            Http::response([
                'choices' => [
                    ['message' => ['content' => "Titulo do Resumo: Resumo de Algebra\n\nVisao Geral:\nConteudo do resumo gerado."]],
                ],
            ]),
        ]),
    ]);

    $file = UploadedFile::fake()->createWithContent('estudo.txt', str_repeat('Conteudo de estudo sobre algebra linear. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    $summary = Summary::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(
        route('summaries.index', ['summary' => $summary?->id])
    );

    expect($summary)->not()->toBeNull()
        ->and($summary?->content)->not->toBeEmpty()
        ->and($summary?->discipline)->toBe('Matematica')
        ->and($summary?->topic)->toBe('Algebra')
        ->and($summary?->source_file_name)->toBe('estudo.txt');
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

test('history only shows summaries from the authenticated user', function () {
    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create();
    Summary::factory()->create(); // Belongs to another user

    $response = $this->actingAs($user)->get(route('summaries.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('summaries/index')
        ->where('summary.id', $summary->id)
        ->has('summaryHistory', 1)
        ->where('summaryHistory.0.id', $summary->id)
    );
});

test('summary history is shared via inertia', function () {
    $user = User::factory()->create();
    Summary::factory()->for($user)->count(3)->create();

    $this->actingAs($user)
        ->get(route('summaries.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('summaryHistory', 3)
        );
});
