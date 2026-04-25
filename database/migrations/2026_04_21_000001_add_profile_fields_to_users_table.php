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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'nickname')) {
                $table->string('nickname', 100)->nullable()->after('name');
            }

            if (! Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 30)->nullable()->after('nickname');
            }

            if (! Schema::hasColumn('users', 'department')) {
                $table->string('department', 120)->nullable()->after('gender');
            }

            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role', 30)->default('staff')->after('department');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'nickname')) {
                $table->dropColumn('nickname');
            }

            if (Schema::hasColumn('users', 'gender')) {
                $table->dropColumn('gender');
            }

            if (Schema::hasColumn('users', 'department')) {
                $table->dropColumn('department');
            }

        });
    }
};
