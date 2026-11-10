import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

import { curta, diaLocal } from "../lib/datas";
import { type Medida, useApp } from "../store";
import { cor, fonte } from "../theme";
import { Barra, Botao, Card, Passo, T, Tela } from "../ui/base";

type Campo = Exclude<keyof Medida, "dia">;
const CAMPOS: { id: Campo; rotulo: string; un: string; passo: number; padrao: number }[] = [
  { id: "peso", rotulo: "Peso", un: "kg", passo: 0.1, padrao: 75 },
  { id: "cintura", rotulo: "Cintura", un: "cm", passo: 0.5, padrao: 85 },
  { id: "peito", rotulo: "Peito", un: "cm", passo: 0.5, padrao: 98 },
  { id: "braco", rotulo: "Braço", un: "cm", passo: 0.5, padrao: 34 },
  { id: "coxa", rotulo: "Coxa", un: "cm", passo: 0.5, padrao: 56 },
];

const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ","));

/** O último valor registrado de cada medida. */
function ultimos(medidas: Medida[]): Partial<Record<Campo, number>> {
  const r: Partial<Record<Campo, number>> = {};
  for (const m of medidas) for (const c of CAMPOS) if (m[c.id] !== undefined) r[c.id] = m[c.id];
  return r;
}

function GraficoPeso({ pontos }: { pontos: { dia: string; v: number }[] }) {
  const W = 314;
  const H = 100;
  const pl = 34;
  const pb = 18;
  const pt = 8;
  const vs = pontos.map((p) => p.v);
  const mn = Math.floor(Math.min(...vs) - 0.5);
  const mx = Math.ceil(Math.max(...vs) + 0.5);
  const x = (i: number) => pl + (pontos.length === 1 ? (W - pl) / 2 : (i * (W - pl - 8)) / (pontos.length - 1));
  const y = (v: number) => pt + ((mx - v) / (mx - mn || 1)) * (H - pt - pb);
  const ult = pontos.length - 1;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} accessibilityLabel={`Peso de ${num(vs[0])} para ${num(vs[ult])} kg`}>
      {[mn, (mn + mx) / 2, mx].map((v) => (
        <Line key={v} x1={pl} x2={W} y1={y(v)} y2={y(v)} stroke={cor.hover} strokeDasharray="2 4" />
      ))}
      {[mn, mx].map((v) => (
        <SvgText key={`t${v}`} x={0} y={y(v) + 4} fill={cor.fraco} fontSize={11} fontFamily={fonte.regular}>
          {num(v)}
        </SvgText>
      ))}
      <SvgText x={pl} y={H - 2} fill={cor.fraco} fontSize={11} fontFamily={fonte.regular}>
        {curta(pontos[0].dia)}
      </SvgText>
      <SvgText x={W} y={H - 2} fill={cor.fraco} fontSize={11} fontFamily={fonte.regular} textAnchor="end">
        {curta(pontos[ult].dia)}
      </SvgText>
      {pontos.length > 1 && <Polyline points={pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")} fill="none" stroke={cor.vermelho} strokeWidth={2} />}
      <Circle cx={x(ult)} cy={y(vs[ult])} r={4} fill={cor.vermelho} />
    </Svg>
  );
}

export default function Medidas() {
  const medidas = useApp((e) => e.medidas);
  const salvar = useApp((e) => e.salvarMedida);
  const sortear = useApp((e) => e.sortear);
  const hoje = diaLocal(new Date());
  const base = ultimos(medidas);
  const [valores, setValores] = useState<Record<Campo, number>>(() => {
    const v = {} as Record<Campo, number>;
    for (const c of CAMPOS) v[c.id] = base[c.id] ?? c.padrao;
    return v;
  });
  const [resposta, setResposta] = useState<string | null>(null);

  const primeiro = medidas[0];
  const pesos = medidas.filter((m) => m.peso !== undefined).map((m) => ({ dia: m.dia, v: m.peso! }));

  return (
    <Tela
      rodape={
        <Botao
          bloco
          onPress={() => {
            salvar({ dia: hoje, ...valores });
            setResposta(sortear("medidas"));
          }}
        >
          {medidas.some((m) => m.dia === hoje) ? "Atualizar as de hoje" : "Salvar medidas de hoje"}
        </Botao>
      }
    >
      <Barra titulo="Medidas" direita={<T v="meta">uma vez por semana</T>} />

      {pesos.length > 0 && (
        <Card style={{ marginTop: 6, padding: 16 }}>
          <T v="sub">Peso</T>
          <T peso="semi" tam={24}>
            {num(pesos.at(-1)!.v)} kg{" "}
            {pesos.length > 1 && (
              <T v="meta">
                {pesos.at(-1)!.v - pesos[0].v <= 0 ? "−" : "+"}
                {num(Math.abs(pesos.at(-1)!.v - pesos[0].v))} kg desde {curta(pesos[0].dia)}
              </T>
            )}
          </T>
          <View style={{ marginTop: 6 }}>
            <GraficoPeso pontos={pesos} />
          </View>
        </Card>
      )}

      {resposta && (
        <View style={{ marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: cor.elevado }} accessibilityLiveRegion="polite">
          <T>{resposta}</T>
        </View>
      )}

      <T peso="semi" tam={16} style={{ marginTop: 20 }}>
        Hoje, {curta(hoje)}
      </T>
      <View style={{ marginTop: 4 }}>
        {CAMPOS.map((c) => {
          const v = valores[c.id];
          const antes = primeiro?.[c.id];
          const dif = antes !== undefined && primeiro.dia !== hoje ? v - antes : null;
          return (
            <View key={c.id}>
              <Passo
                rotulo={c.rotulo}
                valor={`${num(v)} ${c.un}`}
                onMenos={() => setValores((s) => ({ ...s, [c.id]: Math.round((s[c.id] - c.passo) * 10) / 10 }))}
                onMais={() => setValores((s) => ({ ...s, [c.id]: Math.round((s[c.id] + c.passo) * 10) / 10 }))}
              />
              {dif !== null && Math.abs(dif) >= 0.05 && (
                <T v="meta" style={{ marginTop: -6, marginBottom: 6 }}>
                  {dif > 0 ? "+" : "−"}
                  {num(Math.abs(dif))} {c.un} desde {curta(primeiro.dia)}
                </T>
              )}
            </View>
          );
        })}
      </View>
    </Tela>
  );
}
