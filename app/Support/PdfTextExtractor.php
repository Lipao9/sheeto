<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class PdfTextExtractor
{
    /**
     * Extract text content from a PDF file using local parsing.
     *
     * This is a best-effort extraction that handles PDFs with embedded text
     * (including FlateDecode compressed streams). It does not handle scanned/image-only PDFs.
     */
    public static function extract(UploadedFile $file): string
    {
        $content = file_get_contents($file->getRealPath());

        if (! is_string($content) || $content === '') {
            return '';
        }

        $text = self::extractFromStreams($content);

        return self::normalizeExtractedText($text);
    }

    private static function extractFromStreams(string $pdfContent): string
    {
        $chunks = [];

        if (preg_match_all('/stream\r?\n(.+?)\r?\nendstream/s', $pdfContent, $matches) === false) {
            return '';
        }

        foreach ($matches[1] as $stream) {
            $decoded = @gzuncompress($stream);

            if ($decoded === false) {
                $decoded = @gzinflate($stream);
            }

            if ($decoded === false) {
                $decoded = $stream;
            }

            $text = self::extractTextFromOperators($decoded);

            if ($text !== '') {
                $chunks[] = $text;
            }
        }

        return implode("\n", $chunks);
    }

    private static function extractTextFromOperators(string $content): string
    {
        $text = '';

        if (preg_match_all('/\(([^)]*)\)\s*Tj/s', $content, $tjMatches)) {
            foreach ($tjMatches[1] as $match) {
                $text .= self::decodePdfString($match).' ';
            }
        }

        if (preg_match_all('/\[(.*?)\]\s*TJ/s', $content, $tjArrayMatches)) {
            foreach ($tjArrayMatches[1] as $tjContent) {
                if (preg_match_all('/\(([^)]*)\)/', $tjContent, $innerMatches)) {
                    foreach ($innerMatches[1] as $inner) {
                        $text .= self::decodePdfString($inner);
                    }
                }

                $text .= ' ';
            }
        }

        return trim($text);
    }

    private static function decodePdfString(string $str): string
    {
        $str = str_replace(
            ['\\n', '\\r', '\\t', '\\(', '\\)', '\\\\'],
            ["\n", "\r", "\t", '(', ')', '\\'],
            $str
        );

        return (string) preg_replace_callback('/\\\\(\d{1,3})/', function (array $matches): string {
            return chr((int) octdec($matches[1]));
        }, $str);
    }

    private static function normalizeExtractedText(string $text): string
    {
        $text = (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $text);
        $text = (string) preg_replace('/[ \t]+/', ' ', $text);
        $text = (string) preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }
}
