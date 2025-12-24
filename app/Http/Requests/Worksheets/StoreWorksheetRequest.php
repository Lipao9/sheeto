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
            'education_level' => ['required', 'string', 'in:escola,faculdade,pos-graduacao,mestrado,doutorado,outro'],
            'discipline' => ['required', 'string', 'max:255'],
            'topic' => ['required', 'string', 'max:255'],
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
}
