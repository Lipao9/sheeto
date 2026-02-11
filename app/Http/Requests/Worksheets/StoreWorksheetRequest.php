<?php

namespace App\Http\Requests\Worksheets;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorksheetRequest extends FormRequest
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
            'creation_mode' => ['required', 'string', 'in:form,document'],
            'source_document' => [
                'nullable',
                'file',
                'required_if:creation_mode,document',
                'mimes:pdf,docx,txt',
                'max:10240',
            ],
            'education_level' => ['required', 'string', 'in:escola,faculdade,pos-graduacao,mestrado,doutorado,outro'],
            'discipline' => ['nullable', 'string', 'max:255', 'required_if:creation_mode,form'],
            'topic' => ['nullable', 'string', 'max:255', 'required_if:creation_mode,form'],
            'difficulty' => ['required', 'string', 'in:iniciante,intermediario,avancado'],
            'goal' => ['required', 'string', 'in:prova,revisao,aprendizado'],
            'question_count' => ['required', 'integer', 'min:1', 'max:20'],
            'exercise_types' => ['required', 'array', 'min:1'],
            'exercise_types.*' => ['string', 'in:multipla_escolha,discursivo,verdadeiro_falso,problemas_praticos'],
            'answer_style' => ['required', 'string', 'in:simples,explicacao'],
            'grade_year' => ['nullable', 'string', 'max:255', 'required_if:education_level,escola'],
            'semester_period' => ['nullable', 'string', 'max:255', 'required_if:education_level,faculdade,pos-graduacao'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'source_document.required_if' => 'Envie um documento para gerar a ficha.',
            'source_document.mimes' => 'O documento deve estar em PDF, DOCX ou TXT.',
            'source_document.max' => 'O documento deve ter no máximo 10 MB.',
            'discipline.required_if' => 'A disciplina é obrigatória no modo formulário.',
            'topic.required_if' => 'O tópico é obrigatório no modo formulário.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('creation_mode')) {
            $this->merge([
                'creation_mode' => 'form',
            ]);
        }
    }
}
