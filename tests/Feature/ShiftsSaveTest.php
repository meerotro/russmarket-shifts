<?php

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;

beforeEach(function () {
    $this->alina = Employee::factory()->create(['full_name' => 'Кузнецова Алина']);
    $this->timur = Employee::factory()->create(['full_name' => 'Волков Тимур']);
    $this->morning = ShiftTemplate::factory()->create(['name' => 'Утро', 'start_time' => '07:00', 'end_time' => '15:00']);
});

it('creates shifts and returns them', function () {
    $this->putJson('/api/shifts', ['upsert' => [
        shiftPayload($this->alina, '2026-11-10', ['start_time' => '07:00', 'end_time' => '15:00', 'template_id' => $this->morning->id]),
        shiftPayload($this->timur, '2026-11-11'),
    ]])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.employee_id', $this->alina->id)
        ->assertJsonPath('data.0.template_id', $this->morning->id)
        ->assertJsonPath('data.0.duration_minutes', 480)
        ->assertJsonPath('data.1.template_id', null);

    expect(Shift::query()->count())->toBe(2);
});

it('replaces the existing shift of the same employee and day', function () {
    $existing = Shift::factory()->for($this->alina)->create(['date' => '2026-11-10']);

    $this->putJson('/api/shifts', ['upsert' => [
        shiftPayload($this->alina, '2026-11-10', ['start_time' => '10:00', 'end_time' => '23:00']),
    ]])->assertOk()->assertJsonPath('data.0.id', $existing->id);

    expect(Shift::query()->count())->toBe(1)
        ->and($existing->refresh()->start_time)->toBe('10:00')
        ->and($existing->end_time)->toBe('23:00');
});

it('deletes shifts', function () {
    Shift::factory()->for($this->alina)->create(['date' => '2026-11-10']);
    Shift::factory()->for($this->timur)->create(['date' => '2026-11-10']);

    $this->putJson('/api/shifts', ['delete' => [
        ['employee_id' => $this->alina->id, 'date' => '2026-11-10'],
    ]])->assertOk()->assertJsonCount(0, 'data');

    expect(Shift::query()->pluck('employee_id')->all())->toBe([$this->timur->id]);
});

it('accepts a night shift and counts it past midnight', function () {
    $this->putJson('/api/shifts', ['upsert' => [
        shiftPayload($this->alina, '2026-11-10', ['start_time' => '22:00', 'end_time' => '06:00']),
    ]])->assertOk()->assertJsonPath('data.0.duration_minutes', 480);
});

it('rejects invalid shifts with an error on the exact field', function (array $overrides, string $errorKey) {
    $this->putJson('/api/shifts', ['upsert' => [
        shiftPayload($this->alina, '2026-11-10'),
        shiftPayload($this->timur, '2026-11-10', $overrides),
    ]])->assertUnprocessable()->assertJsonValidationErrors($errorKey);

    expect(Shift::query()->count())->toBe(0);
})->with([
    'unknown employee' => [['employee_id' => 999999], 'upsert.1.employee_id'],
    'unknown template' => [['template_id' => 999999], 'upsert.1.template_id'],
    'bad date' => [['date' => '10.11.2026'], 'upsert.1.date'],
    'bad start time' => [['start_time' => '25:00'], 'upsert.1.start_time'],
    'bad end time' => [['end_time' => '17'], 'upsert.1.end_time'],
    'zero length' => [['start_time' => '09:00', 'end_time' => '09:00'], 'upsert.1.end_time'],
    'missing start time' => [['start_time' => null], 'upsert.1.start_time'],
]);

it('rejects the same cell twice in one batch', function () {
    $this->putJson('/api/shifts', [
        'upsert' => [shiftPayload($this->alina, '2026-11-10'), shiftPayload($this->alina, '2026-11-10')],
    ])->assertUnprocessable()->assertJsonValidationErrors('upsert.1.date');

    $this->putJson('/api/shifts', [
        'upsert' => [shiftPayload($this->alina, '2026-11-10')],
        'delete' => [['employee_id' => $this->alina->id, 'date' => '2026-11-10']],
    ])->assertUnprocessable()->assertJsonValidationErrors('delete.0.date');
});

it('rejects an empty batch', function () {
    $this->putJson('/api/shifts', [])->assertUnprocessable()->assertJsonValidationErrors('upsert');
});
