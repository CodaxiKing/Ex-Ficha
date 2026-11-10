import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { comSemana, diaLocal, inteiro } from "../lib/datas";
import { cardapio, type DadosDieta, metas } from "../lib/dieta";
import { emCalmo, useApp } from "../store";
import { cor, fonte } from "../theme";
import { Barra, Botao, Card, Chip, Opcao, Passo, T, Tela, toque } from "../ui/base";
import { IcCheck } from "../ui/icones";

function BarraMeta({ rotulo, feito, meta, un }: { rotulo: string; feito: number; meta: number; un: string }) {
  const pct = Math.min(100, (feito / meta) * 100);
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <T v="sub" tam={13}>
          {rotulo}
        </T>
        <T v="sub" tam={13}>
          {inteiro(feito)} de {inteiro(meta)} {un}
        </T>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: cor.elevado, overflow: "hidden", marginTop: 6 }}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: cor.vermelho }} />
      </View>
    </View>
  );
}

/** Primeira vez: os dados pra conta de calorias. */
function Configurar({ inicial, onPronto }: { inicial?: DadosDieta; onPronto: () => void }) {
  const salvar = useApp((e) => e.salvarDadosDieta);
  const medidas = useApp((e) => e.medidas);
  const historico = useApp((e) => e.historico);
  const pesoMedido = [...medidas].reverse().find((m) => m.peso !== undefined)?.peso;
  const [d, setD] = useState<DadosDieta>(() => {
    if (inicial) return { ...inicial, peso: pesoMedido ?? inicial.peso };
    // Treinos por semana: média das últimas 4 semanas, ou 3.
    const agora = Date.now();
    const ultimas = historico.filter((t) => agora - new Date(t.data).getTime() < 28 * 864e5).length;
    return { sexo: "M", idade: 28, altura: 175, peso: pesoMedido ?? 75, treinosSemana: Math.max(2, Math.min(6, Math.round(ultimas / 4) || 3)) };
  });
  const muda = (k: keyof DadosDieta, v: number) => setD((x) => ({ ...x, [k]: Math.round(v * 10) / 10 }));

  return (
    <Tela
      rodape={
        <Botao
          bloco
          onPress={() => {
            salvar(d);
            onPronto();
          }}
        >
          Montar minha dieta
        </Botao>
      }
    >
      <Barra titulo="Dieta" />
      <T v="pergunta" style={{ marginTop: 8 }}>
        Primeiro, os números.
      </T>
      <T v="sub" style={{ marginTop: 6 }}>
        Só pra calcular quanto você gasta. Fica no aparelho.
      </T>
      <T peso="semi" style={{ marginTop: 20 }}>
        Corpo para a conta
      </T>
      <View style={{ gap: 8, marginTop: 8 }} accessibilityRole="radiogroup">
        <Opcao rotulo="Masculino" marcada={d.sexo === "M"} onPress={() => setD((x) => ({ ...x, sexo: "M" }))} />
        <Opcao rotulo="Feminino" marcada={d.sexo === "F"} onPress={() => setD((x) => ({ ...x, sexo: "F" }))} />
      </View>
      <View style={{ marginTop: 10 }}>
        <Passo rotulo="Idade" valor={`${d.idade} anos`} onMenos={() => muda("idade", Math.max(16, d.idade - 1))} onMais={() => muda("idade", Math.min(80, d.idade + 1))} />
        <Passo rotulo="Altura" valor={`${d.altura} cm`} onMenos={() => muda("altura", Math.max(140, d.altura - 1))} onMais={() => muda("altura", Math.min(215, d.altura + 1))} />
        <Passo
          rotulo={pesoMedido ? "Peso (da última medida)" : "Peso"}
          valor={`${String(d.peso).replace(".", ",")} kg`}
          onMenos={() => muda("peso", Math.max(40, d.peso - 0.5))}
          onMais={() => muda("peso", Math.min(200, d.peso + 0.5))}
        />
        <Passo
          rotulo="Treinos por semana"
          valor={String(d.treinosSemana)}
          onMenos={() => muda("treinosSemana", Math.max(1, d.treinosSemana - 1))}
          onMais={() => muda("treinosSemana", Math.min(7, d.treinosSemana + 1))}
        />
      </View>
      <T v="meta" style={{ marginTop: 14 }}>
        É uma estimativa, não uma prescrição. Se você tem alguma condição de saúde, ou se a relação com a comida anda difícil, procure um nutricionista.
      </T>
    </Tela>
  );
}

/** Registrar algo fora do cardápio. */
function Extra({ onFechar }: { onFechar: () => void }) {
  const registrar = useApp((e) => e.registrarExtra);
  const [nome, setNome] = useState("");
  const [kcal, setKcal] = useState(300);
  const [prot, setProt] = useState(15);
  const hoje = diaLocal(new Date());
  return (
    <Card style={{ marginTop: 12 }}>
      <T peso="semi">Comi outra coisa</T>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="O quê? (ex.: pizza, 2 fatias)"
        placeholderTextColor={cor.fraco}
        accessibilityLabel="O que você comeu"
        maxLength={40}
        style={{
          marginTop: 10,
          height: 48,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: cor.chao,
          borderWidth: 1,
          borderColor: cor.bordaCampo,
          color: cor.texto,
          fontFamily: fonte.regular,
          fontSize: 15,
        }}
      />
      <Passo rotulo="Calorias" valor={`${kcal} kcal`} onMenos={() => setKcal((k) => Math.max(0, k - 50))} onMais={() => setKcal((k) => k + 50)} />
      <Passo rotulo="Proteína" valor={`${prot} g`} onMenos={() => setProt((p) => Math.max(0, p - 5))} onMais={() => setProt((p) => p + 5)} />
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Botao
          style={{ flex: 1 }}
          desativado={!nome.trim()}
          onPress={() => {
            registrar(hoje, { nome: nome.trim(), kcal, prot });
            onFechar();
          }}
        >
          Registrar
        </Botao>
        <Botao tipo="fantasma" onPress={onFechar}>
          Cancelar
        </Botao>
      </View>
    </Card>
  );
}

export default function Dieta() {
  const premium = useApp((e) => e.premium);
  const dados = useApp((e) => e.dieta);
  const perfil = useApp((e) => e.perfil);
  const refeicoes = useApp((e) => e.refeicoes);
  const calmoAte = useApp((e) => e.calmoAte);
  const alternar = useApp((e) => e.alternarRefeicao);
  const removerExtra = useApp((e) => e.removerExtra);
  const [editando, setEditando] = useState(false);
  const [extra, setExtra] = useState(false);
  if (!perfil) return null;

  if (!premium?.ativo) {
    return (
      <Tela
        rodape={
          <Botao bloco onPress={() => router.push("/premium")}>
            Conhecer o premium
          </Botao>
        }
      >
        <Barra titulo="Dieta" />
        <T v="gotica" tam={56} style={{ marginTop: 20 }}>
          Sem dó.
        </T>
        <T tam={18} style={{ marginTop: 10, lineHeight: 26 }}>
          A dieta é do premium: calorias e proteína pro seu objetivo e um cardápio de comida de verdade, que muda todo dia.
        </T>
        <Card style={{ marginTop: 18 }}>
          <T v="sub">Exemplo de um dia</T>
          <T style={{ marginTop: 6 }}>Café: 3 ovos mexidos, pão integral</T>
          <T>Almoço: arroz, feijão, frango grelhado 160 g, salada</T>
          <T c={cor.fraco}>…e mais três refeições</T>
        </Card>
      </Tela>
    );
  }

  if (!dados || editando) return <Configurar inicial={dados ?? undefined} onPronto={() => setEditando(false)} />;

  const hoje = diaLocal(new Date());
  const m = metas(dados, perfil.objetivo);
  const lista = cardapio(m, hoje);
  const dia = refeicoes[hoje] ?? { feitas: [], extras: [] };
  const feitas = lista.filter((r) => dia.feitas.includes(r.id));
  const kcal = feitas.reduce((a, r) => a + r.kcal, 0) + dia.extras.reduce((a, e) => a + e.kcal, 0);
  const prot = feitas.reduce((a, r) => a + r.prot, 0) + dia.extras.reduce((a, e) => a + e.prot, 0);
  const calmo = emCalmo(calmoAte);

  return (
    <Tela
      rodape={
        !extra && (
          <Botao bloco onPress={() => setExtra(true)}>
            Registrar outra coisa
          </Botao>
        )
      }
    >
      <Barra titulo="Dieta de hoje" direita={<Chip positivo>Sem dó</Chip>} />
      <T v="meta" style={{ textAlign: "center" }}>
        {comSemana(hoje)}
      </T>
      <Card style={{ marginTop: 10, paddingTop: 8 }}>
        <BarraMeta rotulo="Calorias" feito={kcal} meta={m.kcal} un="kcal" />
        <BarraMeta rotulo="Proteína" feito={prot} meta={m.prot} un="g" />
      </Card>

      <View style={{ marginTop: 10 }}>
        {lista.map((r, i) => {
          const ok = dia.feitas.includes(r.id);
          return (
            <Pressable
              key={r.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: ok }}
              onPress={() => {
                toque();
                alternar(hoje, r.id);
              }}
              style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: cor.linha }}
            >
              <T v="meta" style={{ width: 40, paddingTop: 2 }}>
                {r.hora}
              </T>
              <View style={{ flex: 1 }}>
                <T peso="semi" c={ok ? cor.apagado : cor.texto}>
                  {r.nome}
                  {ok ? <T v="meta"> · feito</T> : null}
                </T>
                <T v="meta">{r.itens}</T>
                {r.nota && !calmo && (
                  <T tam={12} c={cor.pilulaTexto} style={{ marginTop: 2 }}>
                    {r.nota}
                  </T>
                )}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <T tam={14}>{r.kcal}</T>
                <T v="meta">{r.prot} g</T>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: ok ? cor.vermelho : "transparent",
                    borderWidth: ok ? 0 : 1.5,
                    borderColor: cor.controle,
                  }}
                >
                  {ok && <IcCheck cor="#fff" />}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {dia.extras.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <T peso="semi">Fora do cardápio</T>
          {dia.extras.map((e, i) => (
            <View key={`${e.nome}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: cor.linha }}>
              <T style={{ flex: 1 }}>{e.nome}</T>
              <T v="meta">
                {e.kcal} kcal · {e.prot} g
              </T>
              <Pressable accessibilityRole="button" accessibilityLabel={`Apagar ${e.nome}`} onPress={() => removerExtra(hoje, i)} hitSlop={8}>
                <T v="meta" c={cor.pilulaTexto}>
                  apagar
                </T>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {extra && <Extra onFechar={() => setExtra(false)} />}

      <T v="meta" style={{ marginTop: 14 }}>
        Meta pelo objetivo: {inteiro(m.kcal)} kcal e {m.prot} g de proteína. O cardápio troca todo dia. Estimativa, não prescrição.
      </T>
      <Botao tipo="texto" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => setEditando(true)}>
        Atualizar peso e dados
      </Botao>
    </Tela>
  );
}
