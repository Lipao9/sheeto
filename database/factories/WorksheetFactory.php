<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Worksheet>
 */
class WorksheetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $educationLevel = fake()->randomElement([
            'escola',
            'faculdade',
            'pos-graduacao',
            'mestrado',
            'doutorado',
            'outro',
        ]);

        return [
            'user_id' => User::factory(),
            'education_level' => $educationLevel,
            'discipline' => fake()->randomElement(['Matematica', 'Historia', 'Biologia', 'Geografia']),
            'topic' => fake()->sentence(3),
            'difficulty' => fake()->randomElement(['iniciante', 'intermediario', 'avancado']),
            'goal' => fake()->randomElement(['prova', 'revisao', 'aprendizado']),
            'question_count' => fake()->numberBetween(5, 20),
            'exercise_types' => fake()->randomElements(
                ['multipla_escolha', 'discursivo', 'verdadeiro_falso', 'problemas_praticos'],
                fake()->numberBetween(1, 3)
            ),
            'answer_style' => fake()->randomElement(['simples', 'explicacao']),
            'grade_year' => $educationLevel === 'escola' ? fake()->randomElement(['6o ano', '8o ano', '3a serie']) : null,
            'semester_period' => in_array($educationLevel, ['faculdade', 'pos-graduacao'], true)
                ? fake()->randomElement(['1o semestre', '3o semestre', '5o semestre'])
                : null,
            'notes' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
        ];
    }
}
