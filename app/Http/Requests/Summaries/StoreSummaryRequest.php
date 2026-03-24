<?php

namespace App\Http\Requests\Summaries;

use Illuminate\Foundation\Http\FormRequest;

class StoreSummaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source_document' => ['required', 'file', 'mimes:pdf,docx,txt', 'max:10240'],
            'title' => ['nullable', 'string', 'max:255'],
            'discipline' => ['nullable', 'string', 'max:255'],
            'topic' => ['nullable', 'string', 'max:255'],
            'page_range_start' => ['nullable', 'integer', 'min:1'],
            'page_range_end' => ['nullable', 'integer', 'min:1', 'gte:page_range_start'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'source_document.required' => 'Envie um documento para gerar o resumo.',
            'source_document.mimes' => 'O documento deve estar em PDF, DOCX ou TXT.',
            'source_document.max' => 'O documento deve ter no máximo 10 MB.',
            'page_range_end.gte' => 'A página final deve ser maior ou igual à página inicial.',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator) {
            $start = $this->input('page_range_start');
            $end = $this->input('page_range_end');

            if ($start !== null && $end !== null) {
                $rangeSize = (int) $end - (int) $start + 1;

                if ($rangeSize > 30) {
                    $validator->errors()->add(
                        'page_range_end',
                        'O intervalo de páginas não pode exceder 30 páginas por vez.'
                    );
                }
            }
        });
    }
}
