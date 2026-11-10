import { useState } from "react";

import type { Situacao } from "../lib/banco";
import type { Variaveis } from "../lib/frases";
import { useApp } from "../store";

/**
 * Uma frase sorteada do banco que fica fixa enquanto `chave` não mudar.
 * Ex.: no descanso, a chave é o fim do descanso, então cada descanso tem frase nova.
 */
export function useFrase(sit: Situacao, vars: Variaveis = {}, chave = ""): string {
  const sortear = useApp((e) => e.sortear);
  const [atual, setAtual] = useState(() => ({ chave, texto: sortear(sit, vars) }));
  if (atual.chave !== chave) {
    const texto = sortear(sit, vars);
    setAtual({ chave, texto });
    return texto;
  }
  return atual.texto;
}
