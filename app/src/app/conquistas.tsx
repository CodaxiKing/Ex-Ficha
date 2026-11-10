import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { conquistas, ganhou } from "../lib/conquistas";
import { useApp } from "../store";
import { cor } from "../theme";
import { Barra, T, Tela } from "../ui/base";

/** A relíquia: uma lápide. Acesa quando conquistada. */
function Lapide({ acesa }: { acesa: boolean }) {
  const c = acesa ? cor.vermelho : cor.bordaCampo;
  return (
    <Svg width={44} height={52} viewBox="0 0 44 52">
      <Path d="M6 50V20C6 10 13 4 22 4s16 6 16 16v30z" fill={acesa ? cor.pilulaFundo : cor.vazio} stroke={c} strokeWidth={2} />
      <Path d="M22 14v18M15 21h14" stroke={c} strokeWidth={2.4} strokeLinecap="round" />
      <Rect x={2} y={48} width={40} height={3} rx={1.5} fill={c} />
    </Svg>
  );
}

export default function Conquistas() {
  const perfil = useApp((e) => e.perfil);
  const ficha = useApp((e) => e.ficha);
  const historico = useApp((e) => e.historico);
  const panico = useApp((e) => e.panico);
  const diario = useApp((e) => e.diario);
  const fotos = useApp((e) => e.fotos);
  if (!perfil) return null;

  const lista = conquistas({ perfil, ficha, historico, panico, diario, fotos });
  const total = lista.filter(ganhou).length;
  // Conquistadas primeiro; depois as mais perto de sair.
  const ordem = [...lista].sort((a, b) => Number(ganhou(b)) - Number(ganhou(a)) || b.atual / b.alvo - a.atual / a.alvo);

  return (
    <Tela>
      <Barra titulo="Conquistas" direita={<T v="meta">{`${total} de ${lista.length}`}</T>} />
      <T v="sub" style={{ marginTop: 6 }}>
        Cada lápide é uma coisa que ficou pra trás.
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {ordem.map((c) => {
          const ok = ganhou(c);
          return (
            <View
              key={c.id}
              accessibilityLabel={`${c.nome}${ok ? ", conquistada" : `, ${c.atual} de ${c.alvo}`}`}
              style={{ width: "31.8%", minHeight: 150, alignItems: "center", gap: 8, paddingTop: 14, paddingBottom: 12, paddingHorizontal: 8, borderRadius: 16, backgroundColor: cor.superficie, opacity: ok ? 1 : 0.85 }}
            >
              <Lapide acesa={ok} />
              <T tam={12} peso={ok ? "semi" : "regular"} c={ok ? cor.texto : cor.apagado} style={{ textAlign: "center", lineHeight: 16 }}>
                {c.nome}
              </T>
              {!ok && c.alvo > 1 && (
                <View style={{ width: "100%", marginTop: "auto", gap: 4 }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: cor.elevado, overflow: "hidden" }}>
                    <View style={{ width: `${(c.atual / c.alvo) * 100}%`, height: "100%", backgroundColor: cor.vermelho }} />
                  </View>
                  <T tam={11} c={cor.fraco} style={{ textAlign: "center" }}>
                    {c.atual}
                    {c.unidade ?? ""} de {c.alvo}
                    {c.unidade ?? ""}
                  </T>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Tela>
  );
}
