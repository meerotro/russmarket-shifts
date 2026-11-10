<?php

namespace App\Http\Requests;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A closed date range: used to read the schedule and to publish it.
 */
class PeriodRequest extends FormRequest
{
    /** The longest period the UI ever asks for is a calendar month; two months is a safe ceiling. */
    public const MAX_DAYS = 62;

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
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

                $days = CarbonImmutable::parse($this->from())->diffInDays(CarbonImmutable::parse($this->to())) + 1;

                if ($days > self::MAX_DAYS) {
                    $validator->errors()->add('to', 'Период не может быть длиннее '.self::MAX_DAYS.' дней.');
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'from.required' => 'Укажите начало периода.',
            'to.required' => 'Укажите конец периода.',
            'from.date_format' => 'Дата должна быть в формате ГГГГ-ММ-ДД.',
            'to.date_format' => 'Дата должна быть в формате ГГГГ-ММ-ДД.',
            'to.after_or_equal' => 'Конец периода не может быть раньше начала.',
        ];
    }

    public function from(): string
    {
        return $this->string('from')->toString();
    }

    public function to(): string
    {
        return $this->string('to')->toString();
    }
}
