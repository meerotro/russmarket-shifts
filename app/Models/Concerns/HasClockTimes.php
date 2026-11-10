<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * The database returns TIME columns as "HH:MM:SS"; the application works with "HH:MM" everywhere.
 */
trait HasClockTimes
{
    protected function startTime(): Attribute
    {
        return Attribute::get(fn (string $value) => substr($value, 0, 5));
    }

    protected function endTime(): Attribute
    {
        return Attribute::get(fn (string $value) => substr($value, 0, 5));
    }
}
