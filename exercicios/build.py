"""
Gera a base de exercícios do Ex-Ficha.

Fonte padrão: ExerciseDB (AscendAPI), versão grátis V1 (https://oss.exercisedb.dev), que tem GIFs
animados de verdade: ilustrações 3D com os músculos trabalhados em vermelho.
Cada GIF recebe o tratamento da marca:
  - o fundo branco vira o preto de cinzas do app (#0b0909),
  - o corpo e os aparelhos viram cor de osso, com sombras mais fundas,
  - o vermelho dos músculos é puxado para o vermelho da logo (#d0121a).

Fonte alternativa (--fonte free): free-exercise-db (domínio público). Junta as duas fotos de cada
exercício numa animação em loop.

Nome, passos e dica em português vêm de curadoria.json; o id do ExerciseDB de cada exercício
fica em mapa-exercisedb.json.

Uso:
  python build.py                  # ExerciseDB, 42 exercícios da curadoria
  python build.py --fonte free     # free-exercise-db
  python build.py --tamanho 480

Saída: dist/exercicios.json e dist/gifs/<id>.webp (+ <id>.jpg, um quadro para capa).

ATENÇÃO (ExerciseDB): confirme os termos de uso (https://dub.sh/exercisedb-api-tos) antes de
publicar o app. O código deles é AGPL-3.0 e os termos da mídia (GIFs) não estavam claros na página.
"""
import argparse, json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (ex-ficha-build)"}
PRETO, MEIO, OSSO = (11, 9, 9), (70, 61, 60), (222, 215, 211)
CORPO_MEIO, CORPO_OSSO = (96, 88, 86), (214, 206, 202)
VERM_ESC, VERM, VERM_CLARO = (40, 4, 6), (208, 18, 26), (255, 92, 96)

# ---------- traduções ----------
EDB_MUSC = {"abdominals": "abdômen", "ankle stabilizers": "tornozelo", "biceps": "bíceps", "calves": "panturrilha",
            "cardiovascular system": "cárdio", "core": "core", "deltoids": "ombros", "erector spinae": "lombar",
            "forearms": "antebraço", "glutes": "glúteos", "hamstrings": "posterior de coxa", "hip flexors": "flexores do quadril",
            "latissimus dorsi": "dorsal", "pectorals": "peito", "quadriceps": "quadríceps", "rear deltoids": "deltoide posterior",
            "rhomboids": "romboides", "soleus": "sóleo", "trapezius": "trapézio", "triceps": "tríceps", "upper back": "parte alta das costas"}
EDB_EQUIP = {"barbell": "barra", "bodyweight": "peso do corpo", "cable": "polia", "dumbbell": "halteres",
             "leverage machine": "máquina", "rope": "corda", "sled machine": "leg press", "weighted": "anilha"}
FREE_MUSC = {"abdominals": "abdômen", "abductors": "abdutores", "adductors": "adutores", "biceps": "bíceps",
             "calves": "panturrilha", "chest": "peito", "forearms": "antebraço", "glutes": "glúteos",
             "hamstrings": "posterior de coxa", "lats": "dorsal", "lower back": "lombar", "middle back": "meio das costas",
             "neck": "pescoço", "quadriceps": "quadríceps", "shoulders": "ombros", "traps": "trapézio", "triceps": "tríceps"}
FREE_EQUIP = {"barbell": "barra", "dumbbell": "halteres", "other": "outro", "body only": "peso do corpo", "cable": "polia",
              "machine": "máquina", "kettlebells": "kettlebell", "bands": "elástico", "medicine ball": "medicine ball",
              "exercise ball": "bola suíça", "foam roll": "rolo de espuma", "e-z curl bar": "barra W", None: "nenhum"}
NIVEL = {"beginner": "iniciante", "intermediate": "intermediário", "expert": "avançado"}


def baixar(url, destino):
    if os.path.exists(destino) and os.path.getsize(destino) > 0:
        return destino
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    for tentativa in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r, open(destino, "wb") as f:
                f.write(r.read())
            return destino
        except Exception:
            if tentativa == 3:
                raise
            time.sleep(5 * (tentativa + 1))


# ---------- ExerciseDB ----------
def edb_lista(pasta):
    """Baixa (uma vez) a lista dos 1.500 exercícios da V1, página por página."""
    arq = os.path.join(pasta, "exercises.json")
    if os.path.exists(arq):
        return json.load(open(arq, encoding="utf-8"))
    todos, cursor = {}, None
    while True:
        url = "https://oss.exercisedb.dev/api/v1/exercises?limit=25" + (f"&after={cursor}" if cursor else "")
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            d = json.load(r)
        for x in d["data"]:
            todos[x["exerciseId"]] = x
        if not d["meta"].get("hasNextPage"):
            break
        cursor = d["meta"]["nextCursor"]
        time.sleep(1)
    os.makedirs(pasta, exist_ok=True)
    json.dump(list(todos.values()), open(arq, "w", encoding="utf-8"), ensure_ascii=False)
    return list(todos.values())


def edb_quadro(fr, tam):
    rgb = fr.convert("RGB").resize((tam, tam), Image.LANCZOS)
    lum = rgb.convert("L")
    # fundo: branco ligado à borda + brancos quase puros presos entre aparelhos
    branco = lum.point(lambda v: 255 if v >= 238 else 0)
    semente = Image.new("L", (tam + 2, tam + 2), 255); semente.paste(branco, (1, 1))
    ImageDraw.floodfill(semente, (0, 0), 128, thresh=0)
    fundo = semente.crop((1, 1, tam + 1, tam + 1)).point(lambda v: 255 if v == 128 else 0)
    r, g, b = rgb.split()
    sat = ImageChops.subtract(ImageChops.lighter(r, ImageChops.lighter(g, b)), ImageChops.darker(r, ImageChops.darker(g, b)))
    preso = ImageChops.multiply(lum.point(lambda v: 255 if v >= 246 else 0), sat.point(lambda v: 255 if v < 12 else 0))
    fundo = ImageChops.lighter(fundo, preso).filter(ImageFilter.GaussianBlur(0.8))
    # músculos em vermelho
    verm = ImageChops.subtract(r, ImageChops.lighter(g, b)).point(lambda v: 255 if v > 45 else int(v * 255 / 45))
    corpo = ImageOps.colorize(ImageOps.autocontrast(lum, cutoff=1).point(lambda v: int(255 * ((v / 255) ** 1.25))),
                              black=PRETO, mid=CORPO_MEIO, white=CORPO_OSSO)
    musc = ImageOps.colorize(lum, black=VERM_ESC, mid=VERM, white=VERM_CLARO)
    figura = Image.composite(musc, corpo, verm)
    return Image.composite(Image.new("RGB", (tam, tam), PRETO), figura, fundo)


def edb_animar(nosso_id, edb, tam, pasta_cache, pasta_gifs):
    arq = baixar(edb["gifUrl"], os.path.join(pasta_cache, edb["exerciseId"] + ".gif"))
    gif = Image.open(arq)
    quadros, duracoes = [], []
    for i in range(gif.n_frames):
        gif.seek(i)
        quadros.append(edb_quadro(gif, tam))
        duracoes.append(gif.info.get("duration", 100) or 100)
    os.makedirs(pasta_gifs, exist_ok=True)
    quadros[0].save(os.path.join(pasta_gifs, nosso_id + ".webp"), save_all=True, append_images=quadros[1:],
                    duration=duracoes, loop=0, quality=72, method=6)
    quadros[len(quadros) // 2].save(os.path.join(pasta_gifs, nosso_id + ".jpg"), quality=80)


def edb_registro(nosso_id, edb, c):
    return {
        "id": nosso_id, "nome": c["nome"], "nome_original": edb["name"], "traduzido": True, "grupo": c["grupo"],
        "musculos_principais": [EDB_MUSC.get(m, m) for m in edb["targetMuscles"]],
        "musculos_secundarios": [EDB_MUSC.get(m, m) for m in edb["secondaryMuscles"]],
        "equipamento": ", ".join(EDB_EQUIP.get(e, e) for e in edb["equipments"]),
        "passos": c["passos"], "dica": c["dica"],
        "gif": f"gifs/{nosso_id}.webp", "capa": f"gifs/{nosso_id}.jpg",
        "fonte": f"ExerciseDB / AscendAPI ({edb['exerciseId']}), GIF tratado pelo Ex-Ficha",
    }


# ---------- free-exercise-db ----------
def free_tratar(im):
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    g = ImageEnhance.Contrast(g).enhance(1.25).point(lambda v: int(255 * ((v / 255) ** 1.35)))
    return ImageOps.colorize(g, black=PRETO, mid=MEIO, white=OSSO)


def free_animar(ex, largura, pasta_cache, pasta_gifs):
    base = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
    qs = []
    for i, caminho in enumerate(ex["images"][:2]):
        im = Image.open(baixar(base + caminho, os.path.join(pasta_cache, ex["id"], f"{i}.jpg"))).convert("RGB")
        qs.append(free_tratar(im.resize((largura, round(largura * im.height / im.width)), Image.LANCZOS)))
    a, b = (qs + qs)[:2]
    n = 6
    seq = [a] + [Image.blend(a, b, i / n) for i in range(1, n)] + [b] + [Image.blend(b, a, i / n) for i in range(1, n)]
    dur = [700] + [60] * (n - 1) + [700] + [60] * (n - 1)
    os.makedirs(pasta_gifs, exist_ok=True)
    seq[0].save(os.path.join(pasta_gifs, ex["id"] + ".webp"), save_all=True, append_images=seq[1:], duration=dur, loop=0, quality=70, method=6)
    a.save(os.path.join(pasta_gifs, ex["id"] + ".jpg"), quality=78)


def free_registro(ex, c):
    return {
        "id": ex["id"], "nome": c["nome"], "nome_original": ex["name"], "traduzido": True, "grupo": c["grupo"],
        "musculos_principais": [FREE_MUSC.get(m, m) for m in ex["primaryMuscles"]],
        "musculos_secundarios": [FREE_MUSC.get(m, m) for m in ex["secondaryMuscles"]],
        "equipamento": FREE_EQUIP.get(ex.get("equipment"), ex.get("equipment")),
        "nivel": NIVEL.get(ex.get("level"), ex.get("level")),
        "passos": c["passos"], "dica": c["dica"],
        "gif": f"gifs/{ex['id']}.webp", "capa": f"gifs/{ex['id']}.jpg",
        "fonte": "free-exercise-db (domínio público), imagens tratadas pelo Ex-Ficha",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fonte", choices=["exercisedb", "free"], default="exercisedb")
    ap.add_argument("--tamanho", type=int, default=360, help="lado do GIF (ExerciseDB) ou largura (free)")
    ap.add_argument("--saida", default=os.path.join(AQUI, "dist"))
    args = ap.parse_args()

    cur = json.load(open(os.path.join(AQUI, "curadoria.json"), encoding="utf-8"))
    pasta_gifs = os.path.join(args.saida, "gifs")
    if args.fonte == "exercisedb":
        mapa = json.load(open(os.path.join(AQUI, "mapa-exercisedb.json"), encoding="utf-8"))
        edb = {x["exerciseId"]: x for x in edb_lista(os.path.join(AQUI, "fonte-exercisedb"))}
        faltando = [k for k in cur if k not in mapa or mapa[k] not in edb]
        if faltando:
            sys.exit(f"Sem par no ExerciseDB: {faltando}")
        cache = os.path.join(AQUI, "fonte-exercisedb", "gifs")
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda k: edb_animar(k, edb[mapa[k]], args.tamanho, cache, pasta_gifs), cur))
        saida = [edb_registro(k, edb[mapa[k]], cur[k]) for k in cur]
    else:
        fonte = baixar("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json",
                       os.path.join(AQUI, "fonte", "exercises.json"))
        base = {e["id"]: e for e in json.load(open(fonte, encoding="utf-8"))}
        cache = os.path.join(AQUI, "fonte", "fotos")
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(lambda k: free_animar(base[k], args.tamanho, cache, pasta_gifs), cur))
        saida = [free_registro(base[k], cur[k]) for k in cur]

    ordem = ["Peito", "Costas", "Ombros", "Braços", "Pernas", "Core"]
    saida.sort(key=lambda r: (ordem.index(r["grupo"]), r["nome"]))
    os.makedirs(args.saida, exist_ok=True)
    with open(os.path.join(args.saida, "exercicios.json"), "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print(f"Pronto: {len(saida)} exercícios ({args.fonte}) em {args.saida}")


if __name__ == "__main__":
    main()
