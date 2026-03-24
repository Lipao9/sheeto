<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Summary extends Model
{
    /** @use HasFactory<\Database\Factories\SummaryFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'discipline',
        'topic',
        'source_file_name',
        'page_range_start',
        'page_range_end',
        'total_pages',
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
            'page_range_start' => 'integer',
            'page_range_end' => 'integer',
            'total_pages' => 'integer',
            'share_link_copies_count' => 'integer',
            'share_link_visits_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
