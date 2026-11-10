# Base de exercícios do Ex-Ficha

Gerada a partir do [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (domínio público, Unlicense: pode usar, modificar e vender sem pedir permissão).

## O que o `build.py` faz
- Junta as duas fotos de cada exercício (início e fim do movimento) numa **animação em loop** (WebP animado, ~120 KB a 480 px).
- Aplica o **tratamento da marca**: preto de cinzas e cor de osso, sombras mais fundas, igual às fotos do app.
- Traduz músculos, equipamento, nível, tipo e mecânica para português.
- Para os exercícios em `curadoria.json`, usa **nome, passos e dica em português** no tom do app.

## Como rodar
```bash
pip install pillow
python build.py            # 42 exercícios da curadoria
python build.py --todos    # os 876 da base (baixa ~1.750 fotos)
```

Saída em `dist/`:
- `exercicios.json`: um registro por exercício (`nome`, `grupo`, `musculos_principais`, `equipamento`, `nivel`, `passos`, `dica`, `gif`, `capa`...).
- `gifs/<id>.webp`: a animação. `gifs/<id>.jpg`: o primeiro quadro, para capa e carregamento.

## Para crescer
- Exercícios fora da curadoria saem com `traduzido: false`, ou seja, com nome e passos em inglês. Para traduzir, adicione o id em `curadoria.json` com `nome`, `grupo`, `dica` e `passos`.
- WebP animado funciona no iOS 14+ e no Android. Se precisar de GIF de verdade, o mesmo código gera, mas os arquivos ficam cerca de 7 vezes maiores.
