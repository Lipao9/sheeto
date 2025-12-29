<?php

use App\Models\User;
use App\Models\Worksheet;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access worksheets', function () {
    $this->get(route('worksheets.index'))->assertRedirect(route('login'));
});

test('user can create a worksheet and see generated content', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Conteudo gerado pela IA.']],
            ],
        ]),
    ]);

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload()
    );

    $worksheet = Worksheet::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(
        route('worksheets.index', ['worksheet' => $worksheet?->id])
    );

    expect($worksheet)->not()->toBeNull()
        ->and($worksheet?->content)->not->toBeEmpty()
        ->and($worksheet?->exercise_types)->toBe(['multipla_escolha'])
        ->and($worksheet?->answer_style)->toBe('simples');

    $this->assertDatabaseHas('worksheets', [
        'id' => $worksheet?->id,
        'user_id' => $user->id,
        'education_level' => 'escola',
        'discipline' => 'Matematica',
        'topic' => 'Derivadas',
    ]);
});

test('grade year is required for school level', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload(['grade_year' => null])
    );

    $response->assertSessionHasErrors(['grade_year']);
});

test('exercise types are required', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload(['exercise_types' => []])
    );

    $response->assertSessionHasErrors(['exercise_types']);
});

test('question count cannot exceed twenty', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload(['question_count' => 21])
    );

    $response->assertSessionHasErrors(['question_count']);
});

test('exercise types accept practical problems', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Conteudo gerado pela IA.']],
            ],
        ]),
    ]);

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload(['exercise_types' => ['problemas_praticos']])
    );

    $worksheet = Worksheet::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(
        route('worksheets.index', ['worksheet' => $worksheet?->id])
    );

    expect($worksheet?->exercise_types)->toBe(['problemas_praticos']);
});

test('answer style can be explanation', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Conteudo gerado pela IA.']],
            ],
        ]),
    ]);

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload(['answer_style' => 'explicacao'])
    );

    $worksheet = Worksheet::query()->where('user_id', $user->id)->first();

    $response->assertRedirect(
        route('worksheets.index', ['worksheet' => $worksheet?->id])
    );

    expect($worksheet?->answer_style)->toBe('explicacao');
});

test('user can delete a worksheet', function () {
    $user = User::factory()->create();
    $worksheet = Worksheet::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(
        route('worksheets.destroy', $worksheet)
    );

    $response->assertRedirect(route('worksheets.index'));

    $this->assertDatabaseMissing('worksheets', [
        'id' => $worksheet->id,
    ]);
});

test('user cannot delete worksheets from other users', function () {
    $user = User::factory()->create();
    $worksheet = Worksheet::factory()->create();

    $response = $this->actingAs($user)->delete(
        route('worksheets.destroy', $worksheet)
    );

    $response->assertNotFound();
});

test('semester period is required for college and postgraduate levels', function (string $educationLevel) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('worksheets.store'),
        worksheetPayload([
            'education_level' => $educationLevel,
            'grade_year' => null,
            'semester_period' => null,
        ])
    );

    $response->assertSessionHasErrors(['semester_period']);
})->with([
    'faculdade' => ['faculdade'],
    'pos-graduacao' => ['pos-graduacao'],
]);

test('history only shows worksheets from the authenticated user', function () {
    $user = User::factory()->create();
    $worksheet = Worksheet::factory()->for($user)->create([
        'exercise_types' => ['multipla_escolha', 'discursivo'],
    ]);
    Worksheet::factory()->create(); // Belongs to another user

    $response = $this->actingAs($user)->get(route('worksheets.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('worksheets/index')
        ->where('worksheet.id', $worksheet->id)
        ->where('worksheet.exercise_types', ['multipla_escolha', 'discursivo'])
        ->has('worksheetHistory', 1)
        ->where('worksheetHistory.0.id', $worksheet->id)
    );
});

test('user can view the worksheets index without a selected worksheet', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('worksheets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('worksheets/index')
            ->where('worksheet', null)
            ->has('worksheetHistory', 0)
        );
});

test('user can view the create worksheet page', function () {
    $user = User::factory()->create();
    Worksheet::factory()->for($user)->create([
        'education_level' => 'escola',
        'grade_year' => '1o ano',
        'question_count' => 5,
        'answer_style' => 'simples',
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);
    $worksheet = Worksheet::factory()->for($user)->create([
        'education_level' => 'faculdade',
        'grade_year' => null,
        'semester_period' => '2o semestre',
        'question_count' => 12,
        'answer_style' => 'explicacao',
        'discipline' => 'Biologia',
        'topic' => 'Genetica',
    ]);

    $this->actingAs($user)
        ->get(route('worksheets.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('worksheets/create')
            ->has('worksheetHistory', 2)
            ->where('worksheetHistory.0.id', $worksheet->id)
            ->where('worksheetHistory.0.discipline', 'Biologia')
            ->where('worksheetHistory.0.topic', 'Genetica')
            ->where('lastWorksheet.education_level', 'faculdade')
            ->where('lastWorksheet.grade_year', null)
            ->where('lastWorksheet.semester_period', '2o semestre')
            ->where('lastWorksheet.question_count', 12)
            ->where('lastWorksheet.answer_style', 'explicacao')
        );
});

function worksheetPayload(array $overrides = []): array
{
    return array_merge([
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
    ], $overrides);
}
