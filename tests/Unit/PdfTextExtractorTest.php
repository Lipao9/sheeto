<?php

use App\Support\PdfTextExtractor;
use Illuminate\Http\UploadedFile;

uses(Tests\TestCase::class);

test('returns empty string for empty file', function () {
    $file = UploadedFile::fake()->createWithContent('empty.pdf', '');

    $result = PdfTextExtractor::extract($file);

    expect($result)->toBe('');
});

test('returns empty string for non-pdf content', function () {
    $file = UploadedFile::fake()->createWithContent('fake.pdf', 'this is not a real pdf');

    $result = PdfTextExtractor::extract($file);

    expect($result)->toBe('');
});

test('extracts text from Tj operators in pdf stream', function () {
    $streamContent = "(Hello World) Tj\n(Another line) Tj";
    $pdfContent = "%PDF-1.4\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)
        ->toContain('Hello World')
        ->toContain('Another line');
});

test('extracts text from TJ array operators in pdf stream', function () {
    $streamContent = '[(Hello) -100 (World)] TJ';
    $pdfContent = "%PDF-1.4\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)->toContain('HelloWorld');
});

test('handles pdf escape sequences', function () {
    $streamContent = '(Line one\\nLine two) Tj';
    $pdfContent = "%PDF-1.4\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)->toContain('Line one');
    expect($result)->toContain('Line two');
});

test('extracts text from compressed streams', function () {
    $textContent = '(Compressed text here) Tj';
    $compressed = gzcompress($textContent);

    if ($compressed === false) {
        $this->markTestSkipped('gzcompress not available');
    }

    $pdfContent = "%PDF-1.4\nstream\n{$compressed}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)->toContain('Compressed text here');
});

test('extracts text from multiple streams', function () {
    $stream1 = '(First page) Tj';
    $stream2 = '(Second page) Tj';
    $pdfContent = "%PDF-1.4\nstream\n{$stream1}\nendstream\nstream\n{$stream2}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)
        ->toContain('First page')
        ->toContain('Second page');
});

test('normalizes whitespace in extracted text', function () {
    $streamContent = '(Text   with    spaces) Tj';
    $pdfContent = "%PDF-1.4\nstream\n{$streamContent}\nendstream\n%%EOF";

    $file = UploadedFile::fake()->createWithContent('test.pdf', $pdfContent);

    $result = PdfTextExtractor::extract($file);

    expect($result)->not->toContain('   ');
});
