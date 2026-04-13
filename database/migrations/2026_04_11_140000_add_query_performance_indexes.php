<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Supplements existing FK/unique indexes: speeds dashboard aggregates, recent activity,
     * facilities occupancy join, and damaged-item counts.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(
                ['transaction_type', 'status'],
                'transactions_transaction_type_status_index'
            );
            $table->index('transacted_at', 'transactions_transacted_at_index');
        });

        Schema::table('items', function (Blueprint $table) {
            $table->index(
                ['item_condition', 'is_decommissioned'],
                'items_item_condition_is_decommissioned_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_transaction_type_status_index');
            $table->dropIndex('transactions_transacted_at_index');
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex('items_item_condition_is_decommissioned_index');
        });
    }
};
