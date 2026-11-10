<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * The single place on the backend that knows how long a shift is.
 *
 * Rules (mirrored by resources/js/lib/time.ts):
 *  - times are wall-clock "HH:MM";
 *  - an end time that is not later than the start time means the shift ends on the next day;
 *  - a shift cannot start and end at the same minute.
 */
final class ShiftDuration
{
    private const MINUTES_PER_DAY = 1440;

    private const TIME_PATTERN = '/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/';

    public static function minutes(string $start, string $end): int
    {
        $from = self::toMinutes($start);
        $to = self::toMinutes($end);

        if ($from === $to) {
            throw new InvalidArgumentException('A shift cannot start and end at the same time.');
        }

        return $to > $from ? $to - $from : $to + self::MINUTES_PER_DAY - $from;
    }

    public static function crossesMidnight(string $start, string $end): bool
    {
        return self::toMinutes($end) <= self::toMinutes($start);
    }

    private static function toMinutes(string $time): int
    {
        if (preg_match(self::TIME_PATTERN, $time, $m) !== 1) {
            throw new InvalidArgumentException("Invalid time: {$time}");
        }

        return (int) $m[1] * 60 + (int) $m[2];
    }
}
