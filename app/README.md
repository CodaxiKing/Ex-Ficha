# Ex-Ficha · app

App em Expo (React Native + TypeScript, Expo Router). Roda no iOS, no Android e no navegador. Os dados ficam só no aparelho (AsyncStorage).

## Rodar
```bash
npm install
npm run web       # navegador
npm start         # QR code para o Expo Go no celular
```

## O que já funciona
- **Onboarding:** splash, três telas com as fotos, objetivo, quem te trocou, há quanto tempo e nível de sofrência.
- **Ficha:** treinos A, B e C montados pelo objetivo (séries, repetições e descanso mudam), vence em 28 dias, "Ficha nova" refaz.
- **Hoje:** dias desde o fim, faixa de dias treinados, sequência, faltas desde que começou a usar e o próximo treino da rotação.
- **Treino em andamento:** série por série com carga e repetições ajustáveis, descanso com contagem regressiva e frase do banco, tela acesa. A última carga usada vira a carga da ficha.
- **Treino concluído:** volume real (séries × reps × carga), sequência e recorde.
- **Botão de pânico:** 20 flexões contadas no toque, placar de crises e mensagens enviadas.
- **Biblioteca:** 42 exercícios com busca e filtro por grupo; tela do exercício com o GIF, passos, ajuste, troca por outro do mesmo grupo e "colocar na ficha".
- **Evolução e Perfil:** volume, recordes pós-término, editar pessoa, data e objetivo, apagar tudo.
- **Banco de frases:** 185 frases em 22 situações, mais as de marco e três níveis (leve, médio, sem dó, escolhido no Perfil). O sorteio não repete as frases vistas recentemente. Marcos nos dias 1, 7, 14, 21, 30, 60, 90, 100, 180 e 365.
- **Lembretes:** bom dia, cobrança às 19h se não treinou, aviso de sexta e sábado à noite e ficha vencendo. Os próximos 7 dias são reagendados a cada abertura e a cada treino.
- **Diário e modo sério:** uma linha por dia com o humor. Três "Morto" seguidos abrem o modo sério (CVV 188, chat, SAMU 192) e pausam a zoeira e as cobranças por 7 dias; dá pra voltar antes no Perfil.
- **Medidas e fotos:** peso com gráfico, cintura, peito, braço e coxa com a diferença desde a primeira medida; fotos da semana guardadas só no aparelho.
- **Conta e backup:** criar conta e entrar por e-mail (Supabase), backup manual e automático a cada treino, restaurar. Sem configurar o Supabase, o app funciona igual e só a tela de conta avisa.

## Configurar a conta (Supabase)
1. Crie um projeto em supabase.com.
2. No SQL Editor, rode `supabase/schema.sql` (tabela `backups` com acesso só ao próprio dono).
3. Copie `.env.example` para `.env` e preencha a URL e a chave publicável do projeto (nunca a `service_role`).
4. Reinicie o `npm start`.

Lembretes, câmera e galeria precisam do app no celular. No Expo Go os lembretes locais funcionam; para publicar, gere um build com o EAS.

## Estrutura
- `src/app/`: as telas (cada arquivo é uma rota).
- `src/store.ts`: estado e regras (perfil, ficha, sessão de treino, histórico, pânico).
- `src/lib/`: ficha, datas e o banco de frases (com os pronomes trocados por ela/ele/essa pessoa).
- `src/ui/`: componentes e ícones; `src/theme.ts`: as cores e fontes do canvas.
- `src/data/exercicios.gen.ts`: gerado por `npm run sync-exercicios` a partir de `../exercicios/dist`.

## Ainda não tem
Entrar com Apple e Google, dieta, liga e X1, Clube dos Trocados, modo superou e o card do Stories. Estão desenhados no canvas.
