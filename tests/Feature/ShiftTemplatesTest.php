<?php

use App\Models\ShiftTemplate;

it('lists templates in display order with their duration', function () {
    ShiftTemplate::factory()->create(['name' => 'Вечер', 'start_time' => '15:00', 'end_time' => '23:00', 'color' => 'mint', 'sort_order' => 3]);
    ShiftTemplate::factory()->create(['name' => 'Утро', 'start_time' => '07:00', 'end_time' => '15:00', 'color' => 'blue', 'sort_order' => 1]);

    $this->getJson('/api/shift-templates')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0', fn (array $template) => $template['name'] === 'Утро'
            && $template['start_time'] === '07:00'
            && $template['end_time'] === '15:00'
            && $template['duration_minutes'] === 480
            && $template['color'] === 'blue')
        ->assertJsonPath('data.1.name', 'Вечер');
});
