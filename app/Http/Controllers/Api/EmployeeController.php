<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = trim((string) $request->query('search', ''));

        $employees = Employee::query()
            ->when($search !== '', function ($query) use ($search) {
                // LOWER() on both sides keeps the search case-insensitive for Cyrillic on any
                // database. The wildcard characters typed by the user are escaped to match literally.
                $pattern = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';
                $query->whereRaw('LOWER(full_name) LIKE ?', [$pattern]);
            })
            ->orderBy('id')
            ->get();

        return EmployeeResource::collection($employees);
    }
}
