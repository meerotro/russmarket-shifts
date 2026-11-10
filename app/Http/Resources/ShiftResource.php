<?php

namespace App\Http\Resources;

use App\Models\Shift;
use App\Services\ShiftDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Shift */
class ShiftResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'date' => $this->date->format('Y-m-d'),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'template_id' => $this->template_id,
            'duration_minutes' => ShiftDuration::minutes($this->start_time, $this->end_time),
        ];
    }
}
