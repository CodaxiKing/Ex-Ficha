import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EXERCICIOS, GRUPOS } from "../data/exercicios";
import { useApp } from "../store";
import { cor, fonte, margem } from "../theme";
import { Barra, Chip, T, toque } from "../ui/base";
import { IcBusca } from "../ui/icones";

const semAcento = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function Biblioteca() {
  const ficha = useApp((e) => e.ficha);
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<string | null>(null);

  const naFicha = useMemo(() => {
    const m = new Map<string, string>();
    ficha?.planos.forEach((p) => p.itens.forEach((it) => m.set(it.id, p.letra)));
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
        <Barra titulo="Exercícios" direita={<T v="meta">{EXERCICIOS.length} na base</T>} />
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: e.id, letra: naFicha.get(e.id) ?? "" } })}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, opacity: pressed ? 0.7 : 1 })}
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
            {naFicha.has(e.id) && <Chip>{`Treino ${naFicha.get(e.id)}`}</Chip>}
          </Pressable>
        )}
        ListFooterComponent={<T v="meta" style={{ marginTop: 12 }}>Animações: ExerciseDB, tratadas no estilo Ex-Ficha.</T>}
      />
    </SafeAreaView>
  );
}
