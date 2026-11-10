# Base de exercícios do Ex-Ficha

42 exercícios de academia em português, cada um com um GIF animado no estilo da marca.

## Fonte: ExerciseDB
Os GIFs vêm do [ExerciseDB / AscendAPI](https://github.com/exercisedb/exercisedb-api), versão grátis V1 (`https://oss.exercisedb.dev`, sem chave): ilustrações 3D com os músculos trabalhados em vermelho.

O `build.py` trata cada quadro do GIF:
- o fundo branco vira o preto de cinzas do app (`#0b0909`);
- o corpo e os aparelhos viram cor de osso, com as sombras mais fundas;
- o vermelho dos músculos é puxado para o vermelho da logo (`#d0121a`).

> **Antes de publicar o app:** confirme os [termos de uso do ExerciseDB](https://dub.sh/exercisedb-api-tos). O código deles é AGPL-3.0, e a página não deixava claro se os GIFs podem ser modificados e usados comercialmente. A V1 grátis entrega GIFs de 180 × 180 px; a V2 paga tem resolução maior e vídeos.

## Arquivos
- `curadoria.json`: nome, grupo, passos e uma dica no tom do app, para cada exercício.
- `mapa-exercisedb.json`: o id do ExerciseDB usado para cada exercício. Troque aqui se preferir outra variação.
- `build.py`: gera a base.
- `dist/exercicios.json` e `dist/gifs/<id>.webp` (+ `<id>.jpg`, um quadro para capa): a saída pronta para o app.

## Como rodar
```bash
pip install pillow
python build.py                 # ExerciseDB (padrão)
python build.py --fonte free    # alternativa: free-exercise-db (domínio público, 2 fotos por exercício viram um loop)
```

O GIF sai como WebP animado (funciona no iOS 14+ e no Android), cerca de 90 KB cada a 360 px.

## Para crescer
Adicione o exercício em `curadoria.json` (nome, grupo, dica, passos) e o id correspondente em `mapa-exercisedb.json`. A lista completa dos 1.500 exercícios da V1 é baixada na primeira execução em `fonte-exercisedb/exercises.json`.
