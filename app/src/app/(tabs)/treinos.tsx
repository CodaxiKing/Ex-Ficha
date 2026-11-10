import { router } from "expo-router";
import { type ReactNode, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { exercicio, semCarga } from "../../data/exercicios";
import type { ItemFicha, Plano, SerieFeita } from "../../data/tipos";
import { diaLocal, diasEntre, kg } from "../../lib/datas";
import { DIAS_DA_FICHA, OBJETIVOS, minutosEstimados, proximoPlano } from "../../lib/ficha";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Botao, Card, Chip, T, Tela, toque } from "../../ui/base";
import { IcFechar, IcMais, IcSeta } from "../../ui/icones";

type Letra = Plano["letra"];

function Seta({ cima }: { cima?: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={cor.apagado} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={cima ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
    </Svg>
  );
}

function BotaoIcone({ rotulo, onPress, desativado, children, perigo }: { rotulo: string; onPress: () => void; desativado?: boolean; children: ReactNode; perigo?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      hitSlop={4}
      onPress={() => {
        toque();
        onPress();
      }}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? cor.hover : perigo ? cor.pilulaFundo : cor.elevado,
        opacity: desativado ? 0.35 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

export default function Treinos() {
  const ficha = useApp((e) => e.ficha);
  const historico = useApp((e) => e.historico);
  const sessao = useApp((e) => e.sessao);
  const novaFicha = useApp((e) => e.novaFicha);
  const remover = useApp((e) => e.removerItem);
  const mover = useApp((e) => e.moverItem);
  const desfazer = useApp((e) => e.desfazerRemocao);
  const premium = useApp((e) => e.premium?.ativo);
  const [confirmar, setConfirmar] = useState(false);
  const [editando, setEditando] = useState(false);
  const [removido, setRemovido] = useState<{ letra: Letra; item: ItemFicha; pos: number; feitas: SerieFeita[] } | null>(null);
  if (!ficha) return null;

  const restam = DIAS_DA_FICHA - diasEntre(diaLocal(ficha.criadaEm), diaLocal(new Date()));
  const proximo = proximoPlano(ficha, historico);
  const objetivo = OBJETIVOS.find((o) => o.id === ficha.objetivo)?.rotulo;

  const tirar = (p: Plano, it: ItemFicha, pos: number) => {
    const feitas = sessao?.letra === p.letra ? (sessao.feitas[pos] ?? []) : [];
    remover(p.letra, it.id);
    setRemovido({ letra: p.letra, item: it, pos, feitas });
  };

  return (
    <Tela
      rodape={
        removido ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, paddingLeft: 16, borderRadius: 16, backgroundColor: cor.elevado }} accessibilityLiveRegion="polite">
            <T style={{ flex: 1 }} numberOfLines={2}>
              {`${exercicio(removido.item.id).nome} saiu do treino ${removido.letra}.`}
            </T>
            <Botao
              tipo="fantasma"
              style={{ height: 36, paddingHorizontal: 14, backgroundColor: cor.superficie }}
              onPress={() => {
                desfazer(removido.letra, removido.item, removido.pos, removido.feitas);
                setRemovido(null);
              }}
            >
              Desfazer
            </Botao>
          </View>
        ) : undefined
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        <T v="titulo" accessibilityRole="header">
          Sua ficha
        </T>
        <Botao
          tipo={editando ? "cheio" : "fantasma"}
          style={{ height: 36, paddingHorizontal: 16 }}
          onPress={() => {
            setEditando((v) => !v);
            setRemovido(null);
          }}
        >
          <T peso="semi" tam={14} c={editando ? "#fff" : cor.texto}>
            {editando ? "Pronto" : "Editar"}
          </T>
        </Botao>
      </View>

      {editando ? (
        <T v="sub" style={{ marginTop: 6 }}>
          Sobe, desce, tira ou adiciona. Diferente de certas relações, aqui você decide o que fica.
        </T>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, padding: 14, paddingLeft: 16, borderRadius: 16, backgroundColor: cor.pilulaFundo }}>
          <View style={{ flex: 1 }}>
            <T peso="semi" c={cor.pilulaTexto}>
              {restam > 0 ? `Vence em ${restam} ${restam === 1 ? "dia" : "dias"}.` : "Ficha vencida."}
            </T>
            <T v="meta" c={cor.panicoTexto}>
              {restam > 0 ? `Objetivo: ${objetivo}.${premium ? " Troca sozinha no fim." : ""}` : "Trocou de vida? Troca de ficha."}
            </T>
          </View>
          <Botao
            tipo="fantasma"
            style={{ height: 36, paddingHorizontal: 14 }}
            onPress={() => {
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
      )}

      {ficha.planos.map((p) => {
        const hoje = p.letra === proximo.letra;
        const emAndamento = sessao?.letra === p.letra;
        return (
          <Card key={p.letra} style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
            <Pressable
              accessibilityRole="button"
              disabled={editando}
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
                  {p.itens.length} {p.itens.length === 1 ? "exercício" : "exercícios"} · {minutosEstimados(p)} min
                </T>
              </View>
              {emAndamento ? <Chip positivo>Em andamento</Chip> : hoje ? <Chip positivo>Próximo</Chip> : editando ? null : <IcSeta />}
            </Pressable>
            <View style={{ paddingHorizontal: 16, paddingBottom: editando ? 12 : 8 }}>
              {p.itens.map((it, i) => {
                const nome = exercicio(it.id).nome;
                const detalhe = `${it.series}×${it.reps}${it.id === "Plank" ? " s" : ""} · ${semCarga(it.id) ? "corpo" : kg(it.kg)}`;
                if (!editando) {
                  return (
                    <Pressable
                      key={it.id}
                      accessibilityRole="button"
                      onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: it.id, letra: p.letra } })}
                      style={{ flexDirection: "row", paddingVertical: 9, borderTopWidth: 1, borderTopColor: cor.linha }}
                    >
                      <T tam={14} style={{ flex: 1 }} numberOfLines={1}>
                        {nome}
                      </T>
                      <T tam={13} c={cor.apagado}>
                        {detalhe}
                      </T>
                    </Pressable>
                  );
                }
                return (
                  <View key={it.id} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, borderTopWidth: 1, borderTopColor: cor.linha }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityHint="Abre os ajustes do exercício"
                      style={{ flex: 1, paddingRight: 4 }}
                      onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: it.id, letra: p.letra } })}
                    >
                      <T tam={14} numberOfLines={1}>
                        {nome}
                      </T>
                      <T v="meta">{detalhe}</T>
                    </Pressable>
                    <BotaoIcone rotulo={`Subir ${nome}`} desativado={i === 0} onPress={() => mover(p.letra, it.id, -1)}>
                      <Seta cima />
                    </BotaoIcone>
                    <BotaoIcone rotulo={`Descer ${nome}`} desativado={i === p.itens.length - 1} onPress={() => mover(p.letra, it.id, 1)}>
                      <Seta />
                    </BotaoIcone>
                    <BotaoIcone rotulo={`Tirar ${nome} do treino ${p.letra}`} perigo desativado={p.itens.length <= 1} onPress={() => tirar(p, it, i)}>
                      <IcFechar tamanho={16} cor={cor.pilulaTexto} />
                    </BotaoIcone>
                  </View>
                );
              })}
              {editando && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    toque();
                    router.push({ pathname: "/biblioteca", params: { letra: p.letra } });
                  }}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    height: 44,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: cor.bordaCampo,
                    backgroundColor: pressed ? cor.elevado : "transparent",
                  })}
                >
                  <IcMais tamanho={16} />
                  <T peso="media" tam={14}>{`Adicionar ao treino ${p.letra}`}</T>
                </Pressable>
              )}
              {editando && p.itens.length <= 1 && (
                <T v="meta" style={{ marginTop: 6 }}>
                  Um treino precisa de pelo menos um exercício.
                </T>
              )}
            </View>
          </Card>
        );
      })}

      {!editando && (
        <>
          <T v="sub" style={{ marginTop: 16 }}>
            Treino C é perna. Ninguém pula perna por amor.
          </T>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toque();
              router.push("/dieta");
            }}
            style={({ pressed }) => ({ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, backgroundColor: pressed ? cor.elevado : cor.superficie })}
          >
            <View style={{ flex: 1 }}>
              <T peso="semi">Dieta de hoje</T>
              <T v="meta">{premium ? "Calorias, proteína e o cardápio do dia" : "Do premium · sem pote de sorvete às 23h"}</T>
            </View>
            <Chip positivo>Sem dó</Chip>
          </Pressable>
        </>
      )}
    </Tela>
  );
}
