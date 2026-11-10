<?php

namespace App\Services;

use App\Models\PublishedDay;
use App\Models\Shift;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ScheduleService
{
    /** @return Collection<int, Shift> */
    public function shiftsBetween(string $from, string $to): Collection
    {
        return Shift::query()
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->orderBy('employee_id')
            ->get();
    }

    /** @return list<string> */
    public function publishedDaysBetween(string $from, string $to): array
    {
        return PublishedDay::query()
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->get()
            ->map(fn (PublishedDay $day) => $day->date->format('Y-m-d'))
            ->all();
    }

    /**
     * Applies a batch of changes atomically: either every change is stored or none is.
     *
     * @param  list<array{employee_id: int, date: string, start_time: string, end_time: string, template_id?: int|null}>  $upserts
     * @param  list<array{employee_id: int, date: string}>  $deletes
     * @return array{shifts: Collection<int, Shift>, unpublished_days: list<string>}
     */
    public function applyChanges(array $upserts, array $deletes): array
    {
        return DB::transaction(function () use ($upserts, $deletes) {
            foreach ($deletes as $key) {
                Shift::query()
                    ->where('employee_id', $key['employee_id'])
                    ->whereDate('date', $key['date'])
                    ->delete();
            }

            if ($upserts !== []) {
                $now = now();

                Shift::query()->upsert(
                    array_map(fn (array $shift) => [
                        'employee_id' => $shift['employee_id'],
                        'date' => $shift['date'],
                        'start_time' => $shift['start_time'],
                        'end_time' => $shift['end_time'],
                        'template_id' => $shift['template_id'] ?? null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ], $upserts),
                    uniqueBy: ['employee_id', 'date'],
                    update: ['start_time', 'end_time', 'template_id', 'updated_at'],
                );
            }

            // A published day that has been edited is a draft again.
            $touchedDates = array_values(array_unique(array_column([...$upserts, ...$deletes], 'date')));
            $unpublished = $this->publishedDaysIn($touchedDates);
            PublishedDay::query()->whereIn('date', $touchedDates)->delete();

            return [
                'shifts' => $this->shiftsForKeys($upserts),
                'unpublished_days' => $unpublished,
            ];
        });
    }

    /**
     * Marks every day of the period as published.
     *
     * @return list<string> the published dates
     */
    public function publish(string $from, string $to): array
    {
        $now = now();
        $dates = [];

        foreach (CarbonPeriod::create(CarbonImmutable::parse($from), CarbonImmutable::parse($to)) as $day) {
            $dates[] = $day->format('Y-m-d');
        }

        PublishedDay::query()->upsert(
            array_map(fn (string $date) => ['date' => $date, 'published_at' => $now], $dates),
            uniqueBy: ['date'],
            update: ['published_at'],
        );

        return $dates;
    }

    /**
     * @param  list<string>  $dates
     * @return list<string>
     */
    private function publishedDaysIn(array $dates): array
    {
        return PublishedDay::query()
            ->whereIn('date', $dates)
            ->orderBy('date')
            ->get()
            ->map(fn (PublishedDay $day) => $day->date->format('Y-m-d'))
            ->all();
    }

    /**
     * @param  list<array{employee_id: int, date: string}>  $keys
     * @return Collection<int, Shift>
     */
    private function shiftsForKeys(array $keys): Collection
    {
        if ($keys === []) {
            return new Collection;
        }

        return Shift::query()
            ->where(function ($query) use ($keys) {
                foreach ($keys as $key) {
                    $query->orWhere(fn ($q) => $q
                        ->where('employee_id', $key['employee_id'])
                        ->whereDate('date', $key['date']));
                }
            })
            ->orderBy('date')
            ->orderBy('employee_id')
            ->get();
    }
}
