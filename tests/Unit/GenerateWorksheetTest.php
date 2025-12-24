<?php

use App\Actions\Worksheets\GenerateWorksheet;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class);

test('fallback true or false questions include blanks', function () {
    config()->set('services.openai.api_key', null);

    $payload = [
        'education_level' => 'escola',
        'discipline' => 'Matematica',
        'topic' => 'Derivadas',
        'difficulty' => 'intermediario',
        'goal' => 'revisao',
        'question_count' => 4,
        'exercise_types' => ['verdadeiro_falso'],
        'answer_style' => 'simples',
        'grade_year' => '2o ano',
        'semester_period' => null,
        'notes' => null,
    ];

    $content = (new GenerateWorksheet())->handle($payload);

    expect($content)
        ->toContain('Questoes:')
        ->toContain('(   )');
});

test('throws when the api request fails', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Http::fake(fn () => throw new ConnectionException('Connection failed.'));

    $payload = [
        'education_level' => 'escola',
        'discipline' => 'Matematica',
        'topic' => 'Derivadas',
        'difficulty' => 'intermediario',
        'goal' => 'revisao',
        'question_count' => 2,
        'exercise_types' => ['multipla_escolha'],
        'answer_style' => 'simples',
        'grade_year' => '2o ano',
        'semester_period' => null,
        'notes' => null,
    ];

    expect(fn () => (new GenerateWorksheet())->handle($payload))
        ->toThrow(ConnectionException::class);
});

test('builds a plain text prompt with type rules', function () {
    config()->set('services.openai.api_key', 'fake-key');

    Http::fake([
        '*' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Conteudo gerado pela IA.']],
            ],
        ], 200),
    ]);

    $payload = [
        'education_level' => 'escola',
        'discipline' => 'Matematica',
        'topic' => 'Derivadas',
        'difficulty' => 'intermediario',
        'goal' => 'revisao',
        'question_count' => 3,
        'exercise_types' => ['verdadeiro_falso', 'multipla_escolha'],
        'answer_style' => 'explicacao',
        'grade_year' => '2o ano',
        'semester_period' => null,
        'notes' => null,
    ];

    (new GenerateWorksheet())->handle($payload);

    $recorded = Http::recorded();

    expect($recorded)->toHaveCount(1);

    $prompt = $recorded[0][0]->data()['messages'][1]['content'] ?? '';

    expect($prompt)
        ->toContain('Retorne APENAS TEXTO SIMPLES.')
        ->and($prompt)->toContain('Gabarito:')
        ->and($prompt)->toContain('Exemplo: 1. resposta - explicacao curta.')
        ->and($prompt)->toContain('verdadeiro_falso: use exatamente o enunciado')
        ->and($prompt)->toContain('verdadeiro_falso: gabarito no formato')
        ->and($prompt)->toContain('multipla_escolha: 4-5 alternativas')
        ->and($prompt)->toContain('multipla_escolha: gabarito apenas a letra');
});
