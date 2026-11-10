import Svg, { Circle, Path, Rect } from "react-native-svg";

import { cor } from "../theme";

type P = { tamanho?: number; cor?: string };

export function IcVoltar({ tamanho = 20, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function IcFechar({ tamanho = 20, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IcCasa({ tamanho = 22, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />
    </Svg>
  );
}

export function IcHalter({ tamanho = 22, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6} strokeLinecap="round">
      <Path d="M6 7v10M3.5 9.5v5M18 7v10M20.5 9.5v5M6 12h12" />
    </Svg>
  );
}

export function IcGrafico({ tamanho = 22, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 19h16M6 15l4-4 3 3 5-6" />
    </Svg>
  );
}

export function IcPessoa({ tamanho = 22, cor: c = cor.apagado }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}>
      <Circle cx={12} cy={8.5} r={3.5} />
      <Path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" strokeLinecap="round" />
    </Svg>
  );
}

export function IcCheck({ tamanho = 12, cor: c = cor.chao }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3.5 8.5 6.5 11 12.5 5" />
    </Svg>
  );
}

export function IcMensagemX({ tamanho = 18 }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor.texto} strokeWidth={1.8} strokeLinejoin="round">
      <Path d="M4 5h16v11H9l-5 4z" />
      <Path d="M9.5 8.5l5 5M14.5 8.5l-5 5" strokeLinecap="round" />
    </Svg>
  );
}

export function IcBusca({ tamanho = 18, cor: c = cor.fraco }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round">
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="m16 16 4 4" />
    </Svg>
  );
}

export function IcMais({ tamanho = 18, cor: c = cor.texto }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IcSeta({ tamanho = 16, cor: c = cor.fraco }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** A anilha rachada da marca. */
export function Anilha({ tamanho = 236, racha = true }: { tamanho?: number; racha?: boolean }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 240 240" fill="none">
      <Circle cx={120} cy={120} r={112} fill={cor.superficie} />
      <Circle cx={120} cy={120} r={84} fill={cor.chao} />
      <Circle cx={120} cy={120} r={70} fill={cor.superficie} />
      <Circle cx={120} cy={120} r={22} fill={cor.chao} />
      {racha && <Path d="M128 8 104 70l26 12-22 52 18 8-14 92" stroke={cor.vermelho} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />}
    </Svg>
  );
}

export function IcCadeado({ tamanho = 14, cor: c = cor.fraco }: P) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth={1.4}>
      <Rect x={3.5} y={7} width={9} height={6.5} rx={1.5} />
      <Path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </Svg>
  );
}
