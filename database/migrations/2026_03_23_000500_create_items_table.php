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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 150);
            $table->string('sku', 60)->unique();
            $table->text('description')->nullable();
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->unsignedInteger('quantity')->default(0);
            $table->string('unit', 30)->default('piece');
            $table->string('item_condition', 20)->default('good');
            $table->string('status', 20)->default('available');
            $table->boolean('is_decommissioned')->default(false);
            $table->timestamp('decommissioned_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
