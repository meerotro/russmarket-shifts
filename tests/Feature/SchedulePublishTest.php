<?php

use App\Models\PublishedDay;

it('publishes every day of the period', function () {
    $this->postJson('/api/schedule/publish', ['from' => '2026-11-09', 'to' => '2026-11-15'])
        ->assertOk()
        ->assertJsonPath('data.from', '2026-11-09')
        ->assertJsonPath('data.to', '2026-11-15')
        ->assertJsonCount(7, 'data.published_days')
        ->assertJsonPath('data.published_days.0', '2026-11-09')
        ->assertJsonPath('data.published_days.6', '2026-11-15');

    expect(PublishedDay::query()->count())->toBe(7);
});

it('can publish the same period again without duplicates', function () {
    $this->postJson('/api/schedule/publish', ['from' => '2026-11-09', 'to' => '2026-11-10'])->assertOk();
    $this->postJson('/api/schedule/publish', ['from' => '2026-11-10', 'to' => '2026-11-11'])->assertOk();

    expect(PublishedDay::query()->count())->toBe(3);

    $this->getJson('/api/shifts?from=2026-11-09&to=2026-11-15')
        ->assertJsonPath('meta.published_days', ['2026-11-09', '2026-11-10', '2026-11-11']);
});

it('validates the period', function (array $payload, string $field) {
    $this->postJson('/api/schedule/publish', $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'empty' => [[], 'from'],
    'end before start' => [['from' => '2026-11-15', 'to' => '2026-11-09'], 'to'],
    'too long' => [['from' => '2026-01-01', 'to' => '2026-06-01'], 'to'],
]);
