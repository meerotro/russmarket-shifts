<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublishedDay extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = 'date';

    protected $keyType = 'string';

    protected $fillable = ['date', 'published_at'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'published_at' => 'datetime'];
    }
}
