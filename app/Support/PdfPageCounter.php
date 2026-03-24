<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class PdfPageCounter
{
    public static function estimate(UploadedFile $file): ?int
    {
        $content = file_get_contents($file->getRealPath());

        if (! is_string($content) || $content === '') {
            return null;
        }

        $matches = preg_match_all('/\/Type\s*\/Page\b/', $content, $results);

        if (! is_int($matches) || $matches <= 0) {
            return null;
        }

        return $matches;
    }
}
