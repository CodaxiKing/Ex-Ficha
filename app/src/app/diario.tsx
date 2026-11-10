import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { curta, diaLocal } from "../lib/datas";
import { HUMORES, type Humor, useApp } from "../store";
import { cor, fonte } from "../theme";
import { Barra, Botao, Chip, T, Tela, toque, voltar } from "../ui/base";

const SIT = { Morto: "diarioMorto", Mal: "diarioMal", Indo: "diarioIndo", Bem: "diarioBem", Bruto: "diarioBruto" } as const;

export default function Diario() {
  const diario = useApp((e) => e.diario);
  const registrar = useApp((e) => e.registrarHumor);
  const sortear = useApp((e) => e.sortear);
  const hoje = diaLocal(new Date());
  const atual = diario.find((e) => e.dia === hoje);
  const [humor, setHumor] = useState<Humor | null>(atual?.humor ?? null);
  const [texto, setTexto] = useState(atual?.texto ?? "");
  const [resposta, setResposta] = useState<string | null>(null);

  const salvar = () => {
    if (!humor) return;
    const entrouNoCalmo = registrar(humor, texto);
    if (entrouNoCalmo) {
      router.replace("/serio");
      return;
    }
    setResposta(sortear(SIT[humor]));
  };

  const anteriores = [...diario].filter((e) => e.dia !== hoje).reverse().slice(0, 14);

  return (
    <Tela
      rodape={
        resposta ? (
          <Botao bloco onPress={voltar}>
            Fechar
          </Botao>
        ) : (
          <Botao bloco desativado={!humor} onPress={salvar}>
            Salvar
          </Botao>
        )
      }
    >
      <Barra titulo="Diário" direita={<T v="meta">uma linha por dia</T>} />
      <T v="pergunta" style={{ marginTop: 10 }} accessibilityRole="header">
        Como você tá hoje?
      </T>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 18 }} accessibilityRole="radiogroup">
        {HUMORES.map((h) => {
          const on = humor === h;
          return (
            <Pressable
              key={h}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => {
                toque();
                setHumor(h);
                setResposta(null);
              }}
              style={{ flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: on ? cor.texto : cor.superficie }}
            >
              <T tam={13} peso={on ? "semi" : "regular"} c={on ? cor.chao : cor.apagado}>
                {h}
              </T>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={texto}
        onChangeText={(t) => {
          setTexto(t);
          setResposta(null);
        }}
        maxLength={120}
        placeholder="Uma linha. Ninguém lê. Nem a gente."
        placeholderTextColor={cor.fraco}
        accessibilityLabel="Uma linha sobre o seu dia"
        style={{
          marginTop: 10,
          minHeight: 52,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: cor.superficie,
          borderWidth: 1,
          borderColor: cor.bordaCampo,
          color: cor.texto,
          fontFamily: fonte.regular,
          fontSize: 15,
        }}
      />

      {resposta ? (
        <View style={{ marginTop: 14, padding: 16, borderRadius: 16, backgroundColor: cor.elevado }} accessibilityLiveRegion="polite">
          <T peso="semi">Anotado.</T>
          <T style={{ marginTop: 4 }}>{resposta}</T>
        </View>
      ) : (
        <T v="sub" style={{ marginTop: 12 }}>
          Se &quot;Morto&quot; aparecer três dias seguidos, a zoeira para e o app te mostra onde pedir ajuda.
        </T>
      )}

      {anteriores.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {anteriores.map((e) => (
            <View key={e.dia} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: cor.linha }}>
              <T v="meta" style={{ width: 48 }}>
                {curta(e.dia)}
              </T>
              <T tam={14} style={{ flex: 1 }} c={e.texto ? cor.texto : cor.fraco} numberOfLines={2}>
                {e.texto || "—"}
              </T>
              <Chip positivo={e.humor === "Bruto"}>{e.humor}</Chip>
            </View>
          ))}
        </View>
      )}
    </Tela>
  );
}
