<?php

namespace App\Jobs;

use App\Actions\Summaries\GenerateSummary;
use App\Actions\Summaries\PrepareDocumentForSummary;
use App\Models\Summary;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessSummary implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public int $tries = 1;

    /**
     * @param  array<string, mixed>  $options
     */
    public function __construct(
        public int $summaryId,
        public string $storedFilePath,
        public string $originalFileName,
        public array $options = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(PrepareDocumentForSummary $prepareDocument, GenerateSummary $generateSummary): void
    {
        $summary = Summary::find($this->summaryId);

        if ($summary === null || ! $summary->isProcessing()) {
            $this->cleanup();

            return;
        }

        try {
            $filePath = Storage::disk('local')->path($this->storedFilePath);

            $uploadedFile = new UploadedFile(
                $filePath,
                $this->originalFileName,
                null,
                null,
                true
            );

            $pageRangeStart = isset($this->options['page_range_start']) ? (int) $this->options['page_range_start'] : null;
            $pageRangeEnd = isset($this->options['page_range_end']) ? (int) $this->options['page_range_end'] : null;

            $documentContext = $prepareDocument->handle($uploadedFile, $pageRangeStart, $pageRangeEnd);

            $discipline = trim((string) ($this->options['discipline'] ?? ''));

            if ($discipline === '') {
                $discipline = $documentContext['discipline'] ?? 'Interdisciplinar';
            }

            $topic = trim((string) ($this->options['topic'] ?? ''));

            if ($topic === '') {
                $topic = $documentContext['topic'] ?? 'Estudo guiado pelo documento';
            }

            $content = $generateSummary->handle([
                'discipline' => $discipline,
                'topic' => $topic,
                'reference_material' => $documentContext['reference_material'] ?? '',
                'notes' => $this->options['notes'] ?? null,
            ]);

            $title = trim((string) ($this->options['title'] ?? ''));

            if ($title === '') {
                $title = $this->extractTitleFromContent($content, $topic);
            }

            $summary->update([
                'title' => $title,
                'discipline' => $discipline,
                'topic' => $topic,
                'total_pages' => $documentContext['total_pages'] ?? null,
                'content' => $content,
                'status' => Summary::STATUS_COMPLETED,
                'error_message' => null,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            $summary->update([
                'status' => Summary::STATUS_FAILED,
                'error_message' => 'Não foi possível gerar o resumo. Tente novamente.',
            ]);
        } finally {
            $this->cleanup();
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        $summary = Summary::find($this->summaryId);

        if ($summary !== null && $summary->isProcessing()) {
            $summary->update([
                'status' => Summary::STATUS_FAILED,
                'error_message' => 'Não foi possível gerar o resumo. Tente novamente.',
            ]);
        }

        $this->cleanup();
    }

    private function cleanup(): void
    {
        Storage::disk('local')->delete($this->storedFilePath);
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
