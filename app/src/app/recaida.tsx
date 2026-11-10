import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { frase } from "../lib/frases";
import { diasDesdeOFim, useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, Card, Chip, Opcao, T, Tela } from "../ui/base";
import { useFrase } from "../ui/frase";

type Escolha = "pausar" | "zerar" | "mensagem";

/**
 * Modo recaída. Nunca zera o contador sem perguntar: pausar é o padrão.
 * Se já está pausado, a tela é a da volta (acabou de novo).
 */
export default function Recaida() {
  const perfil = useApp((e) => e.perfil);
  const pausar = useApp((e) => e.pausarContador);
  const retomar = useApp((e) => e.retomarContador);
  const zerar = useApp((e) => e.zerarContador);
  const registrarCrise = useApp((e) => e.registrarCrise);
  const [escolha, setEscolha] = useState<Escolha>("pausar");
  const recaida = useFrase("recaida");
  const deNovo = useFrase("acabouDeNovo");
  if (!perfil) return null;

  const dias = diasDesdeOFim(perfil);
  const pausado = !!perfil.pausadoEm;
  const ir = () => router.replace("/hoje");

  if (pausado) {
    return (
      <Tela
        rodape={
          <>
            <Botao
              bloco
              onPress={() => {
                retomar();
                ir();
              }}
            >
              {`Acabou de novo. Volta dos ${dias} dias`}
            </Botao>
            <Botao
              tipo="texto"
              onPress={() => {
                zerar();
                ir();
              }}
            >
              Começar do zero
            </Botao>
          </>
        }
      >
        <Barra />
        <T v="gotica" tam={72} style={{ marginTop: 8 }} accessibilityRole="header">
          De novo?
        </T>
        <T v="sub" tam={16} style={{ marginTop: 10 }}>
          {deNovo}
        </T>
        <Card style={{ marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <T v="display" tam={56} style={{ lineHeight: 60 }}>
              {dias}
            </T>
            <T v="meta">dias guardados</T>
          </View>
          <Chip>Pausado</Chip>
        </Card>
        <T v="sub" style={{ marginTop: 14 }}>
          Voltar dos dias guardados conta como se a pausa não tivesse existido. Do zero, o contador recomeça hoje.
        </T>
      </Tela>
    );
  }

  const confirmar = () => {
    if (escolha === "pausar") pausar();
    if (escolha === "zerar") zerar();
    if (escolha === "mensagem") registrarCrise(0, true);
    ir();
  };

  return (
    <Tela
      rodape={
        <>
          <T v="sub" style={{ marginBottom: 10 }}>
            A ficha continua valendo. O recorde também.
          </T>
          <Botao bloco onPress={confirmar}>
            Continuar treinando
          </Botao>
        </>
      }
    >
      <Barra />
      <T v="gotica" tam={80} style={{ marginTop: 4 }} accessibilityRole="header">
        …ok.
      </T>
      <T v="sub" tam={16} style={{ marginTop: 10 }}>
        {frase("Você marcou que voltou com {ela}. ", perfil.pessoa)}
        {recaida}
      </T>
      <Card style={{ marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <T v="display" tam={56} style={{ lineHeight: 60 }}>
            {dias}
          </T>
          <T v="meta">dias até aqui</T>
        </View>
        <Chip>{escolha === "pausar" ? "Vai pausar" : escolha === "zerar" ? "Vai zerar" : "Continua"}</Chip>
      </Card>
      <View style={{ gap: 8, marginTop: 12 }} accessibilityRole="radiogroup">
        <Opcao rotulo="Pausar o contador" marcada={escolha === "pausar"} onPress={() => setEscolha("pausar")} />
        <Opcao rotulo="Zerar o contador" marcada={escolha === "zerar"} onPress={() => setEscolha("zerar")} />
        <Opcao rotulo="Foi só uma mensagem" marcada={escolha === "mensagem"} onPress={() => setEscolha("mensagem")} />
      </View>
      <T v="meta" c={cor.fraco} style={{ marginTop: 10 }}>
        {escolha === "pausar"
          ? "Os dias ficam guardados. Se acabar de novo, o contador volta de onde parou."
          : escolha === "zerar"
            ? "O contador recomeça hoje. Os treinos e recordes ficam."
            : "Conta como mensagem enviada no placar do pânico. O contador segue."}
      </T>
    </Tela>
  );
}
