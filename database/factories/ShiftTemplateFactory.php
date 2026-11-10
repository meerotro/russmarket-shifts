<?php

namespace Database\Factories;

use App\Models\ShiftTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ShiftTemplate> */
class ShiftTemplateFactory extends Factory
{
    protected $model = ShiftTemplate::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => 'День',
            'start_time' => '10:00',
            'end_time' => '18:00',
            'color' => 'purple',
            'sort_order' => 0,
        ];
    }
}
