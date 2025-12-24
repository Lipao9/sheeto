<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Worksheet extends Model
{
    /** @use HasFactory<\Database\Factories\WorksheetFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'education_level',
        'discipline',
        'topic',
        'difficulty',
        'goal',
        'question_count',
        'exercise_types',
        'answer_style',
        'grade_year',
        'semester_period',
        'notes',
        'content',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'exercise_types' => 'array',
            'question_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
