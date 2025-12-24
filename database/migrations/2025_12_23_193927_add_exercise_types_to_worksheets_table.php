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
        Schema::table('worksheets', function (Blueprint $table) {
            $table->json('exercise_types')->nullable()->after('question_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('worksheets', function (Blueprint $table) {
            $table->dropColumn('exercise_types');
        });
    }
};
