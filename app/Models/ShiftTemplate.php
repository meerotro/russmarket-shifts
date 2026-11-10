<?php

namespace App\Models;

use App\Models\Concerns\HasClockTimes;
use Database\Factories\ShiftTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftTemplate extends Model
{
    use HasClockTimes;

    /** @use HasFactory<ShiftTemplateFactory> */
    use HasFactory;

    protected $fillable = ['name', 'start_time', 'end_time', 'color', 'sort_order'];
}
