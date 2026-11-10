// Gera docs/privacidade.md e docs/termos.md a partir de src/lib/legal.ts (a mesma fonte do app).
// Uso: npm run legal. Publique os .md num link (ex.: GitHub Pages) e use esse link nas lojas.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PRIVACIDADE, TERMOS, VIGENCIA, type Secao } from "../src/lib/legal.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const md = (titulo: string, secoes: Secao[]) =>
  `# ${titulo} do Ex-Ficha\n\nVale desde ${VIGENCIA}.\n\n` +
  secoes.map((s) => `## ${s.titulo}\n\n${s.paragrafos.join("\n\n")}\n`).join("\n");

mkdirSync(join(raiz, "docs"), { recursive: true });
writeFileSync(join(raiz, "docs", "privacidade.md"), md("Política de privacidade", PRIVACIDADE));
writeFileSync(join(raiz, "docs", "termos.md"), md("Termos de uso", TERMOS));
console.log("docs/privacidade.md e docs/termos.md gerados");
