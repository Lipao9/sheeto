<?php

use App\Jobs\ProcessSummary;
use App\Models\Summary;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

test('store dispatches job and creates summary with processing status', function () {
    Bus::fake();

    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('estudo.txt', str_repeat('Conteudo. ', 20));

    $response = $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    $summary = Summary::query()->where('user_id', $user->id)->first();

    expect($summary)->not()->toBeNull()
        ->and($summary->status)->toBe(Summary::STATUS_PROCESSING)
        ->and($summary->content)->toBeNull()
        ->and($summary->source_file_name)->toBe('estudo.txt');

    $response->assertRedirect(route('summaries.show', ['summary' => $summary->id]));

    Bus::assertDispatched(ProcessSummary::class, function (ProcessSummary $job) use ($summary) {
        return $job->summaryId === $summary->id;
    });
});

test('store saves uploaded file to local storage for the job', function () {
    Bus::fake();
    Storage::fake('local');

    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent('notes.txt', str_repeat('Content. ', 20));

    $this->actingAs($user)->post(route('summaries.store'), [
        'source_document' => $file,
    ]);

    Bus::assertDispatched(ProcessSummary::class, function (ProcessSummary $job) {
        return str_starts_with($job->storedFilePath, 'summary-uploads/');
    });
});

test('process summary job completes summary successfully', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Storage::fake('local');

    $user = User::factory()->create();
    $summary = Summary::factory()->processing()->for($user)->create([
        'title' => 'Gerando resumo...',
        'discipline' => 'Processando...',
        'topic' => 'Processando...',
    ]);

    $storedPath = 'summary-uploads/test-file.txt';
    Storage::disk('local')->put($storedPath, str_repeat('Conteudo sobre algebra linear. ', 20));

    Http::fake([
        '*/chat/completions' => Http::sequence([
            Http::response([
                'choices' => [
                    ['message' => ['content' => "STATUS: ok\nDISCIPLINE: Matematica\nTOPIC: Algebra Linear"]],
                ],
            ]),
            Http::response([
                'choices' => [
                    ['message' => ['content' => "Titulo do Resumo: Resumo de Algebra Linear\n\nVisao Geral:\nConteudo do resumo gerado."]],
                ],
            ]),
        ]),
    ]);

    $job = new ProcessSummary($summary->id, $storedPath, 'estudo.txt', [
        'notes' => null,
    ]);

    $job->handle(
        app(\App\Actions\Summaries\PrepareDocumentForSummary::class),
        app(\App\Actions\Summaries\GenerateSummary::class)
    );

    $summary->refresh();

    expect($summary->status)->toBe(Summary::STATUS_COMPLETED)
        ->and($summary->content)->toContain('Titulo do Resumo')
        ->and($summary->discipline)->toBe('Matematica')
        ->and($summary->topic)->toBe('Algebra Linear')
        ->and($summary->error_message)->toBeNull();

    Storage::disk('local')->assertMissing($storedPath);
});

test('process summary job marks summary as failed on error', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Storage::fake('local');

    $user = User::factory()->create();
    $summary = Summary::factory()->processing()->for($user)->create();

    $storedPath = 'summary-uploads/test-file.txt';
    Storage::disk('local')->put($storedPath, 'short');

    Http::fake([
        '*/chat/completions' => Http::response([], 500),
    ]);

    $job = new ProcessSummary($summary->id, $storedPath, 'bad.txt');

    $job->handle(
        app(\App\Actions\Summaries\PrepareDocumentForSummary::class),
        app(\App\Actions\Summaries\GenerateSummary::class)
    );

    $summary->refresh();

    expect($summary->status)->toBe(Summary::STATUS_FAILED)
        ->and($summary->error_message)->not->toBeEmpty();

    Storage::disk('local')->assertMissing($storedPath);
});

test('process summary job uses user-provided title when given', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Storage::fake('local');

    $user = User::factory()->create();
    $summary = Summary::factory()->processing()->for($user)->create([
        'title' => 'Meu titulo customizado',
    ]);

    $storedPath = 'summary-uploads/test-file.txt';
    Storage::disk('local')->put($storedPath, str_repeat('Conteudo sobre historia. ', 20));

    Http::fake([
        '*/chat/completions' => Http::sequence([
            Http::response([
                'choices' => [
                    ['message' => ['content' => "STATUS: ok\nDISCIPLINE: Historia\nTOPIC: Brasil Colonial"]],
                ],
            ]),
            Http::response([
                'choices' => [
                    ['message' => ['content' => "Titulo do Resumo: Resumo gerado\n\nVisao Geral:\nConteudo."]],
                ],
            ]),
        ]),
    ]);

    $job = new ProcessSummary($summary->id, $storedPath, 'historia.txt', [
        'title' => 'Meu titulo customizado',
    ]);

    $job->handle(
        app(\App\Actions\Summaries\PrepareDocumentForSummary::class),
        app(\App\Actions\Summaries\GenerateSummary::class)
    );

    $summary->refresh();

    expect($summary->title)->toBe('Meu titulo customizado');
});

test('process summary job skips if summary is no longer processing', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $summary = Summary::factory()->for($user)->create([
        'status' => Summary::STATUS_COMPLETED,
    ]);

    $storedPath = 'summary-uploads/test-file.txt';
    Storage::disk('local')->put($storedPath, 'content');

    $job = new ProcessSummary($summary->id, $storedPath, 'file.txt');

    $job->handle(
        app(\App\Actions\Summaries\PrepareDocumentForSummary::class),
        app(\App\Actions\Summaries\GenerateSummary::class)
    );

    $summary->refresh();

    expect($summary->status)->toBe(Summary::STATUS_COMPLETED);

    Storage::disk('local')->assertMissing($storedPath);
});

test('show page returns processing status for pending summaries', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $summary = Summary::factory()->processing()->for($user)->create();

    $this->actingAs($user)
        ->get(route('summaries.show', $summary))
        ->assertOk()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('summaries/show')
            ->where('summary.status', Summary::STATUS_PROCESSING)
        );
});

test('show page returns failed status with error message', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $summary = Summary::factory()->failed()->for($user)->create();

    $this->actingAs($user)
        ->get(route('summaries.show', $summary))
        ->assertOk()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('summaries/show')
            ->where('summary.status', Summary::STATUS_FAILED)
            ->where('summary.error_message', $summary->error_message)
        );
});
