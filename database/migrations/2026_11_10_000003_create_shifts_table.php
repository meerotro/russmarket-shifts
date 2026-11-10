<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            // end_time <= start_time means the shift runs past midnight; it still belongs to `date`.
            $table->time('end_time');
            // null = a custom shift that was not created from a template.
            $table->foreignId('template_id')->nullable()->constrained('shift_templates')->nullOnDelete();
            $table->timestamps();

            // One shift per employee per day.
            $table->unique(['employee_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
