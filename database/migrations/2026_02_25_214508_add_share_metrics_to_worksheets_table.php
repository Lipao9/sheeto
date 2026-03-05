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
            $table->unsignedInteger('share_link_copies_count')->default(0);
            $table->unsignedInteger('share_link_visits_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('worksheets', function (Blueprint $table) {
            $table->dropColumn([
                'share_link_copies_count',
                'share_link_visits_count',
            ]);
        });
    }
};
