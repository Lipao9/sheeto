<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Summary>
 */
class SummaryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalPages = fake()->numberBetween(5, 100);
        $hasRange = $totalPages > 30;
        $rangeStart = $hasRange ? fake()->numberBetween(1, $totalPages - 10) : null;
        $rangeEnd = $hasRange ? min($rangeStart + fake()->numberBetween(5, 29), $totalPages) : null;

        return [
            'user_id' => User::factory(),
            'title' => 'Resumo: '.fake()->sentence(3),
            'discipline' => fake()->randomElement(['Matematica', 'Historia', 'Biologia', 'Geografia']),
            'topic' => fake()->sentence(3),
            'source_file_name' => fake()->randomElement([fake()->word().'.pdf', fake()->word().'.docx', null]),
            'page_range_start' => $rangeStart,
            'page_range_end' => $rangeEnd,
            'total_pages' => $totalPages,
            'content' => fake()->paragraphs(5, true),
            'share_link_copies_count' => 0,
            'share_link_visits_count' => 0,
        ];
    }
}
