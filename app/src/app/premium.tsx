import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { assinar, brl, lojaConfigurada, PRECO, type Plano, planos, restaurar } from "../lib/assinatura";
import { diaLocal } from "../lib/datas";
import { frase } from "../lib/frases";
import { useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, Chip, T, Tela, toque, voltar } from "../ui/base";
import { IcCheck } from "../ui/icones";

const RECURSOS = [
  "Dieta básica, sem pote de sorvete às 23h",
  "Nível Sem dó: as frases que pegam pesado de verdade",
  "Ficha nova sozinha a cada 4 semanas, com a carga que você parou",
  "Fotos de evolução sem limite",
  "Card do Stories sem marca d'água",
];

export default function Premium() {
  const premium = useApp((e) => e.premium);
  const pessoa = useApp((e) => e.perfil?.pessoa ?? "Ela");
  const definir = useApp((e) => e.definirPremium);
  const [lista, setLista] = useState<Plano[]>([]);
  const [escolhido, setEscolhido] = useState<"anual" | "mensal">("anual");
  const [msg, setMsg] = useState<{ t: string; erro?: boolean } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    planos().then(setLista);
  }, []);

  if (premium?.ativo) {
    return (
      <Tela
        rodape={
          <Botao bloco onPress={() => router.replace("/dieta")}>
            Ver a dieta de hoje
          </Botao>
        }
      >
        <Barra />
        <T v="gotica" tam={66} style={{ marginTop: 24 }} accessibilityRole="header">
          Sem dó.
        </T>
        <T tam={18} style={{ marginTop: 10, lineHeight: 26 }}>
          {frase("Premium ativo. Agora o app pega pesado. Mais do que {ela} pegou.", pessoa)}
        </T>
        <View style={{ marginTop: 18, gap: 10 }}>
          {RECURSOS.map((r) => (
            <View key={r} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <IcCheck cor={cor.vermelho} tamanho={14} />
              <T style={{ flex: 1 }}>{r}</T>
            </View>
          ))}
        </View>
        {premium.origem === "teste" && (
          <Botao tipo="texto" style={{ alignSelf: "flex-start", paddingHorizontal: 0, marginTop: 16 }} onPress={() => definir(null)}>
            Desligar o premium de teste
          </Botao>
        )}
      </Tela>
    );
  }

  const anual = lista.find((p) => p.tipo === "anual");
  const mensal = lista.find((p) => p.tipo === "mensal");
  const plano = escolhido === "anual" ? anual : mensal;
  const economia = brl(PRECO.mensal * 12 - PRECO.anual);

  return (
    <Tela
      rodape={
        <>
          <Botao
            bloco
            desativado={!plano || ocupado}
            onPress={async () => {
              if (!plano) return;
              setOcupado(true);
              setMsg(null);
              const r = await assinar(plano);
              setOcupado(false);
              if (r.erro) setMsg({ t: r.erro, erro: true });
            }}
          >
            {ocupado ? "Um segundo…" : "Começar 7 dias grátis"}
          </Botao>
          <T v="meta" style={{ textAlign: "center", marginTop: 6 }}>
            {`Depois, ${plano?.preco ?? ""} por ${escolhido === "anual" ? "ano" : "mês"}. Cancela quando quiser. Diferente de certas pessoas, a gente avisa antes.`}
          </T>
        </>
      }
    >
      <Barra voltar onVoltar={voltar} direita={<T v="meta">7 dias grátis</T>} />
      <T v="gotica" tam={66} style={{ marginTop: 8 }} accessibilityRole="header">
        Sem dó.
      </T>
      <T v="sub" tam={15} style={{ marginTop: 8 }}>
        Pra quem quer que o app pegue pesado de verdade.
      </T>
      <View style={{ marginTop: 18, gap: 10 }}>
        {RECURSOS.map((r) => (
          <View key={r} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <IcCheck cor={cor.vermelho} tamanho={14} />
            <T style={{ flex: 1 }}>{r}</T>
          </View>
        ))}
      </View>

      <View style={{ gap: 8, marginTop: 20 }} accessibilityRole="radiogroup">
        {[anual, mensal].filter(Boolean).map((p) => {
          const on = escolhido === p!.tipo;
          return (
            <Pressable
              key={p!.tipo}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => {
                toque();
                setEscolhido(p!.tipo);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: cor.superficie,
                borderWidth: 2,
                borderColor: on ? cor.texto : "transparent",
              }}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: on ? 6 : 1.5, borderColor: on ? cor.texto : cor.controle }} />
              <View style={{ flex: 1, gap: 4 }}>
                <T peso="semi">{p!.tipo === "anual" ? "Anual" : "Mensal"}</T>
                {p!.tipo === "anual" && <Chip positivo>{`Economiza ${economia}`}</Chip>}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <T peso="semi">{p!.preco}</T>
                <T v="meta">{p!.porMes ? `${p!.porMes} por mês` : "por mês"}</T>
              </View>
            </Pressable>
          );
        })}
      </View>

      {msg && (
        <T c={msg.erro ? cor.pilulaTexto : cor.texto} style={{ marginTop: 12 }} accessibilityLiveRegion="polite">
          {msg.t}
        </T>
      )}

      <View style={{ flexDirection: "row", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        <Botao
          tipo="texto"
          style={{ paddingHorizontal: 0 }}
          onPress={async () => {
            const r = await restaurar();
            setMsg(r.ok ? { t: "Assinatura restaurada." } : { t: r.erro ?? "Nenhuma assinatura encontrada nessa conta da loja.", erro: true });
          }}
        >
          Restaurar compra
        </Botao>
        {__DEV__ && !lojaConfigurada && (
          <Botao tipo="texto" style={{ paddingHorizontal: 0 }} onPress={() => definir({ ativo: true, origem: "teste", desde: diaLocal(new Date()) })}>
            Liberar premium (teste)
          </Botao>
        )}
      </View>
      {!lojaConfigurada && (
        <T v="meta" style={{ marginTop: 6 }}>
          A compra ainda não está ligada à App Store e ao Google Play. Nada é cobrado.
        </T>
      )}
    </Tela>
  );
}
