import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";

import { exercicio } from "../../data/exercicios";
import type { Ficha } from "../../data/tipos";
import { comSemana, curta, diaLocal, diasEntre, somarDias } from "../../lib/datas";
import { minutosEstimados, proximoPlano } from "../../lib/ficha";
import { calmo, frase, marco } from "../../lib/frases";
import { diasDesdeOFim, diasTreinados, emCalmo, type Perfil, useApp } from "../../store";
import { cor, faseAtual, raio } from "../../theme";
import { Botao, Card, Chip, T, Tela, toque } from "../../ui/base";
import { VERSAO_TERMOS } from "../../lib/legal";
import { Aceite } from "../../ui/aceite";
import { useFrase } from "../../ui/frase";
import { IcCheck, IcMensagemX, IcSeta } from "../../ui/icones";

export default function Hoje() {
  const perfil = useApp((e) => e.perfil);
  const ficha = useApp((e) => e.ficha);
  const calmoAte = useApp((e) => e.calmoAte);
  if (!perfil || !ficha) return null;
  if ((perfil.consentimento?.versao ?? 0) < VERSAO_TERMOS) return <TermosNovos />;
  return emCalmo(calmoAte) ? <HojeCalmo ate={calmoAte!} /> : <HojeNormal perfil={perfil} ficha={ficha} />;
}

function Linha({ titulo, sub, onPress, fundo = cor.superficie }: { titulo: string; sub: string; onPress: () => void; fundo?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        toque();
        onPress();
      }}
      style={({ pressed }) => ({
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: pressed ? cor.elevado : fundo,
      })}
    >
      <View style={{ flex: 1 }}>
        <T peso="semi">{titulo}</T>
        <T v="meta">{sub}</T>
      </View>
      <IcSeta />
    </Pressable>
  );
}

const SEMANA = ["S", "T", "Q", "Q", "S", "S", "D"];

function saudacao(h: number): string {
  if (h < 5) return "Acordado a essa hora?";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** Segunda-feira da semana de `dia`. */
function segunda(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  const dow = (new Date(a, m - 1, d).getDay() + 6) % 7; // 0 = segunda
  return somarDias(dia, -dow);
}

function Atalho({ titulo, sub, go }: { titulo: string; sub: string; go: "/diario" | "/medidas" | "/fotos" }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        toque();
        router.push(go);
      }}
      style={({ pressed }) => ({ flex: 1, minHeight: 74, padding: 12, borderRadius: 16, justifyContent: "space-between", backgroundColor: pressed ? cor.elevado : cor.superficie })}
    >
      <T peso="semi" tam={14}>
        {titulo}
      </T>
      <T v="meta" numberOfLines={2}>
        {sub}
      </T>
    </Pressable>
  );
}

function HojeNormal({ perfil, ficha }: { perfil: Perfil; ficha: Ficha }) {
  const historico = useApp((e) => e.historico);
  const panico = useApp((e) => e.panico);
  const sessao = useApp((e) => e.sessao);
  const diario = useApp((e) => e.diario);
  const medidas = useApp((e) => e.medidas);
  const fotos = useApp((e) => e.fotos);

  const agora = new Date();
  const hoje = diaLocal(agora);
  const desde = diasDesdeOFim(perfil, hoje);
  const treinados = diasTreinados(historico);
  const totalTreinados = [...treinados].filter((d) => d >= perfil.fim).length;

  let seq = 0;
  for (let d = treinados.has(hoje) ? hoje : somarDias(hoje, -1); treinados.has(d); d = somarDias(d, -1)) seq++;

  const ultimo = historico.at(-1);
  const semTreinar = ultimo ? diasEntre(diaLocal(ultimo.data), hoje) : 0;

  const seg = segunda(hoje);
  const semana = SEMANA.map((l, i) => ({ l, dia: somarDias(seg, i) }));
  const naSemana = semana.filter((s) => treinados.has(s.dia)).length;
  const metaSemana = 3;

  const plano = sessao ? ficha.planos.find((p) => p.letra === sessao.letra)! : proximoPlano(ficha, historico);
  const treinouHoje = treinados.has(hoje);
  const humorHoje = diario.find((e) => e.dia === hoje);
  const primeiraVez = historico.length === 0;
  const grupos = [...new Set(plano.itens.map((it) => exercicio(it.id).grupo))].join(", ");
  const destaque = exercicio(plano.itens[0].id);

  const situacao = treinouHoje ? "hojeTreinou" : semTreinar >= 2 ? "voltou" : "hoje";
  const sorteada = useFrase(situacao, { treino: plano.letra }, `${hoje}-${situacao}`);
  const doMarco = marco(desde, perfil.zoeira);
  const manchete = doMarco ? frase(doMarco, perfil.pessoa) : sorteada;

  const passos = [
    { feito: !primeiraVez, t: "Primeiro treino", s: `Treino ${plano.letra}, ${minutosEstimados(plano)} min`, go: `/treino/${plano.letra}` as const },
    { feito: diario.length > 0, t: "Uma linha no diário", s: "Como você tá, de verdade", go: "/diario" as const },
    { feito: medidas.length > 0, t: "Primeira medida", s: "Pra ter com o que comparar", go: "/medidas" as const },
    { feito: fotos.length > 0, t: "A foto do dia 1", s: "Só você vê", go: "/fotos" as const },
  ];
  const feitos = passos.filter((p) => p.feito).length;

  return (
    <Tela>
      {/* A anilha da marca vaza pela direita, atrás do contador. */}
      <Image
        source={require("../../../assets/images/logo-mark-hd.png")}
        style={{ position: "absolute", top: -30, right: -150, width: 360, height: 360, opacity: faseAtual === 365 ? 0.14 : 0.32 }}
        contentFit="contain"
        accessible={false}
      />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        {faseAtual >= 90 ? (
          <T peso="semi" tam={16}>
            ex-ficha
          </T>
        ) : (
          <T v="gotica" tam={22}>
            Ex-Ficha
          </T>
        )}
        <T v="sub" tam={13}>
          {comSemana(hoje)}
        </T>
      </View>

      <T v="sub" style={{ marginTop: 10 }}>
        {saudacao(agora.getHours())}
        {perfil.apelido ? `, ${perfil.apelido}.` : "."}
      </T>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
        <T v="display" tam={128} style={{ lineHeight: 128 }} accessibilityLabel={`${desde} dias desde o fim`}>
          {desde}
        </T>
        <T v="sub" tam={16} style={{ marginBottom: 18 }}>
          {perfil.pausadoEm ? "dias,\nguardados" : desde === 1 ? "dia\ndesde o fim" : "dias\ndesde o fim"}
        </T>
      </View>
      <T peso="semi" tam={22} style={{ lineHeight: 28, letterSpacing: -0.3, marginTop: 4, maxWidth: 330 }} accessibilityRole="header">
        {manchete}
      </T>
      {perfil.pausadoEm && (
        <Linha titulo="Contador pausado" sub="Acabou de novo? Toca pra voltar dos dias guardados." onPress={() => router.push("/recaida")} fundo={cor.elevado} />
      )}

      {/* Esta semana */}
      <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <T peso="semi" tam={14}>
          Esta semana
        </T>
        <T v="meta">
          {naSemana} de {metaSemana} treinos{seq > 1 ? ` · ${seq} dias seguidos` : ""}
        </T>
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }} accessibilityLabel={`${naSemana} treinos esta semana`}>
        {semana.map(({ l, dia }) => {
          const feito = treinados.has(dia);
          const eHoje = dia === hoje;
          const futuro = dia > hoje;
          return (
            <View key={dia} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <View
                style={[
                  {
                    width: "100%",
                    aspectRatio: 1,
                    maxWidth: 44,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: feito ? cor.vermelho : futuro ? "transparent" : cor.vazio,
                  },
                  futuro && { borderWidth: 1, borderColor: cor.elevado },
                  eHoje && !feito && { borderWidth: 2, borderColor: cor.texto },
                ]}
              >
                {feito ? <IcCheck cor="#fff" /> : null}
              </View>
              <T tam={11} c={eHoje ? cor.texto : cor.fraco} peso={eHoje ? "semi" : "regular"}>
                {l}
              </T>
            </View>
          );
        })}
      </View>

      {/* Treino do dia, com o movimento em loop */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${sessao ? "Continuar" : "Começar"} treino ${plano.letra}`}
        onPress={() => {
          toque();
          router.push(`/treino/${plano.letra}`);
        }}
        style={({ pressed }) => ({ marginTop: 20, borderRadius: raio.card, overflow: "hidden", backgroundColor: cor.superficie, transform: [{ scale: pressed ? 0.99 : 1 }] })}
      >
        <View style={{ flexDirection: "row", alignItems: "stretch" }}>
          <View style={{ flex: 1, padding: 18, paddingRight: 8 }}>
            <Chip positivo>{sessao ? "Em andamento" : treinouHoje ? "Já treinou hoje" : "Treino de hoje"}</Chip>
            <T v="display" tam={44} style={{ lineHeight: 48, marginTop: 10 }}>
              Treino {plano.letra}
            </T>
            <T peso="media" tam={14} numberOfLines={2}>
              {grupos}
            </T>
            <T v="meta" style={{ marginTop: 4 }}>
              {plano.itens.length} exercícios · {minutosEstimados(plano)} min
            </T>
          </View>
          <Image source={destaque.gif} style={{ width: 150, height: 170, backgroundColor: cor.chao }} contentFit="cover" accessibilityLabel={`${destaque.nome}, em loop`} />
        </View>
        <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 18, paddingTop: 14 }}>
          {plano.itens.slice(1, 6).map((it) => (
            <Image
              key={it.id}
              source={exercicio(it.id).capa}
              style={{ flex: 1, aspectRatio: 1, maxWidth: 52, borderRadius: 10, backgroundColor: cor.chao }}
              accessibilityLabel={exercicio(it.id).nome}
            />
          ))}
          {plano.itens.length > 6 && (
            <View style={{ flex: 1, aspectRatio: 1, maxWidth: 52, borderRadius: 10, backgroundColor: cor.elevado, alignItems: "center", justifyContent: "center" }}>
              <T v="meta">+{plano.itens.length - 6}</T>
            </View>
          )}
        </View>
        <View style={{ padding: 18, paddingTop: 14 }}>
          <View style={{ height: 52, borderRadius: 999, backgroundColor: cor.vermelho, alignItems: "center", justifyContent: "center" }}>
            <T peso="semi" tam={16} c="#fff">
              {sessao ? "Continuar treino" : treinouHoje ? "Treinar de novo" : "Começar treino"}
            </T>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          toque();
          router.push("/panico");
        }}
        style={({ pressed }) => ({
          marginTop: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 14,
          paddingLeft: 18,
          paddingRight: 16,
          borderRadius: raio.card,
          backgroundColor: pressed ? cor.pilulaFundo : cor.panicoFundo,
        })}
      >
        <View style={{ flex: 1 }}>
          <T peso="semi">Vou mandar mensagem</T>
          <T v="meta" c={cor.panicoTexto}>
            {panico.crises === 0
              ? "Aperta antes de abrir a conversa"
              : `${panico.crises - panico.enviadas} de ${panico.crises} ${panico.crises === 1 ? "crise vencida" : "crises vencidas"} · ${panico.flexoes} flexões`}
          </T>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cor.panico, alignItems: "center", justifyContent: "center" }}>
          <IcMensagemX />
        </View>
      </Pressable>

      {feitos < passos.length ? (
        <View style={{ marginTop: 22 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <T peso="semi" tam={16}>
              {primeiraVez ? "Suas primeiras vezes" : "Falta pouco"}
            </T>
            <T v="meta">
              {feitos} de {passos.length}
            </T>
          </View>
          <View style={{ marginTop: 8, borderRadius: 16, backgroundColor: cor.superficie, paddingHorizontal: 16 }}>
            {passos.map((p, i) => (
              <Pressable
                key={p.t}
                accessibilityRole="button"
                accessibilityState={{ checked: p.feito }}
                onPress={() => {
                  toque();
                  router.push(p.go);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: cor.linha }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: p.feito ? cor.vermelho : "transparent",
                    borderWidth: p.feito ? 0 : 1.5,
                    borderColor: cor.controle,
                  }}
                >
                  {p.feito && <IcCheck cor="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <T peso="media" c={p.feito ? cor.fraco : cor.texto} style={p.feito ? { textDecorationLine: "line-through" } : undefined}>
                    {p.t}
                  </T>
                  {!p.feito && <T v="meta">{p.s}</T>}
                </View>
                {!p.feito && <IcSeta />}
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", marginTop: 12, backgroundColor: cor.superficie, borderRadius: 16 }}>
          {[
            [totalTreinados, totalTreinados === 1 ? "dia treinado" : "dias treinados"],
            [seq, seq === 1 ? "dia seguido" : "dias seguidos"],
            [panico.crises - panico.enviadas, "crises vencidas"],
          ].map(([v, r], i) => (
            <View key={r as string} style={{ flex: 1, padding: 14, borderLeftWidth: i ? 1 : 0, borderLeftColor: cor.linha }}>
              <T peso="semi" tam={20}>
                {v as number}
              </T>
              <T v="meta">{r as string}</T>
            </View>
          ))}
        </View>
      )}

      {feitos === passos.length && (
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Atalho titulo="Diário" sub={humorHoje ? `Hoje: ${humorHoje.humor}` : "Como você tá?"} go="/diario" />
        <Atalho titulo="Medidas" sub={medidas.length ? curta(medidas.at(-1)!.dia) : "Peso e cintura"} go="/medidas" />
        <Atalho titulo="Fotos" sub={fotos.length ? `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}` : "O antes"} go="/fotos" />
      </View>
      )}
    </Tela>
  );
}

/** Quem já usava o app antes dos termos (ou de uma versão nova deles) aceita aqui. */
function TermosNovos() {
  const aceitar = useApp((e) => e.aceitarTermos);
  const [ok, setOk] = useState(false);
  return (
    <Tela
      rodape={
        <>
          <Aceite marcado={ok} onMudar={setOk} />
          <Botao bloco desativado={!ok} style={{ marginTop: 12 }} onPress={() => aceitar(VERSAO_TERMOS)}>
            Continuar
          </Botao>
          <Botao tipo="texto" onPress={() => router.push("/perfil")}>
            Prefiro não: apagar meus dados
          </Botao>
        </>
      }
    >
      <T v="gotica" tam={56} style={{ marginTop: 28 }} accessibilityRole="header">
        Papelada.
      </T>
      <T tam={17} style={{ marginTop: 10, lineHeight: 25 }}>
        Antes de continuar, a parte chata e importante: os termos de uso e a política de privacidade.
      </T>
      <T v="sub" style={{ marginTop: 12 }}>
        Resumo: seus dados ficam no seu aparelho. Só vão pra nuvem se você criar uma conta, e as fotos nunca saem daqui. Nada de anúncio, nada de vender dado.
      </T>
    </Tela>
  );
}

/** Modo calmo: sem zoeira, sem vermelho, ajuda no topo. Dura até `ate`. */
function HojeCalmo({ ate }: { ate: string }) {
  const hoje = diaLocal(new Date());
  return (
    <Tela>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        <T peso="semi" tam={16}>
          ex-ficha
        </T>
        <Chip>{`Frases pausadas até ${curta(ate)}`}</Chip>
      </View>
      <T peso="semi" tam={30} style={{ marginTop: 22, lineHeight: 36 }} accessibilityRole="header">
        Hoje sem zoeira.
      </T>
      <T tam={16} c={cor.apagado} style={{ marginTop: 10, lineHeight: 23 }}>
        {calmo(hoje)}
      </T>
      <Card style={{ marginTop: 18 }}>
        <T peso="semi" tam={17}>
          Caminhada e alongamento
        </T>
        <T v="meta">20 min · sem carga · se você quiser</T>
      </Card>
      <Linha titulo="CVV · 188" sub="Se apertar, liga. A qualquer hora, de graça." onPress={() => Linking.openURL("tel:188")} />
      <Linha titulo="Como você tá hoje?" sub="Uma linha no diário" onPress={() => router.push("/diario")} />
      <Linha titulo="Treinar mesmo assim" sub="A ficha continua aqui" onPress={() => router.push("/treinos")} />
    </Tela>
  );
}
