<?php

use App\Models\Employee;
use App\Models\PublishedDay;
use App\Models\Shift;

it('returns only the shifts inside the period', function () {
    $employee = Employee::factory()->create();

    foreach (['2026-11-08', '2026-11-09', '2026-11-15', '2026-11-16'] as $date) {
        Shift::factory()->for($employee)->create(['date' => $date]);
    }

    $this->getJson('/api/shifts?from=2026-11-09&to=2026-11-15')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.date', '2026-11-09')
        ->assertJsonPath('data.1.date', '2026-11-15')
        ->assertJsonPath('data.0.start_time', '09:00')
        ->assertJsonPath('data.0.duration_minutes', 480)
        ->assertJsonPath('meta.from', '2026-11-09')
        ->assertJsonPath('meta.to', '2026-11-15');
});

it('reports which days of the period are published', function () {
    PublishedDay::query()->create(['date' => '2026-11-10', 'published_at' => now()]);
    PublishedDay::query()->create(['date' => '2026-12-01', 'published_at' => now()]);

    $this->getJson('/api/shifts?from=2026-11-09&to=2026-11-15')
        ->assertOk()
        ->assertJsonPath('meta.published_days', ['2026-11-10']);
});

it('validates the period', function (string $query, string $field) {
    $this->getJson('/api/shifts?'.$query)->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'missing from' => ['to=2026-11-15', 'from'],
    'missing to' => ['from=2026-11-09', 'to'],
    'wrong format' => ['from=09.11.2026&to=2026-11-15', 'from'],
    'end before start' => ['from=2026-11-15&to=2026-11-09', 'to'],
    'too long' => ['from=2026-01-01&to=2026-12-31', 'to'],
]);
