"""
Gera a base de exercícios do Ex-Ficha a partir do free-exercise-db (domínio público).

Para cada exercício:
  - junta as duas fotos (início e fim do movimento) numa animação em loop (WebP animado),
  - aplica o tratamento da marca (preto de cinzas e cor de osso, sombras mais fundas),
  - traduz a taxonomia (músculos, equipamento, nível...) para português,
  - usa nome, passos e dica em português quando o exercício está em curadoria.json.

Uso:
  python build.py              # só os exercícios da curadoria (rápido)
  python build.py --todos      # os 876 da base (baixa ~1.750 fotos; demora)
  python build.py --largura 360

Saída: dist/exercicios.json e dist/gifs/<id>.webp (+ <id>.jpg, o primeiro quadro, para capa).
"""
import argparse, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE_JSON = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
FONTE_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"

MUSCULOS = {"abdominals": "abdômen", "abductors": "abdutores", "adductors": "adutores", "biceps": "bíceps",
            "calves": "panturrilha", "chest": "peito", "forearms": "antebraço", "glutes": "glúteos",
            "hamstrings": "posterior de coxa", "lats": "dorsal", "lower back": "lombar", "middle back": "meio das costas",
            "neck": "pescoço", "quadriceps": "quadríceps", "shoulders": "ombros", "traps": "trapézio", "triceps": "tríceps"}
GRUPO = {"abdominals": "Core", "abductors": "Pernas", "adductors": "Pernas", "biceps": "Braços", "calves": "Pernas",
         "chest": "Peito", "forearms": "Braços", "glutes": "Pernas", "hamstrings": "Pernas", "lats": "Costas",
         "lower back": "Costas", "middle back": "Costas", "neck": "Ombros", "quadriceps": "Pernas", "shoulders": "Ombros",
         "traps": "Ombros", "triceps": "Braços"}
EQUIP = {"barbell": "barra", "dumbbell": "halteres", "other": "outro", "body only": "peso do corpo", "cable": "polia",
         "machine": "máquina", "kettlebells": "kettlebell", "bands": "elástico", "medicine ball": "medicine ball",
         "exercise ball": "bola suíça", "foam roll": "rolo de espuma", "e-z curl bar": "barra W", None: "nenhum"}
NIVEL = {"beginner": "iniciante", "intermediate": "intermediário", "expert": "avançado"}
FORCA = {"push": "empurrar", "pull": "puxar", "static": "estático", None: None}
MECANICA = {"compound": "multiarticular", "isolation": "isolado", None: None}
TIPO = {"strength": "força", "stretching": "alongamento", "plyometrics": "pliometria", "powerlifting": "powerlifting",
        "olympic weightlifting": "levantamento olímpico", "strongman": "strongman", "cardio": "cárdio"}

# Paleta da marca: o mesmo tratamento das fotos do app
PRETO, MEIO, OSSO = (11, 9, 9), (70, 61, 60), (222, 215, 211)


def baixar(url, destino):
    if os.path.exists(destino) and os.path.getsize(destino) > 0:
        return destino
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "ex-ficha-build/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(destino, "wb") as f:
        f.write(r.read())
    return destino


def tratar(im):
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    g = ImageEnhance.Contrast(g).enhance(1.25)
    g = g.point(lambda v: int(255 * ((v / 255) ** 1.35)))  # sombras mais fundas
    return ImageOps.colorize(g, black=PRETO, mid=MEIO, white=OSSO)


def animar(ex, largura, pasta_cache, pasta_gifs):
    quadros = []
    for i, caminho in enumerate(ex["images"][:2]):
        arq = baixar(FONTE_IMG + caminho, os.path.join(pasta_cache, ex["id"], f"{i}.jpg"))
        im = Image.open(arq).convert("RGB")
        altura = round(largura * im.height / im.width)
        quadros.append(tratar(im.resize((largura, altura), Image.LANCZOS)))
    if len(quadros) < 2:
        quadros.append(quadros[0])
    a, b = quadros
    passos = 6  # transição suave entre início e fim do movimento
    seq, dur = [a], [700]
    seq += [Image.blend(a, b, i / passos) for i in range(1, passos)]; dur += [60] * (passos - 1)
    seq += [b]; dur += [700]
    seq += [Image.blend(b, a, i / passos) for i in range(1, passos)]; dur += [60] * (passos - 1)
    os.makedirs(pasta_gifs, exist_ok=True)
    seq[0].save(os.path.join(pasta_gifs, ex["id"] + ".webp"), save_all=True, append_images=seq[1:],
                duration=dur, loop=0, quality=70, method=6)
    a.save(os.path.join(pasta_gifs, ex["id"] + ".jpg"), quality=78)


def registro(ex, cur):
    c = cur.get(ex["id"])
    principal = ex["primaryMuscles"][0] if ex["primaryMuscles"] else None
    return {
        "id": ex["id"],
        "nome": c["nome"] if c else ex["name"],
        "nome_original": ex["name"],
        "traduzido": bool(c),
        "grupo": c["grupo"] if c else GRUPO.get(principal, "Outros"),
        "musculos_principais": [MUSCULOS.get(m, m) for m in ex["primaryMuscles"]],
        "musculos_secundarios": [MUSCULOS.get(m, m) for m in ex["secondaryMuscles"]],
        "equipamento": EQUIP.get(ex.get("equipment"), ex.get("equipment")),
        "nivel": NIVEL.get(ex.get("level"), ex.get("level")),
        "tipo": TIPO.get(ex.get("category"), ex.get("category")),
        "forca": FORCA.get(ex.get("force")),
        "mecanica": MECANICA.get(ex.get("mechanic")),
        "passos": c["passos"] if c else ex["instructions"],
        "dica": c["dica"] if c else None,
        "gif": f"gifs/{ex['id']}.webp",
        "capa": f"gifs/{ex['id']}.jpg",
        "fonte": "free-exercise-db (domínio público), imagens tratadas pelo Ex-Ficha",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--todos", action="store_true", help="processa os 876 exercícios, não só a curadoria")
    ap.add_argument("--largura", type=int, default=480)
    ap.add_argument("--saida", default=os.path.join(AQUI, "dist"))
    args = ap.parse_args()

    fonte = os.path.join(AQUI, "fonte", "exercises.json")
    baixar(FONTE_JSON, fonte)
    base = json.load(open(fonte, encoding="utf-8"))
    cur = json.load(open(os.path.join(AQUI, "curadoria.json"), encoding="utf-8"))
    faltando = [k for k in cur if k not in {e["id"] for e in base}]
    if faltando:
        sys.exit(f"Curadoria cita ids que não existem na base: {faltando}")

    escolhidos = base if args.todos else [e for e in base if e["id"] in cur]
    pasta_gifs = os.path.join(args.saida, "gifs")
    pasta_cache = os.path.join(AQUI, "fonte", "fotos")
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i, _ in enumerate(pool.map(lambda e: animar(e, args.largura, pasta_cache, pasta_gifs), escolhidos), 1):
            if i % 20 == 0 or i == len(escolhidos):
                print(f"  {i}/{len(escolhidos)} animações")

    saida = [registro(e, cur) for e in escolhidos]
    ordem = ["Peito", "Costas", "Ombros", "Braços", "Pernas", "Core", "Outros"]
    saida.sort(key=lambda r: (not r["traduzido"], ordem.index(r["grupo"]), r["nome"]))
    os.makedirs(args.saida, exist_ok=True)
    with open(os.path.join(args.saida, "exercicios.json"), "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print(f"Pronto: {len(saida)} exercícios ({sum(r['traduzido'] for r in saida)} em português) em {args.saida}")


if __name__ == "__main__":
    main()
