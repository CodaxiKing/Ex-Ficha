import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import type { Objetivo, Pessoa } from "../../data/tipos";
import { curta, diaLocal, somarDias } from "../../lib/datas";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { VERSAO_TERMOS } from "../../lib/legal";
import { Aceite } from "../../ui/aceite";
import { Barra, Botao, Opcao, Passo, Progresso, T, Tela, toque } from "../../ui/base";

const PESSOAS: { id: Pessoa; rotulo: string }[] = [
  { id: "Ela", rotulo: "Ela" },
  { id: "Ele", rotulo: "Ele" },
  { id: "Essa pessoa", rotulo: "Prefiro não dizer" },
];

const SOFRENCIA = [
  "Tô de boa. Juro.",
  "Tô de boa. Quase.",
  "Dá pra levar.",
  "Ouvi uma música e lembrei.",
  "Meio a meio.",
  "Tá pesado.",
  "Sete. Isso pesa. Então vamos usar como carga.",
  "Olhei o perfil hoje. Duas vezes.",
  "Sertanejo no carro, sozinho.",
  "Sertanejo no escuro. A gente começa amanhã cedo.",
];

export default function Luto() {
  const { objetivo } = useLocalSearchParams<{ objetivo: Objetivo }>();
  const concluir = useApp((e) => e.concluirOnboarding);
  const aceitarTermos = useApp((e) => e.aceitarTermos);
  const [aceite, setAceite] = useState(false);
  const hoje = diaLocal(new Date());
  const [pessoa, setPessoa] = useState<Pessoa>("Ela");
  const [dias, setDias] = useState(14);
  const [sofrencia, setSofrencia] = useState(7);

  const terminar = () => {
    if (!aceite) return;
    concluir({ pessoa, fim: somarDias(hoje, -dias), objetivo: objetivo ?? "massa", sofrencia });
    aceitarTermos(VERSAO_TERMOS);
    router.replace("/hoje");
  };

  return (
    <Tela
      rodape={
        <>
          <Aceite marcado={aceite} onMudar={setAceite} />
          <Botao bloco desativado={!aceite} onPress={terminar} style={{ marginTop: 12 }}>
            Montar minha ficha
          </Botao>
        </>
      }
    >
      <Barra direita={<T v="meta">2 de 2</T>} />
      <Progresso total={2} feitos={2} />
      <T v="pergunta" accessibilityRole="header">
        Quem te trocou?
      </T>
      <View style={{ gap: 8, marginTop: 18 }} accessibilityRole="radiogroup">
        {PESSOAS.map((p) => (
          <Opcao key={p.id} rotulo={p.rotulo} marcada={pessoa === p.id} onPress={() => setPessoa(p.id)} />
        ))}
      </View>

      <T peso="semi" tam={17} style={{ marginTop: 28 }}>
        Faz quanto tempo que acabou?
      </T>
      <View style={{ marginTop: 4 }}>
        <Passo
          rotulo={dias === 0 ? "Acabou hoje" : `Acabou em ${curta(somarDias(hoje, -dias))}`}
          valor={`${dias} ${dias === 1 ? "dia" : "dias"}`}
          onMenos={() => setDias((d) => Math.max(0, d - 1))}
          onMais={() => setDias((d) => Math.min(730, d + 1))}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        {[
          [0, "Hoje"],
          [7, "1 semana"],
          [30, "1 mês"],
          [90, "3 meses"],
        ].map(([n, r]) => (
          <Pressable
            key={r}
            accessibilityRole="button"
            onPress={() => {
              toque();
              setDias(n as number);
            }}
            style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: "center", backgroundColor: dias === n ? cor.texto : cor.superficie }}
          >
            <T tam={13} c={dias === n ? cor.chao : cor.apagado}>
              {r as string}
            </T>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 28 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <T v="sub">Nível de sofrência</T>
          <T peso="semi" tam={24}>
            {sofrencia} de 10
          </T>
        </View>
        <View style={{ flexDirection: "row", gap: 4, marginTop: 14 }} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: 10, now: sofrencia }}>
          {Array.from({ length: 10 }, (_, k) => (
            <Pressable
              key={k}
              accessibilityLabel={`${k + 1}`}
              hitSlop={{ top: 12, bottom: 12 }}
              onPress={() => {
                toque();
                setSofrencia(k + 1);
              }}
              style={{ flex: 1, height: 28, borderRadius: 6, backgroundColor: k < sofrencia ? cor.vermelho : cor.elevado }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <T v="meta">1 · tô de boa</T>
          <T v="meta">10 · sertanejo no escuro</T>
        </View>
        <T v="sub" style={{ marginTop: 14 }}>
          {SOFRENCIA[sofrencia - 1]}
        </T>
      </View>
    </Tela>
  );
}
