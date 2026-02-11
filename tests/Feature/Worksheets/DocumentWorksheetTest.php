<?php

use App\Models\User;
use App\Models\Worksheet;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

test('user can create a worksheet from a txt document with inferred metadata', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Http::fake([
        '*/chat/completions' => Http::sequence()
            ->push([
                'choices' => [
                    [
                        'message' => [
                            'content' => "STATUS: ok\nDISCIPLINE: Historia\nTOPIC: Revolucao Francesa",
                        ],
                    ],
                ],
            ])
            ->push([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'Conteudo gerado pela IA.',
                        ],
                    ],
                ],
            ]),
    ]);

    $user = User::factory()->create();
    $document = UploadedFile::fake()->createWithContent(
        'material.txt',
        'A Revolucao Francesa ocorreu no fim do seculo XVIII e transformou a organizacao politica da Franca.'
    );

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        ...documentPayload(),
        'source_document' => $document,
    ]);

    $worksheet = Worksheet::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(route('worksheets.index', ['worksheet' => $worksheet?->id]));

    expect($worksheet)->not()->toBeNull()
        ->and($worksheet?->discipline)->toBe('Historia')
        ->and($worksheet?->topic)->toBe('Revolucao Francesa')
        ->and($worksheet?->content)->not->toBeEmpty();
});

test('source document is required in document mode', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        ...documentPayload(),
        'source_document' => null,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('document mode rejects unsupported file types', function () {
    $user = User::factory()->create();
    $invalidFile = UploadedFile::fake()->create('material.csv', 10, 'text/csv');

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        ...documentPayload(),
        'source_document' => $invalidFile,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('document mode is blocked when openai key is missing', function () {
    config()->set('services.openai.api_key', null);

    $user = User::factory()->create();
    $document = UploadedFile::fake()->createWithContent(
        'material.txt',
        'Texto de exemplo para gerar uma ficha.'
    );

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        ...documentPayload(),
        'source_document' => $document,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('document mode maps scanned pdf failures to source document errors', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Http::fake(function ($request) {
        if (str_ends_with($request->url(), '/files') && $request->method() === 'POST') {
            return Http::response(['id' => 'file-123'], 200);
        }

        if (str_ends_with($request->url(), '/responses')) {
            return Http::response([
                'output_text' => "STATUS: no_text\nDISCIPLINE:\nTOPIC:\nREFERENCE_MATERIAL:\n",
            ], 200);
        }

        if (str_ends_with($request->url(), '/files/file-123') && $request->method() === 'DELETE') {
            return Http::response([], 200);
        }

        return Http::response([], 500);
    });

    $user = User::factory()->create();
    $pdf = UploadedFile::fake()->createWithContent(
        'escaneado.pdf',
        "%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n%%EOF"
    );

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        ...documentPayload(),
        'source_document' => $pdf,
    ]);

    $response->assertSessionHasErrors(['source_document']);
});

test('form mode still works when creation mode is omitted', function () {
    config()->set('services.openai.api_key', null);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('worksheets.store'), [
        'education_level' => 'escola',
        'discipline' => 'Matematica',
        'topic' => 'Derivadas',
        'difficulty' => 'intermediario',
        'goal' => 'revisao',
        'question_count' => 8,
        'exercise_types' => ['multipla_escolha'],
        'answer_style' => 'simples',
        'grade_year' => '2o ano',
        'notes' => 'Foco em interpretacao',
    ]);

    $worksheet = Worksheet::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(route('worksheets.index', ['worksheet' => $worksheet?->id]));

    expect($worksheet)->not->toBeNull()
        ->and($worksheet?->discipline)->toBe('Matematica')
        ->and($worksheet?->topic)->toBe('Derivadas');
});

function documentPayload(array $overrides = []): array
{
    return array_merge([
        'creation_mode' => 'document',
        'education_level' => 'escola',
        'difficulty' => 'intermediario',
        'goal' => 'revisao',
        'question_count' => 8,
        'exercise_types' => ['multipla_escolha'],
        'answer_style' => 'simples',
        'grade_year' => '2o ano',
        'notes' => 'Foco em interpretacao',
    ], $overrides);
}
