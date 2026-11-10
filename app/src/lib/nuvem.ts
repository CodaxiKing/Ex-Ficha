import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { type Dados, dadosDe, useApp } from "../store";

/**
 * Conta e backup no Supabase. As chaves vêm do .env (veja .env.example e supabase/schema.sql).
 * Sem as chaves, o app funciona normal e só a tela de conta avisa que falta configurar.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const nuvemConfigurada = !!URL && !!CHAVE;

export const supabase: SupabaseClient | null = nuvemConfigurada
  ? createClient(URL!, CHAVE!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === "web",
      },
    })
  : null;

export async function sessaoAtual(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

const ERROS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha errados.",
  "User already registered": "Esse e-mail já tem conta. Entra com ele.",
  "Email not confirmed": "Confirma o e-mail primeiro (olha a caixa de entrada).",
};

export function traduzirErro(msg: string): string {
  return ERROS[msg] ?? (msg.toLowerCase().includes("password") ? "A senha precisa de pelo menos 8 caracteres." : `Não deu certo: ${msg}`);
}

export async function criarConta(email: string, senha: string, apelido: string): Promise<{ erro?: string; confirmar?: boolean }> {
  if (!supabase) return { erro: "Conta ainda não configurada." };
  const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { apelido } } });
  if (error) return { erro: traduzirErro(error.message) };
  return { confirmar: !data.session };
}

export async function entrar(email: string, senha: string): Promise<{ erro?: string }> {
  if (!supabase) return { erro: "Conta ainda não configurada." };
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  return error ? { erro: traduzirErro(error.message) } : {};
}

export async function sair() {
  await supabase?.auth.signOut();
}

/** As fotos não vão pra nuvem: ficam só no aparelho. */
function paraNuvem(d: Dados): Dados {
  return { ...d, fotos: [], sessao: null };
}

export async function fazerBackup(): Promise<{ erro?: string }> {
  const s = await sessaoAtual();
  if (!supabase || !s) return { erro: "Entra na conta primeiro." };
  const dados = paraNuvem(dadosDe(useApp.getState()));
  const { error } = await supabase.from("backups").upsert({ user_id: s.user.id, dados, atualizado_em: new Date().toISOString() });
  if (error) return { erro: `Backup falhou: ${error.message}` };
  useApp.getState().marcarBackup();
  return {};
}

export async function lerBackup(): Promise<{ dados?: Dados; quando?: string; erro?: string }> {
  const s = await sessaoAtual();
  if (!supabase || !s) return { erro: "Entra na conta primeiro." };
  const { data, error } = await supabase.from("backups").select("dados, atualizado_em").eq("user_id", s.user.id).maybeSingle();
  if (error) return { erro: error.message };
  if (!data) return {};
  return { dados: data.dados as Dados, quando: data.atualizado_em as string };
}

/** Restaura o backup mantendo as fotos deste aparelho. */
export async function restaurarBackup(): Promise<{ erro?: string; vazio?: boolean }> {
  const r = await lerBackup();
  if (r.erro) return { erro: r.erro };
  if (!r.dados) return { vazio: true };
  const fotos = useApp.getState().fotos;
  useApp.getState().restaurar({ ...r.dados, fotos });
  return {};
}
