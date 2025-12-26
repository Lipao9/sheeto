<?php

use Illuminate\Support\Facades\Schema;

it('has a sessions table for database sessions', function () {
    expect(Schema::hasTable('sessions'))->toBeTrue();
});
