<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * Demo data. Safe to run more than once: nothing is duplicated.
 */
class DatabaseSeeder extends Seeder
{
    private const EMPLOYEES = [
        'Кузнецова Алина', 'Волков Тимур', 'Морозова Виктория', 'Соколов Артём',
        'Лебедева Полина', 'Новиков Кирилл', 'Ерохина Дарья', 'Гаврилов Егор',
        'Сергеев Олег', 'Зайцева Мария', 'Орлов Даниил', 'Белова Ксения',
    ];

    private const TEMPLATES = [
        ['name' => 'Утро', 'start_time' => '07:00', 'end_time' => '15:00', 'color' => 'blue'],
        ['name' => 'День', 'start_time' => '10:00', 'end_time' => '18:00', 'color' => 'purple'],
        ['name' => 'Вечер', 'start_time' => '15:00', 'end_time' => '23:00', 'color' => 'mint'],
    ];

    /** Shifts for the current week: [employee index, weekday offset from Monday, template name]. */
    private const SHIFTS = [
        [0, 1, 'День'], [0, 2, 'День'],
        [1, 1, 'День'], [1, 2, 'День'], [1, 4, 'Вечер'],
        [2, 3, 'День'],
        [3, 3, 'День'],
        [4, 1, 'Утро'], [4, 3, 'День'], [4, 4, 'День'],
    ];

    public function run(): void
    {
        $employees = collect(self::EMPLOYEES)->map(
            fn (string $name) => Employee::query()->firstOrCreate(['full_name' => $name], ['position' => 'агент']),
        );

        $templates = collect(self::TEMPLATES)->mapWithKeys(fn (array $template, int $index) => [
            $template['name'] => ShiftTemplate::query()->updateOrCreate(
                ['name' => $template['name']],
                [...$template, 'sort_order' => $index + 1],
            ),
        ]);

        if (Shift::query()->exists()) {
            return;
        }

        $monday = CarbonImmutable::today()->startOfWeek();

        foreach (self::SHIFTS as [$employeeIndex, $dayOffset, $templateName]) {
            $template = $templates[$templateName];

            Shift::query()->create([
                'employee_id' => $employees[$employeeIndex]->id,
                'date' => $monday->addDays($dayOffset)->format('Y-m-d'),
                'start_time' => $template->start_time,
                'end_time' => $template->end_time,
                'template_id' => $template->id,
            ]);
        }
    }
}
