<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PeriodRequest;
use App\Http\Requests\SaveShiftsRequest;
use App\Http\Resources\ShiftResource;
use App\Services\ScheduleService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShiftController extends Controller
{
    public function __construct(private readonly ScheduleService $schedule) {}

    public function index(PeriodRequest $request): AnonymousResourceCollection
    {
        [$from, $to] = [$request->from(), $request->to()];

        return ShiftResource::collection($this->schedule->shiftsBetween($from, $to))->additional([
            'meta' => [
                'from' => $from,
                'to' => $to,
                'published_days' => $this->schedule->publishedDaysBetween($from, $to),
            ],
        ]);
    }

    /**
     * Saves a batch of changes in one transaction and returns the stored shifts.
     */
    public function sync(SaveShiftsRequest $request): AnonymousResourceCollection
    {
        $result = $this->schedule->applyChanges($request->upserts(), $request->deletes());

        return ShiftResource::collection($result['shifts'])->additional([
            'meta' => ['unpublished_days' => $result['unpublished_days']],
        ]);
    }
}
