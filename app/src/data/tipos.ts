export type Grupo = "Peito" | "Costas" | "Ombros" | "Braços" | "Pernas" | "Core";

export type Exercicio = {
  id: string;
  nome: string;
  grupo: Grupo | string;
  principais: string[];
  secundarios: string[];
  equipamento: string;
  passos: string[];
  dica: string;
  gif: number; // require() do asset
  capa: number;
};

export type Objetivo = "massa" | "secar" | "forca" | "sobreviver";
export type Pessoa = "Ela" | "Ele" | "Essa pessoa";

/** Um exercício dentro de um treino da ficha. */
export type ItemFicha = { id: string; series: number; reps: number; kg: number; descanso: number };

export type Plano = { letra: "A" | "B" | "C"; nome: string; itens: ItemFicha[] };

export type Ficha = { criadaEm: string; objetivo: Objetivo; planos: Plano[] };

/** Uma série registrada durante o treino. */
export type SerieFeita = { reps: number; kg: number };

export type TreinoFeito = {
  data: string; // ISO
  letra: Plano["letra"];
  nome: string;
  minutos: number;
  series: { id: string; feitas: SerieFeita[] }[];
};

export type Sessao = {
  letra: Plano["letra"];
  inicio: string; // ISO
  atual: number; // índice do exercício
  feitas: SerieFeita[][]; // por exercício
  descansoAte: string | null; // ISO
};
