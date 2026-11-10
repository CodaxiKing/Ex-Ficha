import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { exercicio, semCarga } from "../../data/exercicios";
import type { Plano } from "../../data/tipos";
import { diaLocal, kg, mmss } from "../../lib/datas";
import { DESCANSO, doDia, frase } from "../../lib/frases";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Barra, Botao, Passo, T, Tela, toque, voltar } from "../../ui/base";
import { IcCheck } from "../../ui/icones";

/** Mantém a tela acesa durante o treino. No navegador o pedido pode ser negado; aí só segue sem. */
function useTelaAcesa() {
  useEffect(() => {
    const tag = "treino";
    let ativo = false;
    activateKeepAwakeAsync(tag)
      .then(() => (ativo = true))
      .catch(() => {});
    return () => {
      if (!ativo) return;
      try {
        deactivateKeepAwake(tag).catch(() => {});
      } catch {
        // o navegador já soltou a trava
      }
    };
  }, []);
}

export default function Treino() {
  useTelaAcesa();
  const { letra } = useLocalSearchParams<{ letra: Plano["letra"] }>();
  const ficha = useApp((e) => e.ficha);
  const perfil = useApp((e) => e.perfil);
  const sessao = useApp((e) => e.sessao);
  const iniciar = useApp((e) => e.iniciarTreino);
  const concluirSerie = useApp((e) => e.concluirSerie);
  const pular = useApp((e) => e.pularDescanso);
  const mais = useApp((e) => e.maisDescanso);
  const irPara = useApp((e) => e.irParaExercicio);
  const finalizar = useApp((e) => e.finalizarTreino);
  const abandonar = useApp((e) => e.abandonarTreino);

  const plano = ficha?.planos.find((p) => p.letra === letra);
  const [agora, setAgora] = useState(() => Date.now());
  const [encerrar, setEncerrar] = useState(false);

  // Outro treino em andamento? Este assume o lugar só quando o usuário começa.
  const ativa = sessao?.letra === letra ? sessao : null;

  const descansoFim = ativa?.descansoAte ? new Date(ativa.descansoAte).getTime() : 0;
  const restante = Math.max(0, (descansoFim - agora) / 1000);
  const descansando = restante > 0;

  useEffect(() => {
    if (!descansoFim) return;
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [descansoFim]);

  // Vibra quando o descanso acaba.
  const avisou = useRef(0);
  useEffect(() => {
    if (descansoFim && !descansando && avisou.current !== descansoFim) {
      avisou.current = descansoFim;
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [descansando, descansoFim]);

  const item = plano && ativa ? plano.itens[ativa.atual] : undefined;
  const feitasAtual = ativa && item ? ativa.feitas[ativa.atual] : [];
  const ultima = feitasAtual.at(-1);
  // Ajuste da série atual. Ao mudar de exercício, os valores voltam para a última série feita (ou para a ficha).
  const [ajuste, setAjuste] = useState<{ id: string; reps: number; kg: number } | null>(null);
  const reps = ajuste && ajuste.id === item?.id ? ajuste.reps : (ultima?.reps ?? item?.reps ?? 10);
  const carga = ajuste && ajuste.id === item?.id ? ajuste.kg : (ultima?.kg ?? item?.kg ?? 0);
  const setReps = (f: (r: number) => number) => item && setAjuste({ id: item.id, reps: f(reps), kg: carga });
  const setCarga = (f: (c: number) => number) => item && setAjuste({ id: item.id, reps, kg: f(carga) });

  if (!plano || !perfil) return null;

  const totalSeries = plano.itens.reduce((s, it) => s + it.series, 0);
  const feitas = ativa ? ativa.feitas.reduce((s, f) => s + f.length, 0) : 0;
  const acabou = !!ativa && plano.itens.every((it, i) => ativa.feitas[i].length >= it.series);
  const exFeitos = ativa ? plano.itens.filter((it, i) => ativa.feitas[i].length >= it.series).length : 0;

  const terminar = () => {
    const t = finalizar();
    if (t) router.replace({ pathname: "/treino/fim", params: { data: t.data } });
    else voltar();
  };

  if (!ativa) {
    const outra = sessao && sessao.letra !== letra;
    return (
      <Tela
        rodape={
          <Botao
            bloco
            onPress={() => {
              if (outra) abandonar();
              iniciar(plano.letra);
            }}
          >
            {outra ? `Largar o treino ${sessao!.letra} e começar este` : "Começar treino"}
          </Botao>
        }
      >
        <Barra titulo={`Treino ${plano.letra} · ${plano.nome}`} />
        <T v="sub" style={{ marginTop: 10 }}>
          {plano.itens.length} exercícios, {totalSeries} séries. A tela fica acesa enquanto você treina.
        </T>
        <View style={{ gap: 8, marginTop: 16 }}>
          {plano.itens.map((it) => {
            const e = exercicio(it.id);
            return (
              <View key={it.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 14, backgroundColor: cor.superficie }}>
                <Image source={e.capa} style={{ width: 44, height: 44, borderRadius: 10 }} accessibilityLabel={e.nome} />
                <View style={{ flex: 1 }}>
                  <T peso="media">{e.nome}</T>
                  <T v="meta">
                    {it.series}×{it.reps}
                    {it.id === "Plank" ? " s" : ""} · {it.descanso} s de descanso
                  </T>
                </View>
                <T tam={14}>{semCarga(it.id) ? "corpo" : kg(it.kg)}</T>
              </View>
            );
          })}
        </View>
      </Tela>
    );
  }

  const e = item ? exercicio(item.id) : undefined;
  const prancha = item?.id === "Plank";

  return (
    <Tela
      rodape={
        acabou ? (
          <Botao bloco onPress={terminar}>
            Finalizar treino
          </Botao>
        ) : descansando ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Botao tipo="fantasma" style={{ flex: 1 }} onPress={() => mais(30)}>
              +30 s
            </Botao>
            <Botao style={{ flex: 2 }} onPress={pular}>
              Pular descanso
            </Botao>
          </View>
        ) : (
          <Botao bloco onPress={() => concluirSerie({ reps, kg: semCarga(item!.id) ? 0 : carga })}>
            Concluir série
          </Botao>
        )
      }
    >
      <Barra
        titulo={`Treino ${plano.letra} · ${plano.nome}`}
        direita={
          <Pressable accessibilityRole="button" onPress={() => setEncerrar((v) => !v)} hitSlop={8}>
            <T peso="media" c={cor.apagado} tam={14}>
              Encerrar
            </T>
          </Pressable>
        }
      />

      {encerrar && (
        <View style={{ marginTop: 8, padding: 14, borderRadius: 16, backgroundColor: cor.panicoFundo, gap: 10 }}>
          <T>{feitas > 0 ? `Salva as ${feitas} séries feitas e encerra?` : "Nenhuma série feita ainda."}</T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {feitas > 0 && (
              <Botao style={{ flex: 1 }} onPress={terminar}>
                Salvar e encerrar
              </Botao>
            )}
            <Botao
              tipo="fantasma"
              style={{ flex: 1 }}
              onPress={() => {
                abandonar();
                voltar();
              }}
            >
              Descartar
            </Botao>
          </View>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: cor.elevado, overflow: "hidden" }}>
          <View style={{ width: `${(feitas / totalSeries) * 100}%`, height: "100%", backgroundColor: cor.vermelho }} />
        </View>
        <T v="meta">
          {exFeitos} de {plano.itens.length}
        </T>
      </View>

      {acabou ? (
        <View style={{ marginTop: 24 }}>
          <T v="gotica" tam={48}>
            Acabou.
          </T>
          <T style={{ marginTop: 8 }}>Todas as {totalSeries} séries feitas. Finaliza pra ver o tamanho do estrago.</T>
        </View>
      ) : descansando ? (
        <View style={{ marginTop: 16 }} accessibilityLiveRegion="polite">
          <T v="meta">Descanso</T>
          <T v="display" tam={88} style={{ lineHeight: 92 }} accessibilityLabel={`${Math.ceil(restante)} segundos de descanso`}>
            {mmss(Math.ceil(restante))}
          </T>
          <T style={{ marginTop: 8 }}>{frase(doDia(DESCANSO, diaLocal(new Date()), feitas), perfil.pessoa)}</T>
          {e && (
            <T v="sub" style={{ marginTop: 10 }}>
              Próxima: {e.nome}, série {feitasAtual.length + 1} de {item!.series}.
            </T>
          )}
        </View>
      ) : (
        e &&
        item && (
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${e.nome}`} onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: e.id, letra: plano.letra } })}>
                <Image source={e.gif} style={{ width: 110, height: 110, borderRadius: 16, backgroundColor: cor.chao }} contentFit="contain" accessibilityLabel={`${e.nome}, em loop`} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <T peso="semi" tam={20} style={{ lineHeight: 25 }}>
                  {e.nome}
                </T>
                <T v="sub" style={{ marginTop: 4 }}>
                  Série {feitasAtual.length + 1} de {item.series}
                </T>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
              {Array.from({ length: item.series }, (_, k) => {
                const f = feitasAtual[k];
                const cur = k === feitasAtual.length;
                return (
                  <View
                    key={k}
                    style={[
                      { flex: 1, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: f ? cor.pilulaFundo : "#1a1516" },
                      cur && { borderWidth: 1.5, borderColor: cor.texto },
                    ]}
                  >
                    <T tam={13} c={f ? cor.pilulaTexto : cor.texto}>
                      {k + 1}ª
                    </T>
                    <T tam={11} c={f ? "#d58a8a" : cor.fraco}>
                      {f ? `${f.reps}${prancha ? " s" : ""}` : cur ? "agora" : "—"}
                    </T>
                  </View>
                );
              })}
            </View>
            <View style={{ marginTop: 8 }}>
              <Passo rotulo={prancha ? "Segundos" : "Repetições"} valor={String(reps)} onMenos={() => setReps((r) => Math.max(1, r - (prancha ? 5 : 1)))} onMais={() => setReps((r) => r + (prancha ? 5 : 1))} />
              {!semCarga(item.id) && <Passo rotulo="Carga" valor={kg(carga)} onMenos={() => setCarga((c) => Math.max(0, c - 2.5))} onMais={() => setCarga((c) => c + 2.5)} />}
            </View>
            <T v="sub" style={{ marginTop: 10 }}>
              {e.dica}
            </T>
          </View>
        )
      )}

      <View style={{ gap: 8, marginTop: 20 }}>
        {plano.itens.map((it, i) => {
          const ex = exercicio(it.id);
          const n = ativa.feitas[i].length;
          const feito = n >= it.series;
          const atual = i === ativa.atual && !acabou;
          return (
            <Pressable
              key={it.id}
              accessibilityRole="button"
              accessibilityState={{ selected: atual }}
              disabled={feito || descansando}
              onPress={() => {
                toque();
                irPara(i);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: atual ? cor.elevado : cor.superficie }}
            >
              <View
                style={[
                  { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: feito ? cor.vermelho : cor.vazio },
                  atual && { backgroundColor: "transparent", borderWidth: 2, borderColor: cor.texto },
                ]}
              >
                {feito && <IcCheck />}
              </View>
              <View style={{ flex: 1 }}>
                <T peso="media" c={feito ? cor.apagado : cor.texto} numberOfLines={1}>
                  {ex.nome}
                </T>
                <T v="meta">
                  {n} de {it.series} séries · {it.reps}
                  {it.id === "Plank" ? " s" : " reps"}
                </T>
              </View>
              <T tam={14}>{semCarga(it.id) ? "corpo" : kg(it.kg)}</T>
            </Pressable>
          );
        })}
      </View>
    </Tela>
  );
}
