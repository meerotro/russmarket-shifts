<?php

use App\Models\Employee;
use App\Models\PublishedDay;
use App\Models\Shift;
use App\Services\ScheduleService;
use Illuminate\Database\QueryException;

beforeEach(function () {
    $this->alina = Employee::factory()->create(['full_name' => 'Кузнецова Алина']);
    $this->timur = Employee::factory()->create(['full_name' => 'Волков Тимур']);
});

it('stores nothing when one item of the batch is invalid', function () {
    $kept = Shift::factory()->for($this->timur)->create(['date' => '2026-11-12']);

    $this->putJson('/api/shifts', [
        'upsert' => [
            shiftPayload($this->alina, '2026-11-10'),
            shiftPayload($this->alina, '2026-11-11', ['end_time' => 'nope']),
        ],
        'delete' => [['employee_id' => $this->timur->id, 'date' => '2026-11-12']],
    ])->assertUnprocessable();

    expect(Shift::query()->pluck('id')->all())->toBe([$kept->id]);
});

it('rolls the whole batch back when the database refuses a row', function () {
    $kept = Shift::factory()->for($this->timur)->create(['date' => '2026-11-12']);

    // Bypass HTTP validation to hit a foreign key failure in the middle of the transaction.
    $apply = fn () => app(ScheduleService::class)->applyChanges(
        upserts: [
            shiftPayload($this->alina, '2026-11-10'),
            shiftPayload($this->alina, '2026-11-11', ['employee_id' => 999999]),
        ],
        deletes: [['employee_id' => $this->timur->id, 'date' => '2026-11-12']],
    );

    expect($apply)->toThrow(QueryException::class)
        ->and(Shift::query()->pluck('id')->all())->toBe([$kept->id]);
});

it('returns edited published days to draft', function () {
    PublishedDay::query()->create(['date' => '2026-11-10', 'published_at' => now()]);
    PublishedDay::query()->create(['date' => '2026-11-11', 'published_at' => now()]);

    $this->putJson('/api/shifts', ['upsert' => [shiftPayload($this->alina, '2026-11-10')]])
        ->assertOk()
        ->assertJsonPath('meta.unpublished_days', ['2026-11-10']);

    expect(PublishedDay::query()->count())->toBe(1);
});
