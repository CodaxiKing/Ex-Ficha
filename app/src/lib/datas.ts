const DIA = 864e5;

/** Data local no formato AAAA-MM-DD. */
export function diaLocal(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${dd}`;
}

function meiaNoite(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d).getTime();
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((meiaNoite(ate) - meiaNoite(de)) / DIA);
}

export function somarDias(dia: string, n: number): string {
  return diaLocal(new Date(meiaNoite(dia) + n * DIA));
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function curta(dia: string): string {
  const [, m, d] = dia.split("-").map(Number);
  return `${d} ${MESES[m - 1]}`;
}

export function comSemana(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return `${SEMANA[new Date(a, m - 1, d).getDay()]}, ${d} ${MESES[m - 1]}`;
}

export function mmss(s: number): string {
  const v = Math.max(0, Math.round(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

export function kg(v: number): string {
  return (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",")) + " kg";
}

export function inteiro(v: number): string {
  return Math.round(v).toLocaleString("pt-BR");
}
