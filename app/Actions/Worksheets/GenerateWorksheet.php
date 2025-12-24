<?php

namespace App\Actions\Worksheets;

use RuntimeException;
use Throwable;
use Illuminate\Support\Facades\Http;

class GenerateWorksheet
{
    public function __construct(private readonly string $model = '')
    {
    }

    /**
     * Build a worksheet draft using the provided request data.
     *
     * @param array<string, mixed> $payload
     */
    public function handle(array $payload): string
    {
        if (function_exists('set_time_limit')) {
            set_time_limit(120);
        }

        $apiKey = config('services.openai.api_key');
        $model = $this->model ?: config('services.openai.model', 'gpt-4o-mini');
        $baseUrl = rtrim(config('services.openai.base_url', 'https://api.openai.com/v1'), '/');
        $payload = $this->normalizePayload($payload);

        if (! $apiKey) {
            return $this->fallback($payload);
        }

        $systemPrompt = 'Você é um professor experiente da educação brasileira e especialista em criação de listas de exercícios didáticas. Gere apenas TEXTO SIMPLES em português do Brasil, sem Markdown, sem JSON e sem emojis. Siga rigorosamente o formato solicitado pelo usuário.';

        return $this->requestContent(
            $baseUrl,
            $apiKey,
            $model,
            $systemPrompt,
            $this->prompt($payload)
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function prompt(array $payload): string
    {
        $exerciseTypes = is_array($payload['exercise_types'] ?? null)
            ? $payload['exercise_types']
            : [];

        $segments = [
            'Você é um professor experiente da educação brasileira.',
            'Crie uma LISTA DE EXERCÍCIOS em português do Brasil (pt-BR).',
            'Retorne APENAS TEXTO SIMPLES.',
            'NÃO use Markdown.',
            'NÃO use JSON.',
            'NÃO use emojis.',
            'Siga EXATAMENTE o formato abaixo.',
            '',
            'Resumo:',
            '- 4 a 7 linhas.',
            '- Cada linha deve iniciar com "- ".',
            '- Cite o tópico, o objetivo, a dificuldade e os tipos de exercícios.',
            '',
            'Questoes:',
            '- Cada questão deve ser numerada como "1. enunciado".',
            '- Não pule numeração.',
            '- Não crie títulos extras.',
            '',
            'Gabarito:',
            '- Cada linha deve ser no formato "1. resposta".',
            '- Use a mesma numeracao das questoes.',
            '- Se houver explicacao, use " - explicacao curta".',
            '',
            'Tipos de questão permitidos:',
            '- multipla_escolha',
            '- verdadeiro_falso',
            '- discursivo',
            '- problemas_praticos',
        ];

        if ($exerciseTypes !== []) {
            $segments[] = '- Use apenas estes tipos: '.$this->formatExerciseTypes($exerciseTypes).'.';
        }

        if (! empty($payload['answer_style']) && is_string($payload['answer_style'])) {
            $segments[] = '- Gabarito: '.$this->formatAnswerStyle($payload['answer_style']).'.';
            if ($payload['answer_style'] === 'explicacao') {
                $segments[] = 'Inclua explicacao curta (1-2 frases) apos " - ".';
                $segments[] = 'Exemplo: 1. resposta - explicacao curta.';
            }

            if ($payload['answer_style'] === 'simples') {
                $segments[] = 'Use apenas a resposta, sem explicacao.';
                $segments[] = 'Exemplo: 1. resposta.';
            }
        }

        if (in_array('verdadeiro_falso', $exerciseTypes, true)) {
            $segments[] = 'verdadeiro_falso: use exatamente o enunciado "(Verdadeiro/Falso) Assinale V para Verdadeiro e F para Falso nas afirmativas:".';
            $segments[] = 'verdadeiro_falso: inclua de 4 a 5 afirmativas.';
            $segments[] = 'verdadeiro_falso: cada afirmativa deve iniciar com "(   ) ".';
            $segments[] = 'verdadeiro_falso: não misture com outros tipos de questão.';
            $segments[] = 'verdadeiro_falso: gabarito no formato "V, F, V, F".';
        }

        if (in_array('multipla_escolha', $exerciseTypes, true)) {
            $segments[] = 'multipla_escolha: 4-5 alternativas "a) ", "b) ", "c) ", "d) " e opcional "e) ".';
            $segments[] = 'multipla_escolha: gabarito apenas a letra.';
        }

        if (in_array('problemas_praticos', $exerciseTypes, true)) {
            $segments[] = 'problemas_praticos: descreva um cenario realista com dados e tarefa clara.';
        }

        if (in_array('discursivo', $exerciseTypes, true)) {
            $segments[] = 'discursivo: peca explicacao e justificativa, com exemplo aplicado.';
        }

        $segments[] = 'Dados:';
        $segments[] = '- Disciplina: '.$payload['discipline'];
        $segments[] = '- Topico: '.$payload['topic'];
        $segments[] = '- Nivel: '.ucfirst($payload['education_level']);
        $segments[] = '- Objetivo: '.$payload['goal'];
        $segments[] = '- Dificuldade: '.$payload['difficulty'];
        $segments[] = '- Quantidade de questoes: '.$payload['question_count'];

        if (! empty($payload['grade_year'])) {
            $segments[] = '- Serie/Ano: '.$payload['grade_year'];
        }

        if (! empty($payload['semester_period'])) {
            $segments[] = '- Semestre/Periodo: '.$payload['semester_period'];
        }

        if (! empty($payload['notes'])) {
            $segments[] = '- Observacoes adicionais: '.$payload['notes'];
        }

        $segments[] = 'Nao inclua nenhum texto fora do formato definido.';

        return implode("\n", $segments);
    }

    private function normalizePayload(array $payload): array
    {
        $questionCount = (int) ($payload['question_count'] ?? 0);

        if ($questionCount <= 0) {
            $questionCount = 1;
        }

        if ($questionCount > 20) {
            $questionCount = 20;
        }

        $payload['question_count'] = $questionCount;

        return $payload;
    }

    private function requestContent(
        string $baseUrl,
        string $apiKey,
        string $model,
        string $systemPrompt,
        string $prompt
    ): string {
        try {
            $response = Http::baseUrl($baseUrl)
                ->withToken($apiKey)
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(50)
                ->retry(1, 200)
                ->post('chat/completions', [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt,
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.4,
                ]);

            $response->throw();
        } catch (Throwable $exception) {
            report($exception);

            throw $exception;
        }

        $content = trim((string) data_get($response->json(), 'choices.0.message.content', ''));

        if ($content === '') {
            throw new RuntimeException('Resposta vazia da API ao gerar a ficha.');
        }

        return $content;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function fallback(array $payload): string
    {
        $exerciseTypes = is_array($payload['exercise_types'] ?? null)
            ? $payload['exercise_types']
            : [];

        $questionCount = (int) $payload['question_count'];
        $types = $exerciseTypes !== [] ? $exerciseTypes : ['discursivo'];
        $exerciseTypesLabel = $exerciseTypes !== []
            ? $this->formatExerciseTypes($exerciseTypes)
            : 'questoes discursivas';
        $answerStyle = is_string($payload['answer_style'] ?? null) ? $payload['answer_style'] : 'simples';
        $answerStyleLabel = $this->formatAnswerStyle($answerStyle);
        $answerStyleLine = str_starts_with($answerStyleLabel, 'com ')
            ? 'Use o gabarito '.$answerStyleLabel.' para comparar suas respostas.'
            : 'Use o gabarito com '.$answerStyleLabel.' para comparar suas respostas.';
        $summary = [
            'Nesta ficha de '.$payload['discipline'].', voce vai revisar '.$payload['topic'].'.',
            'O objetivo e '.$payload['goal'].', com dificuldade '.$payload['difficulty'].' para consolidar o conteudo.',
            'As atividades incluem '.$exerciseTypesLabel.' e exploram aplicacoes do tema.',
            'Ao todo, sao '.$questionCount.' questoes para praticar conceitos e raciocinio.',
            $answerStyleLine,
        ];

        $questions = [];
        $answerKey = [];

        for ($i = 1; $i <= $questionCount; $i++) {
            $type = $types[($i - 1) % count($types)];
            $question = [
                'number' => $i,
                'type' => $type,
                'prompt' => sprintf(
                    'Questao sobre "%s" alinhada ao objetivo de %s.',
                    $payload['topic'],
                    $payload['goal']
                ),
                'options' => null,
                'statements' => null,
            ];

            $answer = 'Resposta aberta.';

            if ($type === 'verdadeiro_falso') {
                $question['prompt'] = '(Verdadeiro/Falso) Assinale V para Verdadeiro e F para Falso nas afirmativas:';
                $question['statements'] = $this->buildTrueFalseStatements($payload['topic'], $payload['discipline']);
                $answer = 'V, V, V, V';
            }

            if ($type === 'multipla_escolha') {
                $question['prompt'] = sprintf(
                    'Assinale a alternativa correta sobre "%s" no contexto de %s.',
                    $payload['topic'],
                    $payload['discipline']
                );
                $question['options'] = $this->buildMultipleChoiceOptions($payload['topic']);
                $answer = 'a';
            }

            if ($type === 'problemas_praticos') {
                $question['prompt'] = sprintf(
                    'Resolva um problema pratico envolvendo "%s": apresente o contexto, os dados e o passo a passo.',
                    $payload['topic']
                );
                $answer = 'Resposta com etapas e justificativa.';
            }

            if ($type === 'discursivo') {
                $question['prompt'] = sprintf(
                    'Explique "%s" e apresente um exemplo aplicado ao objetivo de %s.',
                    $payload['topic'],
                    $payload['goal']
                );
                $answer = 'Explique o conceito e justifique o exemplo.';
            }

            $explanation = null;
            if ($answerStyle === 'explicacao') {
                $explanation = 'Explique brevemente o raciocinio usado para chegar a resposta.';
            }

            $questions[] = $question;
            $answerKey[] = [
                'number' => $i,
                'answer' => $answer,
                'explanation' => $explanation,
            ];
        }

        $lines = [
            'Titulo: Ficha de estudo: '.$payload['topic'],
            'Disciplina: '.$payload['discipline'],
            'Topico: '.$payload['topic'],
            'Nivel: '.$payload['education_level'],
        ];

        if (! empty($payload['grade_year'])) {
            $lines[] = 'Serie/Ano: '.$payload['grade_year'];
        }

        if (! empty($payload['semester_period'])) {
            $lines[] = 'Semestre/Periodo: '.$payload['semester_period'];
        }

        $lines[] = 'Objetivo: '.$payload['goal'];
        $lines[] = 'Dificuldade: '.$payload['difficulty'];
        $lines[] = 'Resumo:';

        foreach ($summary as $line) {
            $lines[] = '- '.$line;
        }

        $lines[] = 'Questoes:';

        foreach ($questions as $question) {
            $number = $question['number'];
            $type = $question['type'];
            $lines[] = $number.'. ('.$type.') '.$question['prompt'];

            if (! empty($question['options']) && is_array($question['options'])) {
                foreach ($question['options'] as $option) {
                    $lines[] = $option;
                }
            }

            if (! empty($question['statements']) && is_array($question['statements'])) {
                foreach ($question['statements'] as $statement) {
                    $lines[] = $statement;
                }
            }
        }

        $lines[] = 'Gabarito:';

        foreach ($answerKey as $item) {
            $line = $item['number'].'. '.$item['answer'];
            if ($item['explanation']) {
                $line .= ' - '.$item['explanation'];
            }
            $lines[] = $line;
        }

        return implode("\n", $lines);
    }

    /**
     * @return array<int, string>
     */
    private function buildTrueFalseStatements(string $topic, string $discipline): array
    {
        return [
            '(   ) '.$topic.' envolve uma ideia central que deve ser aplicada para resolver problemas.',
            '(   ) '.$topic.' pode ser usado para interpretar situacoes do cotidiano em '.$discipline.'.',
            '(   ) Um erro comum e aplicar '.$topic.' sem identificar os dados relevantes.',
            '(   ) Para resolver questoes de '.$topic.', e importante justificar o raciocinio.',
        ];
    }

    /**
     * @return array<int, string>
     */
    private function buildMultipleChoiceOptions(string $topic): array
    {
        return [
            'a) Define '.$topic.' de forma correta e indica quando aplicar.',
            'b) Confunde '.$topic.' com um conceito relacionado.',
            'c) Aplica '.$topic.' fora do contexto adequado.',
            'd) Ignora uma regra fundamental de '.$topic.'.',
        ];
    }

    /**
     * @param array<int, string> $types
     */
    private function formatExerciseTypes(array $types): string
    {
        $labels = [
            'multipla_escolha' => 'Múltipla escolha',
            'discursivo' => 'Discursivo',
            'verdadeiro_falso' => 'Verdadeiro/Falso',
            'problemas_praticos' => 'Problemas práticos',
        ];

        $formattedTypes = array_map(
            fn (string $type): string => $labels[$type] ?? $type,
            $types
        );

        return implode(', ', $formattedTypes);
    }

    private function formatAnswerStyle(string $answerStyle): string
    {
        return match ($answerStyle) {
            'explicacao' => 'com explicações',
            'simples' => 'respostas simples',
            default => $answerStyle,
        };
    }
}
