<?php

namespace App\Http\Controllers;

use App\Actions\Summaries\GenerateSummary;
use App\Actions\Summaries\PrepareDocumentForSummary;
use App\Http\Requests\Summaries\StoreSummaryRequest;
use App\Models\Summary;
use App\Support\PdfPageCounter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\URL;
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
        $summaryId = $request->integer('summary');

        $summary = $request->user()
            ->summaries()
            ->when($summaryId, fn ($query) => $query->whereKey($summaryId))
            ->latest()
            ->first();

        if ($summaryId && ! $summary) {
            abort(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('summaries/index', [
            'summary' => $summary ? $this->presentSummary($summary) : null,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('summaries/create');
    }

    public function store(
        StoreSummaryRequest $request,
        PrepareDocumentForSummary $prepareDocument,
        GenerateSummary $generateSummary
    ): RedirectResponse {
        $validated = $request->validated();
        $sourceDocument = $request->file('source_document');

        if ($sourceDocument === null) {
            throw ValidationException::withMessages([
                'source_document' => 'Envie um documento para gerar o resumo.',
            ]);
        }

        $pageRangeStart = isset($validated['page_range_start']) ? (int) $validated['page_range_start'] : null;
        $pageRangeEnd = isset($validated['page_range_end']) ? (int) $validated['page_range_end'] : null;

        $documentContext = $prepareDocument->handle($sourceDocument, $pageRangeStart, $pageRangeEnd);

        $discipline = trim((string) ($validated['discipline'] ?? ''));

        if ($discipline === '') {
            $discipline = $documentContext['discipline'] ?? 'Interdisciplinar';
        }

        $topic = trim((string) ($validated['topic'] ?? ''));

        if ($topic === '') {
            $topic = $documentContext['topic'] ?? 'Estudo guiado pelo documento';
        }

        $content = $generateSummary->handle([
            'discipline' => $discipline,
            'topic' => $topic,
            'reference_material' => $documentContext['reference_material'] ?? '',
            'notes' => $validated['notes'] ?? null,
        ]);

        $title = trim((string) ($validated['title'] ?? ''));

        if ($title === '') {
            $title = $this->extractTitleFromContent($content, $topic);
        }

        $summary = $request->user()->summaries()->create([
            'title' => $title,
            'discipline' => $discipline,
            'topic' => $topic,
            'source_file_name' => $sourceDocument->getClientOriginalName(),
            'page_range_start' => $pageRangeStart,
            'page_range_end' => $pageRangeEnd,
            'total_pages' => $documentContext['total_pages'] ?? null,
            'content' => $content,
        ]);

        return to_route('summaries.index', ['summary' => $summary->id]);
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

        return to_route('summaries.index', ['summary' => $summary->id]);
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

    private function extractTitleFromContent(string $content, string $fallbackTopic): string
    {
        if (preg_match('/^Titulo\s+do\s+Resumo\s*:\s*(.+)$/mi', $content, $matches) === 1) {
            $extracted = trim((string) ($matches[1] ?? ''));

            if ($extracted !== '') {
                return $extracted;
            }
        }

        return 'Resumo: '.$fallbackTopic;
    }
}
