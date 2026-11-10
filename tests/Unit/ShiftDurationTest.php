<?php

use App\Services\ShiftDuration;

it('measures a daytime shift', function (string $start, string $end, int $minutes) {
    expect(ShiftDuration::minutes($start, $end))->toBe($minutes);
})->with([
    'template morning' => ['07:00', '15:00', 480],
    'template evening' => ['15:00', '23:00', 480],
    'with minutes' => ['08:30', '18:15', 585],
    'one minute' => ['12:00', '12:01', 1],
    'database format with seconds' => ['10:00:00', '18:00:00', 480],
]);

it('treats an end time before the start as the next day', function (string $start, string $end, int $minutes) {
    expect(ShiftDuration::minutes($start, $end))->toBe($minutes)
        ->and(ShiftDuration::crossesMidnight($start, $end))->toBeTrue();
})->with([
    'night shift' => ['22:00', '06:00', 480],
    'ends at midnight' => ['16:00', '00:00', 480],
    'almost a full day' => ['12:00', '11:59', 1439],
]);

it('does not flag a daytime shift as crossing midnight', function () {
    expect(ShiftDuration::crossesMidnight('07:00', '15:00'))->toBeFalse();
});

it('rejects a shift that starts and ends at the same minute', function () {
    ShiftDuration::minutes('09:00', '09:00');
})->throws(InvalidArgumentException::class);

it('rejects malformed times', function (string $time) {
    ShiftDuration::minutes($time, '10:00');
})->with(['24:00', '9:00', '09-00', '', 'abc'])->throws(InvalidArgumentException::class);
