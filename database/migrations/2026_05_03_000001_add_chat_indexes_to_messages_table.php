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
        Schema::table('messages', function (Blueprint $table) {
            $table->index(['user_id', 'recipient_id', 'id'], 'messages_user_recipient_id_index');
            $table->index(['recipient_id', 'user_id', 'id'], 'messages_recipient_user_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_user_recipient_id_index');
            $table->dropIndex('messages_recipient_user_id_index');
        });
    }
};
