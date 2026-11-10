import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EXERCICIOS, GRUPOS } from "../data/exercicios";
import type { Plano } from "../data/tipos";
import { useApp } from "../store";
import { cor, fonte, margem } from "../theme";
import { Barra, Chip, T, toque } from "../ui/base";
import { IcBusca, IcCheck, IcMais } from "../ui/icones";

const semAcento = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function Biblioteca() {
  const ficha = useApp((e) => e.ficha);
  const adicionar = useApp((e) => e.adicionarItem);
  const remover = useApp((e) => e.removerItem);
  // Aberta a partir de um treino (modo de edição): adiciona direto nele.
  const { letra: letraParam } = useLocalSearchParams<{ letra?: string }>();
  const alvo = ficha?.planos.find((p) => p.letra === letraParam) as Plano | undefined;
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<string | null>(null);

  const naFicha = useMemo(() => {
    const m = new Map<string, string[]>();
    ficha?.planos.forEach((p) => p.itens.forEach((it) => m.set(it.id, [...(m.get(it.id) ?? []), p.letra])));
    return m;
  }, [ficha]);

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    EXERCICIOS.forEach((e) => (c[e.grupo] = (c[e.grupo] ?? 0) + 1));
    return c;
  }, []);

  const lista = useMemo(() => {
    const q = semAcento(busca.trim());
    return EXERCICIOS.filter(
      (e) => (!grupo || e.grupo === grupo) && (!q || semAcento(`${e.nome} ${e.principais.join(" ")} ${e.equipamento}`).includes(q))
    );
  }, [busca, grupo]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cor.chao }} edges={["top", "left", "right"]}>
      <View style={{ paddingHorizontal: margem, width: "100%", maxWidth: 520, alignSelf: "center" }}>
        <Barra
          titulo={alvo ? `Adicionar ao treino ${alvo.letra}` : "Exercícios"}
          direita={<T v="meta">{alvo ? `${alvo.itens.length} no treino` : `${EXERCICIOS.length} na base`}</T>}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 46, marginTop: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: cor.superficie }}>
          <IcBusca />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar: remada, supino, terra…"
            placeholderTextColor={cor.fraco}
            accessibilityLabel="Buscar exercício"
            style={{ flex: 1, color: cor.texto, fontFamily: fonte.regular, fontSize: 15, height: 46, outlineStyle: "none" } as object}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -margem }} contentContainerStyle={{ gap: 8, paddingHorizontal: margem }}>
          {GRUPOS.map((g) => {
            const on = grupo === g;
            return (
              <Pressable
                key={g}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  toque();
                  setGrupo(on ? null : g);
                }}
                style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: "center", backgroundColor: on ? cor.texto : cor.superficie }}
              >
                <T tam={13} c={on ? cor.chao : cor.apagado}>
                  {g} {contagem[g] ?? 0}
                </T>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={lista}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: margem, paddingTop: 10, paddingBottom: 40, width: "100%", maxWidth: 520, alignSelf: "center" }}
        ListEmptyComponent={
          <T v="sub" style={{ marginTop: 30, textAlign: "center" }}>
            Nada com esse nome. Tenta “remada” ou “agachamento”.
          </T>
        }
        renderItem={({ item: e }) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: e.id, letra: alvo?.itens.some((it) => it.id === e.id) ? alvo.letra : (naFicha.get(e.id)?.[0] ?? "") } })}
            style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, opacity: pressed ? 0.7 : 1 })}
          >
            <Image source={e.capa} style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: cor.superficie }} accessibilityLabel={e.nome} />
            <View style={{ flex: 1 }}>
              <T peso="media" numberOfLines={1}>
                {e.nome}
              </T>
              <T v="meta" numberOfLines={1}>
                {e.principais.join(", ")} · {e.equipamento}
              </T>
            </View>
          </Pressable>
            {alvo ? (
              (() => {
                const dentro = alvo.itens.some((it) => it.id === e.id);
                const ultimo = dentro && alvo.itens.length <= 1;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={dentro ? `Tirar ${e.nome} do treino ${alvo.letra}` : `Adicionar ${e.nome} ao treino ${alvo.letra}`}
                    disabled={ultimo}
                    hitSlop={6}
                    onPress={() => {
                      toque();
                      if (dentro) remover(alvo.letra, e.id);
                      else adicionar(alvo.letra, e.id);
                    }}
                    style={({ pressed }) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: dentro ? cor.vermelho : pressed ? cor.hover : cor.elevado,
                      opacity: ultimo ? 0.4 : 1,
                    })}
                  >
                    {dentro ? <IcCheck cor="#fff" tamanho={16} /> : <IcMais tamanho={18} />}
                  </Pressable>
                );
              })()
            ) : (
              naFicha.has(e.id) && <Chip>{`Treino ${naFicha.get(e.id)!.join(", ")}`}</Chip>
            )}
          </View>
        )}
        ListFooterComponent={<T v="meta" style={{ marginTop: 12 }}>Animações: ExerciseDB, tratadas no estilo Ex-Ficha.</T>}
      />
    </SafeAreaView>
  );
}
