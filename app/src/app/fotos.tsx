import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { curta, diaLocal, diasEntre } from "../lib/datas";
import { apagarArquivo, pegarFoto } from "../lib/fotos";
import { frase } from "../lib/frases";
import { FOTOS_GRATIS, useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, T, Tela, toque } from "../ui/base";

function Quadro({ uri, legenda }: { uri?: string; legenda: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ aspectRatio: 3 / 4, borderRadius: 14, overflow: "hidden", backgroundColor: cor.vazio, alignItems: "center", justifyContent: "center" }}>
        {uri ? <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" accessibilityLabel={legenda} /> : <T v="meta">sem foto</T>}
      </View>
      <T v="meta" style={{ marginTop: 6 }}>
        {legenda}
      </T>
    </View>
  );
}

export default function Fotos() {
  const fotos = useApp((e) => e.fotos);
  const perfil = useApp((e) => e.perfil);
  const adicionar = useApp((e) => e.adicionarFoto);
  const remover = useApp((e) => e.removerFoto);
  const sortear = useApp((e) => e.sortear);
  const premium = useApp((e) => e.premium?.ativo);
  const [resposta, setResposta] = useState<string | null>(null);
  const [apagando, setApagando] = useState<string | null>(null);
  if (!perfil) return null;

  const hoje = diaLocal(new Date());
  const primeira = fotos[0];
  const ultima = fotos.length > 1 ? fotos.at(-1) : undefined;
  const legenda = (dia: string) => `Dia ${Math.max(0, diasEntre(perfil.fim, dia))} · ${curta(dia)}`;

  const nova = async (origem: "camera" | "galeria") => {
    if (!premium && fotos.length >= FOTOS_GRATIS) return router.push("/premium");
    const uri = await pegarFoto(origem);
    if (!uri) return;
    adicionar({ dia: hoje, uri });
    setResposta(sortear("foto"));
  };

  return (
    <Tela
      rodape={
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Botao tipo="fantasma" style={{ flex: 1 }} onPress={() => nova("galeria")}>
            Da galeria
          </Botao>
          <Botao style={{ flex: 2 }} onPress={() => nova("camera")}>
            Tirar a foto da semana
          </Botao>
        </View>
      }
    >
      <Barra titulo="Fotos" direita={<T v="meta">só você vê</T>} />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <Quadro uri={primeira?.uri} legenda={primeira ? legenda(primeira.dia) : "Antes"} />
        <Quadro uri={ultima?.uri} legenda={ultima ? legenda(ultima.dia) : "Depois"} />
      </View>

      {resposta && (
        <View style={{ marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: cor.elevado }} accessibilityLiveRegion="polite">
          <T>{resposta}</T>
        </View>
      )}

      {fotos.length > 0 && (
        <>
          <T peso="semi" tam={16} style={{ marginTop: 20 }}>
            Todas ({fotos.length})
          </T>
          <T v="meta">Toca e segura pra apagar.</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {fotos.map((f) => (
              <Pressable
                key={f.uri}
                accessibilityRole="button"
                accessibilityLabel={`Foto de ${curta(f.dia)}`}
                onLongPress={() => {
                  toque();
                  setApagando(f.uri);
                }}
                style={{ width: "23.5%", aspectRatio: 3 / 4, borderRadius: 10, overflow: "hidden", backgroundColor: cor.vazio }}
              >
                <Image source={{ uri: f.uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                <View style={{ position: "absolute", left: 4, bottom: 4, paddingHorizontal: 5, borderRadius: 6, backgroundColor: "rgba(11,9,9,0.75)" }}>
                  <T tam={10}>{curta(f.dia)}</T>
                </View>
              </Pressable>
            ))}
          </View>
          {apagando && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: cor.panicoFundo }}>
              <T style={{ flex: 1 }}>Apagar esta foto?</T>
              <Botao
                tipo="fantasma"
                style={{ height: 36, backgroundColor: cor.panico }}
                onPress={() => {
                  apagarArquivo(apagando);
                  remover(apagando);
                  setApagando(null);
                }}
              >
                Apagar
              </Botao>
              <Botao tipo="texto" style={{ height: 36 }} onPress={() => setApagando(null)}>
                Não
              </Botao>
            </View>
          )}
        </>
      )}

      <T v="sub" style={{ marginTop: 16 }}>
        {frase("As fotos ficam só neste aparelho. Nem a gente vê. Muito menos {ela}.", perfil.pessoa)}
      </T>
    </Tela>
  );
}
