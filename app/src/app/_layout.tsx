import { Anton_400Regular } from "@expo-google-fonts/anton";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { UnifrakturCook_700Bold } from "@expo-google-fonts/unifrakturcook";
import { DarkTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { reagendarAvisos } from "../lib/avisos";
import { fazerBackup, nuvemConfigurada, sessaoAtual } from "../lib/nuvem";
import { diasDesdeOFim, useApp, useCarregado } from "../store";
import { aplicarFase, claro, cor, faseAtual, faseDe } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const temaNav = () => ({
  ...DarkTheme,
  dark: !claro(),
  colors: { ...DarkTheme.colors, background: cor.chao, card: cor.chao, text: cor.texto, border: cor.borda, primary: cor.vermelho },
});

/** Reagenda os lembretes quando muda algo que afeta o texto ou o horário deles. */
function Avisos() {
  const avisos = useApp((e) => e.perfil?.avisos);
  const zoeira = useApp((e) => e.perfil?.zoeira);
  const pessoa = useApp((e) => e.perfil?.pessoa);
  const treinos = useApp((e) => e.historico.length);
  const calmoAte = useApp((e) => e.calmoAte);
  const fichaDe = useApp((e) => e.ficha?.criadaEm);
  useEffect(() => {
    const t = setTimeout(() => {
      reagendarAvisos().catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [avisos, zoeira, pessoa, treinos, calmoAte, fichaDe]);
  return null;
}

/** Backup automático na nuvem a cada treino novo, se houver conta. */
function BackupAutomatico() {
  const treinos = useApp((e) => e.historico.length);
  useEffect(() => {
    if (!nuvemConfigurada || treinos === 0) return;
    const t = setTimeout(async () => {
      if (await sessaoAtual()) fazerBackup().catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [treinos]);
  return null;
}

export default function Raiz() {
  const [fontes] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Anton_400Regular, UnifrakturCook_700Bold });
  const carregado = useCarregado();
  // Modo superou: a fase sai dos dias desde o fim (ou fica no escuro, se a pessoa preferir).
  const fase = useApp((e) => (e.perfil && !e.perfil.visualFixo ? faseDe(diasDesdeOFim(e.perfil)) : 0));
  if (fase !== faseAtual) aplicarFase(fase);
  const pronto = fontes && carregado;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => {});
  }, [pronto]);

  if (!pronto) return <View style={{ flex: 1, backgroundColor: cor.chao }} />;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={temaNav()} key={fase}>
        <StatusBar style={claro() ? "dark" : "light"} />
        <Avisos />
        <BackupAutomatico />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cor.chao }, animation: "fade" }}>
          <Stack.Screen name="panico" options={{ presentation: "fullScreenModal", animation: "fade" }} />
          <Stack.Screen name="treino/[letra]" options={{ gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
