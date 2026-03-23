<?php

use App\Models\User;
use App\Models\Worksheet;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

test('worksheet owner can register a share click', function () {
    $user = User::factory()->create();
    $worksheet = Worksheet::factory()->for($user)->create([
        'share_link_copies_count' => 0,
    ]);

    $response = $this->actingAs($user)->post(
        route('worksheets.share.click', $worksheet)
    );

    $response->assertRedirect(route('worksheets.index', [
        'worksheet' => $worksheet->id,
    ]));

    expect($worksheet->fresh()->share_link_copies_count)->toBe(1);
});

test('user cannot register share click for worksheet owned by another user', function () {
    $user = User::factory()->create();
    $worksheet = Worksheet::factory()->create([
        'share_link_copies_count' => 0,
    ]);

    $response = $this->actingAs($user)->post(
        route('worksheets.share.click', $worksheet)
    );

    $response->assertNotFound();
    expect($worksheet->fresh()->share_link_copies_count)->toBe(0);
});

test('signed share link renders shared worksheet and tracks open event', function () {
    $this->withoutVite();

    $worksheet = Worksheet::factory()->create([
        'share_link_visits_count' => 0,
    ]);

    $response = $this->get(URL::signedRoute('worksheets.shared.show', [
        'worksheet' => $worksheet,
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('worksheets/shared')
            ->where('worksheet.id', $worksheet->id)
            ->where('worksheet.discipline', $worksheet->discipline)
            ->where('worksheet.topic', $worksheet->topic)
            ->where('worksheet.question_count', $worksheet->question_count)
        );

    expect($worksheet->fresh()->share_link_visits_count)->toBe(1);
});

test('shared worksheet requires a valid signature', function () {
    $worksheet = Worksheet::factory()->create();

    $this->get(route('worksheets.shared.show', [
        'worksheet' => $worksheet,
    ]))->assertForbidden();
});
