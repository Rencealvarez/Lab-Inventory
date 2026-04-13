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
        Schema::table('incident_reports', function (Blueprint $table) {
            $table->foreignId('item_id')->nullable()->after('id')->constrained('items')->nullOnDelete();
            $table->text('damage_details')->nullable()->after('description');
            $table->decimal('estimated_cost', 12, 2)->nullable()->after('damage_details');
            $table->string('action_taken', 40)->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incident_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('item_id');
            $table->dropColumn(['damage_details', 'estimated_cost', 'action_taken']);
        });
    }
};
