<?php

namespace App\Models;

use App\Models\Concerns\HasClockTimes;
use Database\Factories\ShiftFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shift extends Model
{
    use HasClockTimes;

    /** @use HasFactory<ShiftFactory> */
    use HasFactory;

    protected $fillable = ['employee_id', 'date', 'start_time', 'end_time', 'template_id'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }

    /** @return BelongsTo<Employee, $this> */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /** @return BelongsTo<ShiftTemplate, $this> */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class, 'template_id');
    }
}
