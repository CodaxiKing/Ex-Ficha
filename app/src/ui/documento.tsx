import { View } from "react-native";

import { type Secao, VIGENCIA } from "../lib/legal";
import { cor } from "../theme";
import { Barra, T, Tela } from "./base";

/** Tela de leitura de um documento legal (privacidade ou termos). */
export function Documento({ titulo, secoes }: { titulo: string; secoes: Secao[] }) {
  return (
    <Tela>
      <Barra titulo={titulo} />
      <T v="meta" style={{ marginTop: 4 }}>
        Vale desde {VIGENCIA}
      </T>
      {secoes.map((s) => (
        <View key={s.titulo} style={{ marginTop: 20 }}>
          <T peso="semi" tam={17} accessibilityRole="header">
            {s.titulo}
          </T>
          {s.paragrafos.map((p, i) => (
            <T key={i} tam={15} c={cor.apagado} style={{ marginTop: 8, lineHeight: 22 }}>
              {p}
            </T>
          ))}
        </View>
      ))}
    </Tela>
  );
}
