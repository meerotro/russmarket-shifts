<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A day is published while it has a row here. Saving a change to a day removes the row,
        // so the schedule for that day goes back to draft until it is published again.
        Schema::create('published_days', function (Blueprint $table) {
            $table->date('date')->primary();
            $table->timestamp('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('published_days');
    }
};
