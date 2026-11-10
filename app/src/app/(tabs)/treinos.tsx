import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { exercicio, semCarga } from "../../data/exercicios";
import { diaLocal, diasEntre, kg } from "../../lib/datas";
import { DIAS_DA_FICHA, OBJETIVOS, minutosEstimados, proximoPlano } from "../../lib/ficha";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Botao, Card, Chip, T, Tela, toque } from "../../ui/base";
import { IcSeta } from "../../ui/icones";

export default function Treinos() {
  const ficha = useApp((e) => e.ficha);
  const historico = useApp((e) => e.historico);
  const novaFicha = useApp((e) => e.novaFicha);
  const [confirmar, setConfirmar] = useState(false);
  if (!ficha) return null;

  const restam = DIAS_DA_FICHA - diasEntre(diaLocal(ficha.criadaEm), diaLocal(new Date()));
  const proximo = proximoPlano(ficha, historico);
  const objetivo = OBJETIVOS.find((o) => o.id === ficha.objetivo)?.rotulo;

  return (
    <Tela>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        <T v="titulo" accessibilityRole="header">
          Sua ficha
        </T>
        <Botao tipo="texto" onPress={() => router.push("/biblioteca")} style={{ paddingHorizontal: 0 }}>
          <T peso="media" c={cor.texto}>
            Exercícios
          </T>
        </Botao>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, padding: 14, paddingLeft: 16, borderRadius: 16, backgroundColor: cor.pilulaFundo }}>
        <View style={{ flex: 1 }}>
          <T peso="semi" c={cor.pilulaTexto}>
            {restam > 0 ? `Vence em ${restam} ${restam === 1 ? "dia" : "dias"}.` : "Ficha vencida."}
          </T>
          <T v="meta" c={cor.panicoTexto}>
            {restam > 0 ? `Objetivo: ${objetivo}.` : "Trocou de vida? Troca de ficha."}
          </T>
        </View>
        <Botao tipo="fantasma" style={{ height: 36, paddingHorizontal: 14 }} onPress={() => {
            if (!confirmar) return setConfirmar(true);
            novaFicha();
            setConfirmar(false);
          }}
        >
          <T peso="media" tam={13} c={confirmar ? cor.pilulaTexto : cor.texto}>
            {confirmar ? "Zera as cargas. Confirma?" : "Ficha nova"}
          </T>
        </Botao>
      </View>

      {ficha.planos.map((p) => {
        const hoje = p.letra === proximo.letra;
        return (
          <Card key={p.letra} style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                toque();
                router.push(`/treino/${p.letra}`);
              }}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, backgroundColor: pressed ? cor.elevado : "transparent" })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: hoje ? cor.vermelho : cor.elevado }}>
                <T v="display" tam={24} c={hoje ? "#fff" : cor.texto}>
                  {p.letra}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T peso="semi">{p.nome}</T>
                <T v="meta">
                  {p.itens.length} exercícios · {minutosEstimados(p)} min
                </T>
              </View>
              {hoje ? <Chip positivo>Próximo</Chip> : <IcSeta />}
            </Pressable>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              {p.itens.map((it) => (
                <Pressable
                  key={it.id}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: it.id, letra: p.letra } })}
                  style={{ flexDirection: "row", paddingVertical: 9, borderTopWidth: 1, borderTopColor: cor.linha }}
                >
                  <T tam={14} style={{ flex: 1 }} numberOfLines={1}>
                    {exercicio(it.id).nome}
                  </T>
                  <T tam={13} c={cor.apagado}>
                    {it.series}×{it.reps}
                    {it.id === "Plank" ? " s" : ""} · {semCarga(it.id) ? "corpo" : kg(it.kg)}
                  </T>
                </Pressable>
              ))}
            </View>
          </Card>
        );
      })}

      <T v="sub" style={{ marginTop: 16 }}>
        Treino C é perna. Ninguém pula perna por amor.
      </T>
      <Botao tipo="fantasma" bloco style={{ marginTop: 14 }} onPress={() => router.push("/biblioteca")}>
        Adicionar exercício
      </Botao>
    </Tela>
  );
}
