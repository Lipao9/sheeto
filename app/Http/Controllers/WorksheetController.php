<?php

namespace App\Http\Controllers;

use App\Actions\Worksheets\GenerateWorksheet;
use App\Http\Requests\Worksheets\StoreWorksheetRequest;
use App\Models\Worksheet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorksheetController extends Controller
{
    public function index(Request $request): Response
    {
        $worksheetId = $request->integer('worksheet');

        $worksheet = $request->user()
            ->worksheets()
            ->when($worksheetId, fn ($query) => $query->whereKey($worksheetId))
            ->latest()
            ->first();

        if ($worksheetId && ! $worksheet) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('worksheets/index', [
            'worksheet' => $worksheet ? $this->presentWorksheet($worksheet) : null,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('worksheets/create');
    }

    public function store(
        StoreWorksheetRequest $request,
        GenerateWorksheet $generateWorksheet
    ): RedirectResponse {
        $data = $request->validated();

        $content = $generateWorksheet->handle($data);

        $worksheet = $request->user()->worksheets()->create([
            ...$data,
            'content' => $content,
        ]);

        return to_route('worksheets.index', ['worksheet' => $worksheet->id]);
    }

    public function destroy(Request $request, Worksheet $worksheet): RedirectResponse
    {
        if ($worksheet->user_id !== $request->user()?->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        $worksheet->delete();

        return to_route('worksheets.index');
    }

    private function presentWorksheet(Worksheet $worksheet): array
    {
        return [
            'id' => $worksheet->id,
            'education_level' => $worksheet->education_level,
            'discipline' => $worksheet->discipline,
            'topic' => $worksheet->topic,
            'difficulty' => $worksheet->difficulty,
            'goal' => $worksheet->goal,
            'question_count' => $worksheet->question_count,
            'exercise_types' => $worksheet->exercise_types ?? [],
            'answer_style' => $worksheet->answer_style ?? 'simples',
            'grade_year' => $worksheet->grade_year,
            'semester_period' => $worksheet->semester_period,
            'notes' => $worksheet->notes,
            'content' => $worksheet->content,
            'created_at' => $worksheet->created_at->toIso8601String(),
        ];
    }
}
