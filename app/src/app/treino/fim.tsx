import { router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";

import { exercicio } from "../../data/exercicios";
import { comSemana, diaLocal, inteiro, kg, somarDias } from "../../lib/datas";
import { totalSeries, volume } from "../../lib/ficha";
import { FIM, doDia, frase } from "../../lib/frases";
import { diasTreinados, useApp } from "../../store";
import { cor } from "../../theme";
import { Botao, Card, Chip, T, Tela } from "../../ui/base";
import { IcFechar } from "../../ui/icones";

export default function Fim() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const historico = useApp((e) => e.historico);
  const perfil = useApp((e) => e.perfil);
  const t = historico.find((h) => h.data === data) ?? historico.at(-1);
  if (!t || !perfil) return null;

  const dia = diaLocal(t.data);
  const treinados = diasTreinados(historico);
  let seq = 0;
  for (let d = dia; treinados.has(d); d = somarDias(d, -1)) seq++;

  // Série mais pesada do treino e se ela bate o recorde anterior.
  let melhor = { id: "", kg: 0 };
  for (const ex of t.series) for (const f of ex.feitas) if (f.kg > melhor.kg) melhor = { id: ex.id, kg: f.kg };
  const antes = historico.filter((h) => h.data < t.data);
  const prAntes = Math.max(0, ...antes.flatMap((h) => h.series.filter((s) => s.id === melhor.id).flatMap((s) => s.feitas.map((f) => f.kg))));
  const recorde = melhor.kg > 0 && melhor.kg > prAntes;

  const sair = () => router.replace("/hoje");

  return (
    <Tela
      rodape={
        <Botao bloco onPress={sair}>
          Voltar pro início
        </Botao>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", height: 44 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={sair} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <IcFechar />
        </Pressable>
        <T v="meta" style={{ flex: 1, textAlign: "center" }}>
          {comSemana(dia)} · {t.minutos} min
        </T>
        <View style={{ width: 36 }} />
      </View>

      <T v="gotica" tam={64} style={{ marginTop: 20 }} accessibilityRole="header">
        Treino pago.
      </T>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <T v="display" tam={72} style={{ lineHeight: 76 }}>
          {inteiro(volume(t))}
        </T>
        <T v="sub" tam={16}>
          kg levantados hoje
        </T>
      </View>
      <T style={{ marginTop: 10 }}>{frase(doDia(FIM, t.data), perfil.pessoa)}</T>

      <View style={{ flexDirection: "row", marginTop: 20, backgroundColor: cor.superficie, borderRadius: 16 }}>
        {[
          [String(totalSeries(t)), "séries"],
          [`${t.minutos} min`, "de treino"],
          [`${seq} ${seq === 1 ? "dia" : "dias"}`, "seguidos"],
        ].map(([v, r], i) => (
          <View key={r} style={{ flex: 1, padding: 14, borderLeftWidth: i ? 1 : 0, borderLeftColor: cor.linha }}>
            <T peso="semi" tam={20}>
              {v}
            </T>
            <T v="meta">{r}</T>
          </View>
        ))}
      </View>

      {melhor.kg > 0 && (
        <Card style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T v="sub">Série mais pesada</T>
            <T peso="semi">
              {exercicio(melhor.id).nome} · {kg(melhor.kg)}
            </T>
          </View>
          {recorde && <Chip positivo>{antes.length ? "Recorde novo" : "Primeiro recorde"}</Chip>}
        </Card>
      )}
    </Tela>
  );
}
