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

## Estrutura
- `src/app/`: as telas (cada arquivo é uma rota).
- `src/store.ts`: estado e regras (perfil, ficha, sessão de treino, histórico, pânico).
- `src/lib/`: ficha, datas e o banco de frases (com os pronomes trocados por ela/ele/essa pessoa).
- `src/ui/`: componentes e ícones; `src/theme.ts`: as cores e fontes do canvas.
- `src/data/exercicios.gen.ts`: gerado por `npm run sync-exercicios` a partir de `../exercicios/dist`.

## Ainda não tem
Login e conta, dieta, modo sério, liga e X1, fotos e medidas, notificações, modo superou. Estão desenhados no canvas.
