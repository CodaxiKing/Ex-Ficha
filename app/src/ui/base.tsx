import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, type TextProps, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cor, fonte, margem, raio } from "../theme";
import { IcVoltar } from "./icones";

/** Volta uma tela; se a tela foi aberta direto (link, recarga), vai pro Hoje. */
export function voltar() {
  if (router.canGoBack()) router.back();
  else router.replace("/hoje");
}

export function toque() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

type TProps = TextProps & {
  v?: "corpo" | "sub" | "meta" | "titulo" | "pergunta" | "display" | "gotica";
  peso?: "regular" | "media" | "semi";
  c?: string;
  tam?: number;
};

const VARIANTES = {
  corpo: { fontSize: 15, lineHeight: 21, color: cor.texto },
  sub: { fontSize: 14, lineHeight: 20, color: cor.apagado },
  meta: { fontSize: 12, lineHeight: 17, color: cor.fraco },
  titulo: { fontSize: 20, lineHeight: 25, color: cor.texto, fontFamily: fonte.semi },
  pergunta: { fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: cor.texto, fontFamily: fonte.semi },
  display: { fontFamily: fonte.display, color: cor.texto },
  gotica: { fontFamily: fonte.gotica, color: cor.texto },
} as const;

export function T({ v = "corpo", peso, c, tam, style, ...rest }: TProps) {
  const base = VARIANTES[v];
  const familia = v === "display" || v === "gotica" ? undefined : peso ? fonte[peso] : "fontFamily" in base ? undefined : fonte.regular;
  return (
    <Text
      {...rest}
      style={[
        base,
        familia && { fontFamily: familia },
        c && { color: c },
        tam ? { fontSize: tam, lineHeight: v === "display" || v === "gotica" ? tam * 0.95 : tam * 1.35 } : null,
        { fontVariant: ["tabular-nums"] },
        style,
      ]}
    />
  );
}

type BProps = {
  children: ReactNode;
  onPress?: () => void;
  tipo?: "cheio" | "fantasma" | "texto";
  bloco?: boolean;
  desativado?: boolean;
  style?: ViewStyle;
  rotulo?: string;
};

export function Botao({ children, onPress, tipo = "cheio", bloco, desativado, style, rotulo }: BProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      disabled={desativado}
      onPress={() => {
        toque();
        onPress?.();
      }}
      style={(st) => {
        const { pressed } = st;
        const hovered = (st as { hovered?: boolean }).hovered;
        return [
        s.botao,
        bloco && s.bloco,
        tipo === "cheio" && { backgroundColor: pressed ? cor.vermelhoPress : hovered ? cor.vermelhoHover : cor.vermelho },
        tipo === "fantasma" && { backgroundColor: pressed || hovered ? "#2e2526" : cor.elevado },
        tipo === "texto" && { backgroundColor: "transparent" },
        desativado && { backgroundColor: cor.elevado },
        pressed && tipo !== "texto" && { transform: [{ scale: 0.98 }] },
        style,
      ];
      }}
    >
      {typeof children === "string" ? (
        <T
          peso={tipo === "texto" ? "regular" : "semi"}
          tam={bloco ? 16 : 15}
          c={desativado ? cor.fraco : tipo === "cheio" ? "#ffffff" : tipo === "texto" ? cor.apagado : cor.texto}
        >
          {children}
        </T>
      ) : (
        children
      )}
    </Pressable>
  );
}

/** Tela com área segura e o fundo preto de cinzas. */
export function Tela({
  children,
  rolar = true,
  fundo = cor.chao,
  rodape,
  semTopo,
}: {
  children: ReactNode;
  rolar?: boolean;
  fundo?: string;
  rodape?: ReactNode;
  semTopo?: boolean;
}) {
  return (
    <SafeAreaView edges={semTopo ? ["left", "right"] : ["top", "left", "right"]} style={{ flex: 1, backgroundColor: fundo }}>
      {rolar ? (
        <ScrollView contentContainerStyle={s.conteudo} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[s.conteudo, { flex: 1 }]}>{children}</View>
      )}
      {rodape && <View style={s.rodape}>{rodape}</View>}
    </SafeAreaView>
  );
}

export function Barra({ titulo, direita, voltar: mostrarVoltar = true, onVoltar }: { titulo?: ReactNode; direita?: ReactNode; voltar?: boolean; onVoltar?: () => void }) {
  return (
    <View style={s.barra}>
      {mostrarVoltar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          style={s.icone}
          onPress={() => (onVoltar ? onVoltar() : voltar())}
        >
          <IcVoltar />
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 8 }}>
        {typeof titulo === "string" ? (
          <T v="titulo" tam={17} numberOfLines={1}>
            {titulo}
          </T>
        ) : (
          titulo
        )}
      </View>
      <View style={{ minWidth: 36, alignItems: "flex-end" }}>{direita}</View>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Chip({ children, positivo }: { children: string; positivo?: boolean }) {
  return (
    <View style={[s.chip, positivo && { backgroundColor: cor.pilulaFundo }]}>
      <T tam={12} peso="media" c={positivo ? cor.pilulaTexto : cor.texto}>
        {children}
      </T>
    </View>
  );
}

export function Opcao({ rotulo, marcada, onPress }: { rotulo: string; marcada: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: marcada }}
      onPress={() => {
        toque();
        onPress();
      }}
      style={(st) => [s.opcao, marcada ? { backgroundColor: cor.texto } : (st as { hovered?: boolean }).hovered && { backgroundColor: "#1c1718" }]}
    >
      <T peso={marcada ? "media" : "regular"} c={marcada ? cor.chao : cor.texto} style={{ flex: 1 }}>
        {rotulo}
      </T>
      <View style={[s.ponto, marcada && { borderWidth: 6, borderColor: cor.chao }]} />
    </Pressable>
  );
}

export function Progresso({ total, feitos }: { total: number; feitos: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 6, marginBottom: 26 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < feitos ? cor.texto : cor.elevado }} />
      ))}
    </View>
  );
}

/** Linha com rótulo, valor e botões − e +. */
export function Passo({
  rotulo,
  valor,
  onMenos,
  onMais,
}: {
  rotulo: string;
  valor: string;
  onMenos: () => void;
  onMais: () => void;
}) {
  return (
    <View style={s.passo}>
      <T style={{ flex: 1 }}>{rotulo}</T>
      <T peso="semi" style={{ minWidth: 64, textAlign: "right", marginRight: 12 }}>
        {valor}
      </T>
      {(
        [
          ["−", onMenos, `Diminuir ${rotulo}`],
          ["+", onMais, `Aumentar ${rotulo}`],
        ] as const
      ).map(([sinal, f, r]) => (
        <Pressable
          key={sinal}
          accessibilityRole="button"
          accessibilityLabel={r}
          onPress={() => {
            toque();
            f();
          }}
          style={({ pressed }) => [s.passoBtn, pressed && { backgroundColor: "#2e2526" }]}
        >
          <T peso="semi" tam={18}>
            {sinal}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

export const s = StyleSheet.create({
  conteudo: { paddingHorizontal: margem, paddingTop: 8, paddingBottom: 32, flexGrow: 1, width: "100%", maxWidth: 520, alignSelf: "center" },
  rodape: { paddingHorizontal: margem, paddingTop: 12, paddingBottom: 20, gap: 4, width: "100%", maxWidth: 520, alignSelf: "center" },
  botao: { height: 44, paddingHorizontal: 22, borderRadius: raio.pilula, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  bloco: { alignSelf: "stretch", height: 52 },
  barra: { flexDirection: "row", alignItems: "center", height: 44 },
  icone: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: cor.superficie, borderRadius: raio.card, padding: 18 },
  chip: { height: 22, paddingHorizontal: 9, borderRadius: 999, backgroundColor: cor.elevado, justifyContent: "center", alignSelf: "flex-start" },
  opcao: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: cor.superficie,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ponto: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#5a4e4f" },
  passo: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: cor.linha },
  passoBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: cor.elevado, alignItems: "center", justifyContent: "center", marginLeft: 6 },
});
