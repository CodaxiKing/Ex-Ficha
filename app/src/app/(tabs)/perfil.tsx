import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";

import type { Pessoa } from "../../data/tipos";
import { avisosDisponiveis, pedirPermissao } from "../../lib/avisos";
import type { Nivel } from "../../lib/banco";
import { curta, diaLocal, diasEntre, somarDias } from "../../lib/datas";
import { OBJETIVOS } from "../../lib/ficha";
import { frase } from "../../lib/frases";
import { emCalmo, useApp } from "../../store";
import { cor, fonte } from "../../theme";
import { Botao, Card, Opcao, Passo, T, Tela, toque } from "../../ui/base";
import { IcSeta } from "../../ui/icones";

const PESSOAS: { id: Pessoa; rotulo: string }[] = [
  { id: "Ela", rotulo: "Ela" },
  { id: "Ele", rotulo: "Ele" },
  { id: "Essa pessoa", rotulo: "Prefiro não dizer" },
];

const NIVEIS: { id: Nivel; rotulo: string; exemplo: string }[] = [
  { id: "L", rotulo: "Leve", exemplo: "“Bom dia. O dia é seu.”" },
  { id: "M", rotulo: "Médio", exemplo: "“Descanso. Não é pra abrir o Instagram {dela}.”" },
  { id: "S", rotulo: "Sem dó", exemplo: "“Ninguém lá está pensando em você. Próxima série.”" },
];

function Titulo({ children }: { children: string }) {
  return (
    <T peso="semi" tam={16} style={{ marginTop: 26 }}>
      {children}
    </T>
  );
}

function Item({ titulo, sub, onPress }: { titulo: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        toque();
        onPress();
      }}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, marginTop: 8, backgroundColor: pressed ? cor.elevado : cor.superficie })}
    >
      <View style={{ flex: 1 }}>
        <T peso="semi">{titulo}</T>
        <T v="meta">{sub}</T>
      </View>
      <IcSeta />
    </Pressable>
  );
}

export default function Perfil() {
  const perfil = useApp((e) => e.perfil);
  const calmoAte = useApp((e) => e.calmoAte);
  const ultimoBackup = useApp((e) => e.ultimoBackup);
  const atualizar = useApp((e) => e.atualizarPerfil);
  const premium = useApp((e) => e.premium?.ativo);
  const novaFicha = useApp((e) => e.novaFicha);
  const sairDoCalmo = useApp((e) => e.sairDoCalmo);
  const apagarTudo = useApp((e) => e.apagarTudo);
  const [apagar, setApagar] = useState(false);
  const [semPermissao, setSemPermissao] = useState(false);
  if (!perfil) return null;

  const hoje = diaLocal(new Date());
  const dias = diasEntre(perfil.fim, hoje);
  const calmo = emCalmo(calmoAte);

  const ligarAvisos = async (ativos: boolean) => {
    if (ativos) {
      const ok = await pedirPermissao();
      setSemPermissao(!ok);
      if (!ok) return;
    }
    atualizar({ avisos: { ...perfil.avisos, ativos } });
  };

  return (
    <Tela>
      <View style={{ height: 44, justifyContent: "center" }}>
        <T v="titulo" accessibilityRole="header">
          Perfil
        </T>
      </View>

      {calmo && (
        <Card style={{ marginTop: 6 }}>
          <T peso="semi">Zoeira pausada até {curta(calmoAte!)}</T>
          <T v="meta" style={{ marginTop: 2 }}>
            Você marcou &quot;Morto&quot; três dias seguidos. Volta quando quiser.
          </T>
          <Botao tipo="fantasma" style={{ marginTop: 12, alignSelf: "flex-start" }} onPress={sairDoCalmo}>
            Tô melhor, pode voltar
          </Botao>
        </Card>
      )}

      <Item titulo={premium ? "Premium · Sem dó" : "Seja Sem dó"} sub={premium ? "Ativo. O app pega pesado." : "Dieta, frases pesadas, ficha que troca sozinha"} onPress={() => router.push("/premium")} />
      <Item titulo="Diário" sub="Uma linha por dia" onPress={() => router.push("/diario")} />
      <Item titulo="Conquistas" sub="O que ficou pra trás" onPress={() => router.push("/conquistas")} />
      <Item
        titulo="Conta e backup"
        sub={ultimoBackup ? `Último backup: ${curta(diaLocal(ultimoBackup))}` : "Guarda seus treinos na nuvem"}
        onPress={() => router.push("/conta")}
      />
      <Item
        titulo={perfil.pausadoEm ? "Contador pausado" : frase("Voltei com {ela}", perfil.pessoa)}
        sub={perfil.pausadoEm ? "Acabou de novo? Volta dos dias guardados" : "Sem julgamento. A gente só pausa o contador"}
        onPress={() => router.push("/recaida")}
      />

      <Titulo>Visual</Titulo>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <T>Clareia com o tempo</T>
          <T v="meta">No dia 30 o preto esquenta, no 90 vira cinza, com um ano fica claro.</T>
        </View>
        <Switch
          value={!perfil.visualFixo}
          onValueChange={(v) => atualizar({ visualFixo: !v })}
          trackColor={{ true: cor.vermelho, false: cor.elevado }}
          thumbColor={cor.texto}
          accessibilityLabel="Visual clareia com o tempo"
        />
      </View>

      <Titulo>Como o app te chama</Titulo>
      <TextInput
        value={perfil.apelido ?? ""}
        onChangeText={(t) => atualizar({ apelido: t.slice(0, 20) || undefined })}
        placeholder="Bruto, Monstro, seu nome…"
        placeholderTextColor={cor.fraco}
        accessibilityLabel="Apelido"
        style={{
          marginTop: 10,
          height: 52,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: cor.superficie,
          borderWidth: 1,
          borderColor: cor.bordaCampo,
          color: cor.texto,
          fontFamily: fonte.regular,
          fontSize: 15,
        }}
      />

      <Titulo>Nível da zoeira</Titulo>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        {NIVEIS.map((n) => (
          <Pressable
            key={n.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: perfil.zoeira === n.id }}
            onPress={() => {
              toque();
              if (n.id === "S" && !premium) return router.push("/premium");
              atualizar({ zoeira: n.id });
            }}
            style={{ padding: 14, paddingHorizontal: 18, borderRadius: 16, backgroundColor: perfil.zoeira === n.id ? cor.texto : cor.superficie }}
          >
            <T peso={perfil.zoeira === n.id ? "semi" : "regular"} c={perfil.zoeira === n.id ? cor.chao : cor.texto}>
              {n.rotulo}
              {n.id === "S" && !premium ? " · premium" : ""}
            </T>
            <T tam={13} c={perfil.zoeira === n.id ? cor.apagado : cor.fraco}>
              {frase(n.exemplo, perfil.pessoa)}
            </T>
          </Pressable>
        ))}
      </View>

      <Titulo>Lembretes</Titulo>
      {avisosDisponiveis ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <T>Bom dia, cobrança e avisos</T>
              <T v="meta">Frases sorteadas, sem repetir. Nada no modo calmo.</T>
            </View>
            <Switch
              value={perfil.avisos.ativos}
              onValueChange={ligarAvisos}
              trackColor={{ true: cor.vermelho, false: cor.elevado }}
              thumbColor={cor.texto}
              accessibilityLabel="Lembretes"
            />
          </View>
          {semPermissao && (
            <T v="meta" c={cor.pilulaTexto} style={{ marginTop: 6 }}>
              Sem permissão de notificação. Libera nos ajustes do celular.
            </T>
          )}
          {perfil.avisos.ativos && (
            <Passo
              rotulo="Bom dia às"
              valor={`${perfil.avisos.hora}h`}
              onMenos={() => atualizar({ avisos: { ...perfil.avisos, hora: Math.max(5, perfil.avisos.hora - 1) } })}
              onMais={() => atualizar({ avisos: { ...perfil.avisos, hora: Math.min(11, perfil.avisos.hora + 1) } })}
            />
          )}
        </>
      ) : (
        <T v="meta" style={{ marginTop: 6 }}>
          Lembretes só funcionam no app do celular.
        </T>
      )}

      <Titulo>Quem te trocou</Titulo>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        {PESSOAS.map((p) => (
          <Opcao key={p.id} rotulo={p.rotulo} marcada={perfil.pessoa === p.id} onPress={() => atualizar({ pessoa: p.id })} />
        ))}
      </View>

      <Titulo>O dia do fim</Titulo>
      <Passo
        rotulo={curta(perfil.fim)}
        valor={`${dias} ${dias === 1 ? "dia" : "dias"}`}
        onMenos={() => dias > 0 && atualizar({ fim: somarDias(perfil.fim, 1) })}
        onMais={() => atualizar({ fim: somarDias(perfil.fim, -1) })}
      />

      <Titulo>Objetivo</Titulo>
      <T v="meta" style={{ marginTop: 2 }}>
        Trocar o objetivo monta uma ficha nova.
      </T>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        {OBJETIVOS.map((o) => (
          <Opcao key={o.id} rotulo={o.rotulo} marcada={perfil.objetivo === o.id} onPress={() => perfil.objetivo !== o.id && novaFicha(o.id)} />
        ))}
      </View>

      <Card style={{ marginTop: 28, backgroundColor: cor.panicoFundo }}>
        <T peso="semi">Apagar tudo</T>
        <T v="meta" c={cor.panicoTexto} style={{ marginTop: 2 }}>
          Treinos, ficha, diário, fotos e contador deste aparelho. Não tem volta (o backup na nuvem, se tiver, fica).
        </T>
        <Botao
          tipo="fantasma"
          style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: apagar ? cor.panico : cor.elevado }}
          onPress={() => {
            if (!apagar) return setApagar(true);
            apagarTudo();
            router.replace("/");
          }}
        >
          {apagar ? "Toca de novo pra apagar" : "Apagar meus dados"}
        </Botao>
      </Card>
      <T v="meta" style={{ marginTop: 16 }}>
        Se apertar de verdade: CVV 188, 24 horas. Animações: ExerciseDB. Fotos: Pexels.
      </T>
    </Tela>
  );
}
