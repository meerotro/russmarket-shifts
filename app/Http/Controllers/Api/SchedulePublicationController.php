<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PeriodRequest;
use App\Services\ScheduleService;
use Illuminate\Http\JsonResponse;

class SchedulePublicationController extends Controller
{
    public function store(PeriodRequest $request, ScheduleService $schedule): JsonResponse
    {
        return response()->json([
            'data' => [
                'from' => $request->from(),
                'to' => $request->to(),
                'published_days' => $schedule->publish($request->from(), $request->to()),
            ],
        ]);
    }
}
