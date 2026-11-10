import { Image } from "expo-image";
import { router } from "expo-router";
import { Linking, Pressable, View } from "react-native";

import { exercicio, semCarga } from "../../data/exercicios";
import type { Ficha } from "../../data/tipos";
import { comSemana, curta, diaLocal, diasEntre, kg, somarDias } from "../../lib/datas";
import { minutosEstimados, proximoPlano } from "../../lib/ficha";
import { calmo, marco } from "../../lib/frases";
import { diasTreinados, emCalmo, type Perfil, useApp } from "../../store";
import { cor, raio } from "../../theme";
import { Botao, Card, Chip, T, Tela, toque } from "../../ui/base";
import { useFrase } from "../../ui/frase";
import { IcMensagemX, IcSeta } from "../../ui/icones";

/** Quantos dias a faixa mostra. */
const FAIXA = 28;

export default function Hoje() {
  const perfil = useApp((e) => e.perfil);
  const ficha = useApp((e) => e.ficha);
  const calmoAte = useApp((e) => e.calmoAte);
  if (!perfil || !ficha) return null;
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

function HojeNormal({ perfil, ficha }: { perfil: Perfil; ficha: Ficha }) {
  const historico = useApp((e) => e.historico);
  const panico = useApp((e) => e.panico);
  const sessao = useApp((e) => e.sessao);
  const diario = useApp((e) => e.diario);

  const hoje = diaLocal(new Date());
  const desde = diasEntre(perfil.fim, hoje);
  const treinados = diasTreinados(historico);
  const totalTreinados = [...treinados].filter((d) => d >= perfil.fim).length;
  // Faltas: dias sem treino desde que começou a usar o app, até ontem (hoje ainda dá tempo).
  const contaDe = perfil.inicio && perfil.inicio > perfil.fim ? perfil.inicio : perfil.fim;
  const faltas = diasEntre(contaDe, hoje) - [...treinados].filter((d) => d >= contaDe && d < hoje).length;

  // Sequência: dias seguidos com treino, contando até ontem (hoje ainda pode treinar).
  let seq = 0;
  for (let d = treinados.has(hoje) ? hoje : somarDias(hoje, -1); treinados.has(d); d = somarDias(d, -1)) seq++;

  // Último treino: se faz dois dias ou mais, a frase é de volta.
  const ultimo = historico.at(-1);
  const semTreinar = ultimo ? diasEntre(diaLocal(ultimo.data), hoje) : 0;

  const n = Math.min(FAIXA, desde + 1);
  const faixa = Array.from({ length: n }, (_, i) => somarDias(hoje, i - n + 1));

  const plano = sessao ? ficha.planos.find((p) => p.letra === sessao.letra)! : proximoPlano(ficha, historico);
  const treinouHoje = treinados.has(hoje);
  const humorHoje = diario.find((e) => e.dia === hoje);

  const situacao = treinouHoje ? "hojeTreinou" : semTreinar >= 2 ? "voltou" : "hoje";
  const sorteada = useFrase(situacao, { treino: plano.letra }, `${hoje}-${situacao}`);
  const texto = marco(desde, perfil.zoeira) ?? sorteada;

  return (
    <Tela>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image source={require("../../../assets/images/logo-mark.png")} style={{ width: 26, height: 26 }} accessibilityLabel="Ex-Ficha" />
          <T v="gotica" tam={22}>
            Ex-Ficha
          </T>
        </View>
        <T v="sub" tam={13}>
          {comSemana(hoje)}
        </T>
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <T v="display" tam={112} style={{ lineHeight: 112 }} accessibilityLabel={`${desde} dias desde o fim`}>
            {desde}
          </T>
          <T v="sub" tam={15} style={{ marginTop: 4 }}>
            {desde === 1 ? "dia desde o fim" : "dias desde o fim"}
          </T>
        </View>
        <View style={{ alignItems: "flex-end", paddingBottom: 4 }}>
          <T peso="semi" tam={24}>
            {totalTreinados}
          </T>
          <T v="meta">{totalTreinados === 1 ? "dia treinado" : "dias treinados"}</T>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 3, marginTop: 14 }} accessibilityLabel={`${totalTreinados} de ${desde} dias treinados`}>
        {faixa.map((d) => (
          <View
            key={d}
            style={[
              { flex: 1, height: 22, borderRadius: 3, backgroundColor: treinados.has(d) ? cor.vermelho : cor.vazio },
              d === hoje && { borderWidth: 1.5, borderColor: cor.texto },
            ]}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <T v="meta">{faixa[0] === perfil.fim ? `${curta(perfil.fim)} · acabou` : curta(faixa[0])}</T>
        <T v="meta">hoje</T>
      </View>

      <T style={{ marginTop: 14 }}>
        {seq > 0 ? (
          <T peso="semi">
            {seq} {seq === 1 ? "dia seguido." : "dias seguidos."}{" "}
          </T>
        ) : null}
        {faltas > 0 && `${faltas} ${faltas === 1 ? "falta" : "faltas"} desde que você chegou. `}
        {texto}
      </T>

      <Card style={{ marginTop: 18, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T peso="semi" tam={17}>
              Treino {plano.letra} · {plano.nome}
            </T>
            <T v="meta">
              {plano.itens.length} exercícios · {minutosEstimados(plano)} min
            </T>
          </View>
          <Chip positivo>{sessao ? "Em andamento" : treinouHoje ? "Já treinou hoje" : "Ficha nova"}</Chip>
        </View>
        <View>
          {plano.itens.slice(0, 3).map((it) => (
            <View key={it.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 1, borderTopColor: cor.linha }}>
              <T tam={13} style={{ flex: 1 }} numberOfLines={1}>
                {exercicio(it.id).nome}
              </T>
              <T tam={13} c={cor.apagado}>
                {it.series}×{it.reps} · {semCarga(it.id) ? "corpo" : kg(it.kg)}
              </T>
            </View>
          ))}
        </View>
        <Botao bloco onPress={() => router.push(`/treino/${plano.letra}`)}>
          {sessao ? "Continuar treino" : "Começar treino"}
        </Botao>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          toque();
          router.push("/panico");
        }}
        style={({ pressed }) => ({
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 14,
          paddingLeft: 18,
          paddingRight: 16,
          borderRadius: raio.card,
          backgroundColor: pressed ? "#26100f" : cor.panicoFundo,
        })}
      >
        <View style={{ flex: 1 }}>
          <T peso="semi">Vou mandar mensagem</T>
          <T v="meta" c={cor.panicoTexto}>
            {panico.crises === 0
              ? "Aperta antes de abrir a conversa"
              : `Usado ${panico.crises} ${panico.crises === 1 ? "vez" : "vezes"} · ${panico.enviadas} ${panico.enviadas === 1 ? "mensagem enviada" : "mensagens enviadas"}`}
          </T>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cor.panico, alignItems: "center", justifyContent: "center" }}>
          <IcMensagemX />
        </View>
      </Pressable>

      <Linha
        titulo={humorHoje ? `Hoje: ${humorHoje.humor}` : "Como você tá hoje?"}
        sub={humorHoje ? humorHoje.texto || "Toca pra mudar" : "Uma linha no diário"}
        onPress={() => router.push("/diario")}
      />
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
