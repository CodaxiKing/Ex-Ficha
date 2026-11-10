import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import type { Objetivo } from "../../data/tipos";
import { OBJETIVOS } from "../../lib/ficha";
import { Barra, Botao, Opcao, Progresso, T, Tela } from "../../ui/base";

export default function DefinirObjetivo() {
  const [obj, setObj] = useState<Objetivo>("secar");
  return (
    <Tela
      rodape={
        <Botao bloco onPress={() => router.push({ pathname: "/onboarding/luto", params: { objetivo: obj } })}>
          Continuar
        </Botao>
      }
    >
      <Barra direita={<T v="meta">1 de 2</T>} />
      <Progresso total={2} feitos={1} />
      <T v="pergunta" accessibilityRole="header">
        Pra onde vai essa raiva?
      </T>
      <T v="sub" style={{ marginTop: 8 }}>
        Escolhe um. Dá pra trocar depois, diferente de certas decisões.
      </T>
      <View style={{ gap: 8, marginTop: 22 }} accessibilityRole="radiogroup">
        {OBJETIVOS.map((o) => (
          <Opcao key={o.id} rotulo={o.rotulo} marcada={obj === o.id} onPress={() => setObj(o.id)} />
        ))}
      </View>
    </Tela>
  );
}
