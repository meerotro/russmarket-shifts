<?php

namespace App\Http\Requests;

use App\Models\Employee;
use App\Models\ShiftTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A batch of schedule changes. Error keys keep the item index ("upsert.3.end_time"), so the
 * client can show each message next to the cell it belongs to.
 */
class SaveShiftsRequest extends FormRequest
{
    public const MAX_ITEMS = 2000;

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'upsert' => ['sometimes', 'array', 'max:'.self::MAX_ITEMS],
            'upsert.*.employee_id' => ['required', 'integer'],
            'upsert.*.date' => ['required', 'date_format:Y-m-d'],
            'upsert.*.start_time' => ['required', 'date_format:H:i'],
            'upsert.*.end_time' => ['required', 'date_format:H:i', 'different:upsert.*.start_time'],
            'upsert.*.template_id' => ['nullable', 'integer'],

            'delete' => ['sometimes', 'array', 'max:'.self::MAX_ITEMS],
            'delete.*.employee_id' => ['required', 'integer'],
            'delete.*.date' => ['required', 'date_format:Y-m-d'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                // The basic rules have passed, so the raw input is safe to read here.
                $upserts = $this->normalizeUpserts($this->input('upsert', []));
                $deletes = $this->normalizeDeletes($this->input('delete', []));

                if ($upserts === [] && $deletes === []) {
                    $validator->errors()->add('upsert', 'Нет изменений для сохранения.');

                    return;
                }

                $this->validateReferences($validator, $upserts);
                $this->validateUniqueCells($validator, $upserts, $deletes);
            },
        ];
    }

    /**
     * Existence checks run as two queries for the whole batch instead of two per item.
     *
     * @param  list<array<string, mixed>>  $upserts
     */
    private function validateReferences(Validator $validator, array $upserts): void
    {
        $employeeIds = Employee::query()
            ->whereIn('id', array_unique(array_column($upserts, 'employee_id')))
            ->pluck('id')
            ->flip();

        $templateIds = ShiftTemplate::query()
            ->whereIn('id', array_unique(array_filter(array_column($upserts, 'template_id'))))
            ->pluck('id')
            ->flip();

        foreach ($upserts as $index => $shift) {
            if (! $employeeIds->has($shift['employee_id'])) {
                $validator->errors()->add("upsert.{$index}.employee_id", 'Сотрудник не найден.');
            }

            if ($shift['template_id'] !== null && ! $templateIds->has($shift['template_id'])) {
                $validator->errors()->add("upsert.{$index}.template_id", 'Шаблон смены не найден.');
            }
        }
    }

    /**
     * One cell (employee + date) may appear only once in the whole batch.
     *
     * @param  list<array<string, mixed>>  $upserts
     * @param  list<array<string, mixed>>  $deletes
     */
    private function validateUniqueCells(Validator $validator, array $upserts, array $deletes): void
    {
        $seen = [];

        foreach (['upsert' => $upserts, 'delete' => $deletes] as $list => $items) {
            foreach ($items as $index => $item) {
                $cell = $item['employee_id'].':'.$item['date'];

                if (isset($seen[$cell])) {
                    $validator->errors()->add("{$list}.{$index}.date", 'Ячейка указана в запросе дважды.');
                }

                $seen[$cell] = true;
            }
        }
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'upsert.*.employee_id.required' => 'Не указан сотрудник.',
            'upsert.*.date.required' => 'Не указана дата.',
            'upsert.*.date.date_format' => 'Дата должна быть в формате ГГГГ-ММ-ДД.',
            'upsert.*.start_time.required' => 'Укажите время начала.',
            'upsert.*.start_time.date_format' => 'Время начала должно быть в формате ЧЧ:ММ.',
            'upsert.*.end_time.required' => 'Укажите время окончания.',
            'upsert.*.end_time.date_format' => 'Время окончания должно быть в формате ЧЧ:ММ.',
            'upsert.*.end_time.different' => 'Начало и конец смены не могут совпадать.',
            'delete.*.employee_id.required' => 'Не указан сотрудник.',
            'delete.*.date.required' => 'Не указана дата.',
            'delete.*.date.date_format' => 'Дата должна быть в формате ГГГГ-ММ-ДД.',
            'upsert.max' => 'Слишком много изменений в одном запросе.',
            'delete.max' => 'Слишком много изменений в одном запросе.',
        ];
    }

    /** @return list<array{employee_id: int, date: string, start_time: string, end_time: string, template_id: int|null}> */
    public function upserts(): array
    {
        return $this->normalizeUpserts($this->validated('upsert', []));
    }

    /** @return list<array{employee_id: int, date: string}> */
    public function deletes(): array
    {
        return $this->normalizeDeletes($this->validated('delete', []));
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return list<array{employee_id: int, date: string, start_time: string, end_time: string, template_id: int|null}>
     */
    private function normalizeUpserts(array $items): array
    {
        return array_map(fn (array $shift) => [
            'employee_id' => (int) $shift['employee_id'],
            'date' => $shift['date'],
            'start_time' => $shift['start_time'],
            'end_time' => $shift['end_time'],
            'template_id' => isset($shift['template_id']) ? (int) $shift['template_id'] : null,
        ], array_values($items));
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return list<array{employee_id: int, date: string}>
     */
    private function normalizeDeletes(array $items): array
    {
        return array_map(fn (array $key) => [
            'employee_id' => (int) $key['employee_id'],
            'date' => $key['date'],
        ], array_values($items));
    }
}
