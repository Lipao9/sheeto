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
        Schema::create('worksheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('education_level');
            $table->string('discipline');
            $table->string('topic');
            $table->string('difficulty');
            $table->string('goal');
            $table->unsignedTinyInteger('question_count');
            $table->date('due_date');
            $table->string('grade_year')->nullable();
            $table->string('semester_period')->nullable();
            $table->text('notes')->nullable();
            $table->longText('content')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worksheets');
    }
};
