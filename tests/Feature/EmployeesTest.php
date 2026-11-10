<?php

use App\Models\Employee;

beforeEach(function () {
    foreach (['Кузнецова Алина', 'Волков Тимур', 'Морозова Виктория'] as $name) {
        Employee::factory()->create(['full_name' => $name]);
    }
});

it('lists employees in a stable order', function () {
    $this->getJson('/api/employees')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.full_name', 'Кузнецова Алина')
        ->assertJsonStructure(['data' => [['id', 'full_name', 'position', 'avatar_url']]]);
});

it('searches by part of the name regardless of case', function (string $search) {
    $this->getJson('/api/employees?search='.urlencode($search))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.full_name', 'Морозова Виктория');
})->with(['Морозова', 'морозова', 'ВИКТОР', 'озова вик', '  Виктория  ']);

it('returns an empty list when nobody matches', function () {
    $this->getJson('/api/employees?search=Иванов')->assertOk()->assertJsonCount(0, 'data');
});

it('treats LIKE wildcards in the search as plain text', function () {
    $this->getJson('/api/employees?search=%25')->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/employees?search=_')->assertOk()->assertJsonCount(0, 'data');
});
