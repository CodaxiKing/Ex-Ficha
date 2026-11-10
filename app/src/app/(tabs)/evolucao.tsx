import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { exercicio } from "../../data/exercicios";
import { curta, diaLocal, inteiro, kg } from "../../lib/datas";
import { totalSeries, volume } from "../../lib/ficha";
import { frase } from "../../lib/frases";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Card, T, Tela } from "../../ui/base";
import { Anilha, IcSeta } from "../../ui/icones";

function Atalhos() {
  const medidas = useApp((e) => e.medidas);
  const fotos = useApp((e) => e.fotos);
  const ultima = medidas.at(-1);
  const itens = [
    { t: "Medidas", s: ultima?.peso !== undefined ? `${String(ultima.peso).replace(".", ",")} kg em ${curta(ultima.dia)}` : "Peso, cintura, braço…", go: "/medidas" as const },
    { t: "Fotos", s: fotos.length ? `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"} · só você vê` : "O antes e depois", go: "/fotos" as const },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
      {itens.map((i) => (
        <Pressable
          key={i.t}
          accessibilityRole="button"
          onPress={() => router.push(i.go)}
          style={({ pressed }) => ({ flex: 1, padding: 14, borderRadius: 16, backgroundColor: pressed ? cor.elevado : cor.superficie })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <T peso="semi">{i.t}</T>
            <IcSeta />
          </View>
          <T v="meta" numberOfLines={1}>
            {i.s}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

export default function Evolucao() {
  const historico = useApp((e) => e.historico);
  const perfil = useApp((e) => e.perfil);
  const panico = useApp((e) => e.panico);
  if (!perfil) return null;

  const desde = historico.filter((t) => diaLocal(t.data) >= perfil.fim);
  const volTotal = desde.reduce((s, t) => s + volume(t), 0);
  const series = desde.reduce((s, t) => s + totalSeries(t), 0);

  // Recordes: a maior carga de cada exercício, e quando foi.
  const prs = new Map<string, { kg: number; data: string }>();
  for (const t of desde)
    for (const ex of t.series)
      for (const f of ex.feitas)
        if (f.kg > 0 && f.kg > (prs.get(ex.id)?.kg ?? 0)) prs.set(ex.id, { kg: f.kg, data: t.data });
  const listaPrs = [...prs.entries()].sort((a, b) => b[1].kg - a[1].kg).slice(0, 6);

  const ultimos = desde.slice(-12);
  const maxVol = Math.max(1, ...ultimos.map(volume));

  if (desde.length === 0) {
    return (
      <Tela>
        <View style={{ height: 44, justifyContent: "center" }}>
          <T v="titulo" accessibilityRole="header">
            Evolução
          </T>
        </View>
        <Atalhos />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18, paddingVertical: 40 }}>
          <Anilha tamanho={160} />
          <T peso="semi" tam={20} style={{ textAlign: "center" }}>
            Nada aqui ainda.
          </T>
          <T v="sub" style={{ textAlign: "center", maxWidth: 300 }}>
            {frase("Diferente da relação, aqui tudo que você fizer fica registrado. Faz o primeiro treino.", perfil.pessoa)}
          </T>
        </View>
      </Tela>
    );
  }

  return (
    <Tela>
      <View style={{ height: 44, justifyContent: "center" }}>
        <T v="titulo" accessibilityRole="header">
          Evolução
        </T>
      </View>
      <Atalhos />

      <Card style={{ marginTop: 12 }}>
        <T v="sub">Volume desde o fim</T>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <T v="display" tam={48}>
            {inteiro(volTotal)}
          </T>
          <T v="sub">kg levantados</T>
        </View>
        <Svg width="100%" height={90} viewBox={`0 0 ${12 * 24} 90`} preserveAspectRatio="none" style={{ marginTop: 12 }}>
          {ultimos.map((t, i) => {
            const h = Math.max(4, (volume(t) / maxVol) * 86);
            return <Rect key={t.data} x={i * 24 + 4} y={90 - h} width={16} height={h} rx={3} fill={i === ultimos.length - 1 ? cor.vermelho : cor.elevado} />;
          })}
        </Svg>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <T v="meta">{curta(diaLocal(ultimos[0].data))}</T>
          <T v="meta">último treino</T>
        </View>
      </Card>

      <View style={{ flexDirection: "row", marginTop: 12, backgroundColor: cor.superficie, borderRadius: 16 }}>
        {[
          [desde.length, desde.length === 1 ? "treino" : "treinos"],
          [series, "séries"],
          [panico.flexoes, "flexões de pânico"],
        ].map(([v, r], i) => (
          <View key={r as string} style={{ flex: 1, padding: 14, borderLeftWidth: i ? 1 : 0, borderLeftColor: cor.linha }}>
            <T peso="semi" tam={20}>
              {inteiro(v as number)}
            </T>
            <T v="meta">{r as string}</T>
          </View>
        ))}
      </View>

      {listaPrs.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <T peso="semi" tam={16} style={{ marginBottom: 4 }}>
            Recordes pós-término
          </T>
          {listaPrs.map(([id, pr], i) => (
            <View key={id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: cor.linha }}>
              <T tam={14} style={{ flex: 1 }} numberOfLines={1}>
                {exercicio(id).nome}
              </T>
              <View style={{ alignItems: "flex-end" }}>
                <T peso="semi" tam={14}>
                  {kg(pr.kg)}
                </T>
                <T v="meta">{curta(diaLocal(pr.data))}</T>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Tela>
  );
}
