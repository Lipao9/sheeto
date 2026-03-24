<?php

use App\Actions\Summaries\PrepareDocumentForSummary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

test('falls back to local text extraction when ai returns no_text for pdf', function () {
    config()->set('services.openai.api_key', 'fake-key');

    $streamContent = '(Conteudo do slide sobre escalonamento do cuidado em saude) Tj';
    $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Page>>endobj\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('aula.pdf', $pdfContent);

    Http::fake([
        '*/files' => Http::response(['id' => 'file-123']),
        '*/responses' => Http::response([
            'output' => [
                [
                    'content' => [
                        ['text' => "STATUS: no_text\nDISCIPLINE: \nTOPIC: \nREFERENCE_MATERIAL:\n"],
                    ],
                ],
            ],
        ]),
        '*/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => "STATUS: ok\nDISCIPLINE: Saude\nTOPIC: Escalonamento do cuidado"]],
            ],
        ]),
        '*/files/file-123' => Http::response([], 200),
    ]);

    $action = new PrepareDocumentForSummary;
    $result = $action->handle($file);

    expect($result)
        ->toHaveKey('discipline')
        ->toHaveKey('topic')
        ->toHaveKey('reference_material')
        ->and($result['reference_material'])->toContain('escalonamento do cuidado em saude')
        ->and($result['status'])->toBe('ok');
});

test('falls back to local text extraction when ai returns empty reference material', function () {
    config()->set('services.openai.api_key', 'fake-key');

    $streamContent = '(Texto relevante sobre biologia celular) Tj';
    $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Page>>endobj\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('biologia.pdf', $pdfContent);

    Http::fake([
        '*/files' => Http::response(['id' => 'file-456']),
        '*/responses' => Http::response([
            'output' => [
                [
                    'content' => [
                        ['text' => "STATUS: ok\nDISCIPLINE: Biologia\nTOPIC: Celula\nREFERENCE_MATERIAL:\n"],
                    ],
                ],
            ],
        ]),
        '*/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => "STATUS: ok\nDISCIPLINE: Biologia\nTOPIC: Biologia Celular"]],
            ],
        ]),
        '*/files/file-456' => Http::response([], 200),
    ]);

    $action = new PrepareDocumentForSummary;
    $result = $action->handle($file);

    expect($result['reference_material'])->toContain('biologia celular');
});

test('throws exception when both ai and local extraction fail for pdf', function () {
    config()->set('services.openai.api_key', 'fake-key');

    $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Page>>endobj\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('empty.pdf', $pdfContent);

    Http::fake([
        '*/files' => Http::response(['id' => 'file-789']),
        '*/responses' => Http::response([
            'output' => [
                [
                    'content' => [
                        ['text' => "STATUS: no_text\nDISCIPLINE: \nTOPIC: \nREFERENCE_MATERIAL:\n"],
                    ],
                ],
            ],
        ]),
        '*/files/file-789' => Http::response([], 200),
    ]);

    $action = new PrepareDocumentForSummary;
    $action->handle($file);
})->throws(ValidationException::class);

test('improved prompt includes instructions for diverse document types', function () {
    config()->set('services.openai.api_key', 'fake-key');

    $streamContent = '(Teste de conteudo para verificar prompt) Tj';
    $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Page>>endobj\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('slides.pdf', $pdfContent);

    Http::fake([
        '*/files' => Http::response(['id' => 'file-prompt']),
        '*/responses' => Http::response([
            'output' => [
                [
                    'content' => [
                        ['text' => "STATUS: ok\nDISCIPLINE: Teste\nTOPIC: Verificacao\nREFERENCE_MATERIAL:\nConteudo extraido com sucesso."],
                    ],
                ],
            ],
        ]),
        '*/files/file-prompt' => Http::response([], 200),
    ]);

    $action = new PrepareDocumentForSummary;
    $action->handle($file);

    $recorded = Http::recorded();
    $responsesRequest = collect($recorded)->first(fn ($pair) => str_contains($pair[0]->url(), 'responses'));

    expect($responsesRequest)->not->toBeNull();

    $systemContent = data_get($responsesRequest[0]->data(), 'input.0.content.0.text', '');
    $userContent = data_get($responsesRequest[0]->data(), 'input.1.content.0.text', '');

    expect($systemContent)->toContain('apresentações, slides, tabelas');
    expect($userContent)
        ->toContain('bullet points')
        ->toContain('tabelas')
        ->toContain('2500 palavras');
});
