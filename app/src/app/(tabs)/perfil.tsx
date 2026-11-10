import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import type { Pessoa } from "../../data/tipos";
import { curta, diaLocal, diasEntre, somarDias } from "../../lib/datas";
import { OBJETIVOS } from "../../lib/ficha";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Botao, Card, Opcao, Passo, T, Tela } from "../../ui/base";

const PESSOAS: { id: Pessoa; rotulo: string }[] = [
  { id: "Ela", rotulo: "Ela" },
  { id: "Ele", rotulo: "Ele" },
  { id: "Essa pessoa", rotulo: "Prefiro não dizer" },
];

export default function Perfil() {
  const perfil = useApp((e) => e.perfil);
  const atualizar = useApp((e) => e.atualizarPerfil);
  const novaFicha = useApp((e) => e.novaFicha);
  const apagarTudo = useApp((e) => e.apagarTudo);
  const [apagar, setApagar] = useState(false);
  if (!perfil) return null;

  const hoje = diaLocal(new Date());
  const dias = diasEntre(perfil.fim, hoje);

  return (
    <Tela>
      <View style={{ height: 44, justifyContent: "center" }}>
        <T v="titulo" accessibilityRole="header">
          Perfil
        </T>
      </View>

      <T peso="semi" tam={16} style={{ marginTop: 10 }}>
        Quem te trocou
      </T>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        {PESSOAS.map((p) => (
          <Opcao key={p.id} rotulo={p.rotulo} marcada={perfil.pessoa === p.id} onPress={() => atualizar({ pessoa: p.id })} />
        ))}
      </View>

      <T peso="semi" tam={16} style={{ marginTop: 24 }}>
        O dia do fim
      </T>
      <Passo
        rotulo={curta(perfil.fim)}
        valor={`${dias} ${dias === 1 ? "dia" : "dias"}`}
        onMenos={() => dias > 0 && atualizar({ fim: somarDias(perfil.fim, 1) })}
        onMais={() => atualizar({ fim: somarDias(perfil.fim, -1) })}
      />

      <T peso="semi" tam={16} style={{ marginTop: 24 }}>
        Objetivo
      </T>
      <T v="meta" style={{ marginTop: 2 }}>
        Trocar o objetivo monta uma ficha nova.
      </T>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        {OBJETIVOS.map((o) => (
          <Opcao key={o.id} rotulo={o.rotulo} marcada={perfil.objetivo === o.id} onPress={() => perfil.objetivo !== o.id && novaFicha(o.id)} />
        ))}
      </View>

      <Card style={{ marginTop: 28, backgroundColor: cor.panicoFundo }}>
        <T peso="semi">Apagar tudo</T>
        <T v="meta" c={cor.panicoTexto} style={{ marginTop: 2 }}>
          Treinos, ficha e contador. Fica só no seu aparelho, então não tem volta.
        </T>
        <Botao
          tipo="fantasma"
          style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: apagar ? cor.panico : cor.elevado }}
          onPress={() => {
            if (!apagar) return setApagar(true);
            apagarTudo();
            router.replace("/");
          }}
        >
          {apagar ? "Toca de novo pra apagar" : "Apagar meus dados"}
        </Botao>
      </Card>
      <T v="meta" style={{ marginTop: 16 }}>
        Animações: ExerciseDB, tratadas no estilo Ex-Ficha. Fotos: Pexels.
      </T>
    </Tela>
  );
}
