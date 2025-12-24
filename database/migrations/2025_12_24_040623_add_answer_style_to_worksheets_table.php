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
            $table->string('answer_style')->default('simples')->after('exercise_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('worksheets', function (Blueprint $table) {
            $table->dropColumn('answer_style');
        });
    }
};
