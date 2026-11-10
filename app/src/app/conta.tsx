import type { Session } from "@supabase/supabase-js";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { curta, diaLocal } from "../lib/datas";
import { criarConta, entrar, esqueciSenha, excluirConta, fazerBackup, nuvemConfigurada, restaurarBackup, sair, supabase } from "../lib/nuvem";
import { useApp } from "../store";
import { cor, fonte } from "../theme";
import { Barra, Botao, Card, T, Tela } from "../ui/base";

function Campo({ rotulo, dica, ...p }: TextInputProps & { rotulo: string; dica?: string }) {
  return (
    <View style={{ marginTop: 14 }}>
      <T v="sub" tam={13}>
        {rotulo}
      </T>
      <TextInput
        {...p}
        placeholderTextColor={cor.fraco}
        accessibilityLabel={rotulo}
        style={{
          marginTop: 6,
          height: 52,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: cor.superficie,
          borderWidth: 1,
          borderColor: cor.bordaCampo,
          color: cor.texto,
          fontFamily: fonte.regular,
          fontSize: 15,
        }}
      />
      {dica && (
        <T v="meta" style={{ marginTop: 4 }}>
          {dica}
        </T>
      )}
    </View>
  );
}

function useSessao(): Session | null | undefined {
  const [s, setS] = useState<Session | null | undefined>(supabase ? undefined : null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setS(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, sessao) => setS(sessao));
    return () => data.subscription.unsubscribe();
  }, []);
  return s;
}

export default function Conta() {
  const sessao = useSessao();
  const perfil = useApp((e) => e.perfil);
  const ultimoBackup = useApp((e) => e.ultimoBackup);
  const atualizar = useApp((e) => e.atualizarPerfil);
  const pessoa = perfil?.pessoa ?? "Ela";
  const ela = pessoa === "Ela" ? "ela" : pessoa === "Ele" ? "ele" : "essa pessoa";

  const [modo, setModo] = useState<"entrar" | "criar">("criar");
  const [apelido, setApelido] = useState(perfil?.apelido ?? "");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<{ t: string; erro?: boolean } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [restaurar, setRestaurar] = useState(false);
  const [excluir, setExcluir] = useState(false);

  const rodar = async (f: () => Promise<void>) => {
    setOcupado(true);
    setMsg(null);
    try {
      await f();
    } finally {
      setOcupado(false);
    }
  };

  if (!nuvemConfigurada) {
    return (
      <Tela>
        <Barra titulo="Conta e backup" />
        <T v="gotica" tam={64} style={{ marginTop: 24 }}>
          Entra.
        </T>
        <T v="sub" tam={16} style={{ marginTop: 8 }}>
          Ainda não dá: a conta precisa ser configurada.
        </T>
        <Card style={{ marginTop: 18 }}>
          <T>Seus treinos estão salvos neste aparelho e o app funciona normal sem conta.</T>
          <T v="meta" style={{ marginTop: 8 }}>
            Para quem desenvolve: crie um projeto no Supabase, rode app/supabase/schema.sql e preencha app/.env (veja .env.example).
          </T>
        </Card>
      </Tela>
    );
  }

  if (sessao === undefined) return <Tela>{null}</Tela>;

  if (sessao) {
    return (
      <Tela>
        <Barra titulo="Conta e backup" />
        <Card style={{ marginTop: 10 }}>
          <T v="sub">Conectado como</T>
          <T peso="semi">{sessao.user.email}</T>
          <T v="meta" style={{ marginTop: 6 }}>
            {ultimoBackup ? `Último backup: ${curta(diaLocal(ultimoBackup))}` : "Nenhum backup ainda."} O backup também roda sozinho a cada treino.
          </T>
        </Card>
        {msg && (
          <T c={msg.erro ? cor.pilulaTexto : cor.texto} style={{ marginTop: 12 }} accessibilityLiveRegion="polite">
            {msg.t}
          </T>
        )}
        <Botao
          bloco
          style={{ marginTop: 16 }}
          desativado={ocupado}
          onPress={() =>
            rodar(async () => {
              const r = await fazerBackup();
              setMsg(r.erro ? { t: r.erro, erro: true } : { t: "Backup feito. Treinos, ficha, diário e medidas guardados." });
            })
          }
        >
          {ocupado ? "Um segundo…" : "Fazer backup agora"}
        </Botao>
        <Botao
          tipo="fantasma"
          bloco
          style={{ marginTop: 8, backgroundColor: restaurar ? cor.panico : cor.elevado }}
          desativado={ocupado}
          onPress={() => {
            if (!restaurar) return setRestaurar(true);
            setRestaurar(false);
            rodar(async () => {
              const r = await restaurarBackup();
              setMsg(r.erro ? { t: r.erro, erro: true } : r.vazio ? { t: "Não tem backup nessa conta ainda.", erro: true } : { t: "Backup restaurado." });
            });
          }}
        >
          {restaurar ? "Troca o que está no aparelho. Confirma?" : "Restaurar do backup"}
        </Botao>
        <T v="meta" style={{ marginTop: 10 }}>
          As fotos não vão pra nuvem. Ficam só neste aparelho.
        </T>
        <Botao tipo="texto" style={{ marginTop: 16, alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => sair()}>
          Sair da conta
        </Botao>

        <View style={{ marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: cor.panicoFundo }}>
          <T peso="semi">Excluir conta</T>
          <T v="meta" c={cor.panicoTexto} style={{ marginTop: 2 }}>
            Apaga a conta e o backup na nuvem, na hora e sem volta. O que está neste aparelho continua aqui.
          </T>
          <Botao
            tipo="fantasma"
            style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: excluir ? cor.panico : cor.elevado }}
            desativado={ocupado}
            onPress={() => {
              if (!excluir) return setExcluir(true);
              setExcluir(false);
              rodar(async () => {
                const r = await excluirConta();
                setMsg(r.erro ? { t: r.erro, erro: true } : { t: "Conta excluída. Seus dados do aparelho continuam aqui." });
              });
            }}
          >
            {excluir ? "Toca de novo pra excluir" : "Excluir minha conta"}
          </Botao>
        </View>
      </Tela>
    );
  }

  const valido = /\S+@\S+\.\S+/.test(email) && senha.length >= 8 && (modo === "entrar" || apelido.trim().length > 0);

  return (
    <Tela
      rodape={
        <>
          <Botao
            bloco
            desativado={!valido || ocupado}
            onPress={() =>
              rodar(async () => {
                if (modo === "criar") {
                  const r = await criarConta(email.trim(), senha, apelido.trim());
                  if (r.erro) return setMsg({ t: r.erro, erro: true });
                  atualizar({ apelido: apelido.trim() });
                  setMsg({ t: r.confirmar ? "Conta criada. Confirma pelo link no seu e-mail e depois entra." : "Conta criada." });
                  if (r.confirmar) setModo("entrar");
                } else {
                  const r = await entrar(email.trim(), senha);
                  if (r.erro) setMsg({ t: r.erro, erro: true });
                }
              })
            }
          >
            {ocupado ? "Um segundo…" : modo === "criar" ? "Criar conta" : "Entrar"}
          </Botao>
          <Botao tipo="texto" onPress={() => (setModo(modo === "criar" ? "entrar" : "criar"), setMsg(null))}>
            {modo === "criar" ? "Já tenho conta" : "Criar uma conta"}
          </Botao>
        </>
      }
    >
      <Barra />
      <Image source={require("../../assets/images/logo-icon.png")} style={{ width: 64, height: 64, borderRadius: 14, marginTop: 8 }} accessibilityLabel="Ex-Ficha" />
      <T v="gotica" tam={64} style={{ marginTop: 16 }} accessibilityRole="header">
        {modo === "criar" ? "Cria a conta." : "Entra."}
      </T>
      <T v="sub" tam={16} style={{ marginTop: 6 }}>
        {modo === "criar" ? `Ninguém vê seu nome. Nem ${ela}.` : `${ela[0].toUpperCase()}${ela.slice(1)} saiu. Você entra.`}
      </T>
      {modo === "criar" && <Campo rotulo="Como o app te chama" value={apelido} onChangeText={setApelido} placeholder="Bruto" autoCapitalize="words" maxLength={20} />}
      <Campo rotulo="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Campo
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete={modo === "criar" ? "new-password" : "current-password"}
        dica={modo === "criar" ? "Pelo menos 8 caracteres. Não use a data de namoro." : undefined}
      />
      {msg && (
        <T c={msg.erro ? cor.pilulaTexto : cor.texto} style={{ marginTop: 12 }} accessibilityLiveRegion="polite">
          {msg.t}
        </T>
      )}
      {modo === "entrar" && (
        <Botao
          tipo="texto"
          style={{ alignSelf: "flex-start", paddingHorizontal: 0, marginTop: 4 }}
          onPress={() =>
            rodar(async () => {
              if (!/\S+@\S+\.\S+/.test(email)) return setMsg({ t: "Digita o seu e-mail primeiro.", erro: true });
              const r = await esqueciSenha(email.trim());
              setMsg(r.erro ? { t: r.erro, erro: true } : { t: "Se esse e-mail tiver conta, chega um link pra trocar a senha." });
            })
          }
        >
          Esqueci a senha
        </Botao>
      )}
      <T v="meta" style={{ marginTop: 16 }}>
        A conta só guarda o backup dos seus treinos. Seus dados não vão pra ninguém. Muito menos pra {ela}. Ao criar a conta, você concorda com os{" "}
        <T v="meta" c={cor.texto} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/termos")} accessibilityRole="link">
          Termos de uso
        </T>{" "}
        e a{" "}
        <T v="meta" c={cor.texto} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/privacidade")} accessibilityRole="link">
          Política de privacidade
        </T>
        .
      </T>
    </Tela>
  );
}
