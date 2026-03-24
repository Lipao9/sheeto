<?php

namespace App\Http\Controllers;

use App\Http\Requests\Summaries\StoreSummaryRequest;
use App\Jobs\ProcessSummary;
use App\Models\Summary;
use App\Support\PdfPageCounter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SummaryController extends Controller
{
    public function shared(Summary $summary): Response
    {
        $summary->increment('share_link_visits_count');

        return Inertia::render('summaries/shared', [
            'summary' => $this->presentSharedSummary($summary),
        ]);
    }

    public function index(Request $request): Response
    {
        $summaries = $request->user()
            ->summaries()
            ->latest()
            ->paginate(12, ['id', 'title', 'discipline', 'topic', 'source_file_name', 'status', 'created_at']);

        return Inertia::render('summaries/index', [
            'summaries' => $summaries,
        ]);
    }

    public function show(Request $request, Summary $summary): Response
    {
        if ($summary->user_id !== $request->user()?->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('summaries/show', [
            'summary' => $this->presentSummary($summary),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('summaries/create');
    }

    public function store(StoreSummaryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $sourceDocument = $request->file('source_document');

        if ($sourceDocument === null) {
            throw ValidationException::withMessages([
                'source_document' => 'Envie um documento para gerar o resumo.',
            ]);
        }

        $pageRangeStart = isset($validated['page_range_start']) ? (int) $validated['page_range_start'] : null;
        $pageRangeEnd = isset($validated['page_range_end']) ? (int) $validated['page_range_end'] : null;

        $storedPath = 'summary-uploads/'.Str::uuid().'.'.$sourceDocument->getClientOriginalExtension();
        Storage::disk('local')->put($storedPath, file_get_contents($sourceDocument->getRealPath()));

        $title = trim((string) ($validated['title'] ?? ''));
        $discipline = trim((string) ($validated['discipline'] ?? ''));
        $topic = trim((string) ($validated['topic'] ?? ''));

        $summary = $request->user()->summaries()->create([
            'title' => $title !== '' ? $title : 'Gerando resumo...',
            'discipline' => $discipline !== '' ? $discipline : 'Processando...',
            'topic' => $topic !== '' ? $topic : 'Processando...',
            'source_file_name' => $sourceDocument->getClientOriginalName(),
            'page_range_start' => $pageRangeStart,
            'page_range_end' => $pageRangeEnd,
            'status' => Summary::STATUS_PROCESSING,
        ]);

        ProcessSummary::dispatch(
            $summary->id,
            $storedPath,
            $sourceDocument->getClientOriginalName(),
            [
                'title' => $validated['title'] ?? null,
                'discipline' => $validated['discipline'] ?? null,
                'topic' => $validated['topic'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'page_range_start' => $pageRangeStart,
                'page_range_end' => $pageRangeEnd,
            ]
        );

        return to_route('summaries.show', ['summary' => $summary->id]);
    }

    public function detectPageCount(Request $request): JsonResponse
    {
        $request->validate([
            'source_document' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $file = $request->file('source_document');
        $pageCount = $file ? PdfPageCounter::estimate($file) : null;

        return response()->json([
            'page_count' => $pageCount,
        ]);
    }

    public function trackShareClick(Request $request, Summary $summary): RedirectResponse
    {
        if ($summary->user_id !== $request->user()?->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        $summary->increment('share_link_copies_count');

        return to_route('summaries.show', ['summary' => $summary->id]);
    }

    public function destroy(Request $request, Summary $summary): RedirectResponse
    {
        if ($summary->user_id !== $request->user()?->id) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        $summary->delete();

        return to_route('summaries.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentSummary(Summary $summary): array
    {
        return [
            'id' => $summary->id,
            'title' => $summary->title,
            'discipline' => $summary->discipline,
            'topic' => $summary->topic,
            'source_file_name' => $summary->source_file_name,
            'page_range_start' => $summary->page_range_start,
            'page_range_end' => $summary->page_range_end,
            'total_pages' => $summary->total_pages,
            'content' => $summary->content,
            'status' => $summary->status,
            'error_message' => $summary->error_message,
            'share_url' => URL::signedRoute('summaries.shared.show', [
                'summary' => $summary,
            ]),
            'share_link_copies_count' => $summary->share_link_copies_count,
            'share_link_visits_count' => $summary->share_link_visits_count,
            'created_at' => $summary->created_at->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentSharedSummary(Summary $summary): array
    {
        return [
            'id' => $summary->id,
            'title' => $summary->title,
            'discipline' => $summary->discipline,
            'topic' => $summary->topic,
            'content' => $summary->content,
            'created_at' => $summary->created_at->toIso8601String(),
        ];
    }
}
