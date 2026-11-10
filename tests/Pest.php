<?php

use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('Feature');

/**
 * A valid shift payload for PUT /api/shifts.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function shiftPayload(Employee $employee, string $date, array $overrides = []): array
{
    return [
        'employee_id' => $employee->id,
        'date' => $date,
        'start_time' => '09:00',
        'end_time' => '17:00',
        'template_id' => null,
        ...$overrides,
    ];
}
