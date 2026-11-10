<?php

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use Database\Seeders\DatabaseSeeder;

it('seeds demo data and can be run twice without duplicates', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(Employee::query()->count())->toBe(12)
        ->and(ShiftTemplate::query()->orderBy('sort_order')->pluck('name')->all())->toBe(['Утро', 'День', 'Вечер'])
        ->and(Shift::query()->count())->toBe(10);
});
