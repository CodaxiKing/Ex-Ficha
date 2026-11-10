import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";

import { alternativas, exercicio, semCarga } from "../../data/exercicios";
import type { Plano } from "../../data/tipos";
import { kg } from "../../lib/datas";
import { useApp } from "../../store";
import { cor } from "../../theme";
import { Barra, Botao, Card, Passo, T, Tela, toque, voltar } from "../../ui/base";

type Letra = Plano["letra"];

export default function Exercicio() {
  const { id, letra: letraParam } = useLocalSearchParams<{ id: string; letra?: string }>();
  const ficha = useApp((e) => e.ficha);
  const ajustar = useApp((e) => e.ajustarItem);
  const trocar = useApp((e) => e.trocarItem);
  const adicionar = useApp((e) => e.adicionarItem);
  const remover = useApp((e) => e.removerItem);

  const ex = exercicio(id);
  const letra = (letraParam || undefined) as Letra | undefined;
  const plano = letra ? ficha?.planos.find((p) => p.letra === letra) : undefined;
  const item = plano?.itens.find((it) => it.id === id);
  const prancha = id === "Plank";

  return (
    <Tela>
      <Barra titulo={ex.nome} />
      <View style={{ marginTop: 6, borderRadius: 20, overflow: "hidden", backgroundColor: cor.chao, alignItems: "center" }}>
        <Image source={ex.gif} style={{ width: "100%", aspectRatio: 1, maxHeight: 300 }} contentFit="contain" autoplay accessibilityLabel={`${ex.nome}, em loop`} />
      </View>
      <T v="sub" style={{ marginTop: 8 }}>
        {ex.principais.join(", ")}
        {ex.secundarios.length ? ` · também ${ex.secundarios.join(", ")}` : ""} · {ex.equipamento}
      </T>
      <T peso="semi" c={cor.pilulaTexto} style={{ marginTop: 10 }}>
        {ex.dica}
      </T>

      {item && plano ? (
        <Card style={{ marginTop: 14, paddingVertical: 4, paddingHorizontal: 16 }}>
          <Passo rotulo="Séries" valor={String(item.series)} onMenos={() => ajustar(plano.letra, id, { series: Math.max(1, item.series - 1) })} onMais={() => ajustar(plano.letra, id, { series: Math.min(10, item.series + 1) })} />
          <Passo
            rotulo={prancha ? "Segundos" : "Repetições"}
            valor={String(item.reps)}
            onMenos={() => ajustar(plano.letra, id, { reps: Math.max(1, item.reps - (prancha ? 5 : 1)) })}
            onMais={() => ajustar(plano.letra, id, { reps: item.reps + (prancha ? 5 : 1) })}
          />
          {!semCarga(id) && (
            <Passo rotulo="Carga" valor={kg(item.kg)} onMenos={() => ajustar(plano.letra, id, { kg: Math.max(0, item.kg - 2.5) })} onMais={() => ajustar(plano.letra, id, { kg: item.kg + 2.5 })} />
          )}
          <Passo rotulo="Descanso" valor={`${item.descanso} s`} onMenos={() => ajustar(plano.letra, id, { descanso: Math.max(15, item.descanso - 15) })} onMais={() => ajustar(plano.letra, id, { descanso: Math.min(300, item.descanso + 15) })} />
        </Card>
      ) : null}

      <T peso="semi" tam={16} style={{ marginTop: 18 }}>
        Como fazer
      </T>
      {ex.passos.map((p, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          <T v="display" tam={18} c={cor.vermelho} style={{ width: 16 }}>
            {i + 1}
          </T>
          <T style={{ flex: 1 }}>{p}</T>
        </View>
      ))}

      {item && plano ? (
        <>
          <T peso="semi" tam={16} style={{ marginTop: 20 }}>
            Trocar por
          </T>
          {alternativas(id)
            .filter((a) => !plano.itens.some((it) => it.id === a.id))
            .map((a) => (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                onPress={() => {
                  toque();
                  trocar(plano.letra, id, a.id);
                  router.setParams({ id: a.id });
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: cor.linha }}
              >
                <Image source={a.capa} style={{ width: 40, height: 40, borderRadius: 10 }} accessibilityLabel={a.nome} />
                <T style={{ flex: 1 }}>{a.nome}</T>
                <T peso="media" c={cor.pilulaTexto}>
                  Trocar
                </T>
              </Pressable>
            ))}
          <Botao
            tipo="texto"
            style={{ marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 0 }}
            onPress={() => {
              remover(plano.letra, id);
              voltar();
            }}
          >
            {`Tirar do treino ${plano.letra}`}
          </Botao>
        </>
      ) : (
        <>
          <T peso="semi" tam={16} style={{ marginTop: 20 }}>
            Colocar na ficha
          </T>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            {ficha?.planos.map((p) => (
              <Botao
                key={p.letra}
                tipo="fantasma"
                style={{ flex: 1 }}
                rotulo={`Adicionar ao treino ${p.letra}`}
                onPress={() => {
                  adicionar(p.letra, id);
                  router.setParams({ letra: p.letra });
                }}
              >
                {`Treino ${p.letra}`}
              </Botao>
            ))}
          </View>
        </>
      )}
    </Tela>
  );
}
