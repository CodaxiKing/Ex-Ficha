// Copia a base gerada em ../exercicios/dist para dentro do app e gera o mapa de require()
// (o Metro só empacota imagens com require estático).
// Uso: npm run sync-exercicios
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(app, "..", "exercicios", "dist");
const out = join(app, "assets", "exercicios");

const lista = JSON.parse(readFileSync(join(dist, "exercicios.json"), "utf8"));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const linhas = [];
for (const e of lista) {
  copyFileSync(join(dist, e.gif), join(out, `${e.id}.webp`));
  copyFileSync(join(dist, e.capa), join(out, `${e.id}.jpg`));
  const dados = {
    id: e.id,
    nome: e.nome,
    grupo: e.grupo,
    principais: e.musculos_principais,
    secundarios: e.musculos_secundarios,
    equipamento: e.equipamento,
    passos: e.passos,
    dica: e.dica,
  };
  linhas.push(
    `  { ...${JSON.stringify(dados)}, gif: require("../../assets/exercicios/${e.id}.webp"), capa: require("../../assets/exercicios/${e.id}.jpg") },`
  );
}

const ts = `// Gerado por scripts/sync-exercicios.mjs a partir de exercicios/dist. Não edite à mão.
import type { Exercicio } from "./tipos";

export const EXERCICIOS: Exercicio[] = [
${linhas.join("\n")}
];
`;
writeFileSync(join(app, "src", "data", "exercicios.gen.ts"), ts);
console.log(`${lista.length} exercícios copiados para assets/exercicios`);
