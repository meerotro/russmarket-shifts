<?php

namespace App\Http\Resources;

use App\Models\ShiftTemplate;
use App\Services\ShiftDuration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ShiftTemplate */
class ShiftTemplateResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => ShiftDuration::minutes($this->start_time, $this->end_time),
            'color' => $this->color,
        ];
    }
}
