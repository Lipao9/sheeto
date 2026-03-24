<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('discipline');
            $table->string('topic');
            $table->string('source_file_name')->nullable();
            $table->unsignedSmallInteger('page_range_start')->nullable();
            $table->unsignedSmallInteger('page_range_end')->nullable();
            $table->unsignedSmallInteger('total_pages')->nullable();
            $table->longText('content');
            $table->unsignedInteger('share_link_copies_count')->default(0);
            $table->unsignedInteger('share_link_visits_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('summaries');
    }
};
