import { Platform } from "react-native";
import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";

import { diaLocal } from "./datas";
import { useApp } from "../store";

/**
 * Assinatura premium pela App Store e pelo Google Play, via RevenueCat.
 * As chaves vêm do .env (veja .env.example). Sem chave, o app mostra os planos,
 * avisa que a compra ainda não está ativa e não cobra nada.
 * Em desenvolvimento (__DEV__), dá pra liberar o premium para testar as telas.
 */
const CHAVE = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID,
  default: undefined,
});
export const ENTITLEMENT = "premium";

export const lojaConfigurada = !!CHAVE;

/** Preço de referência do canvas, mostrado quando a loja não responde. */
export const PRECO = { mensal: 14.9, anual: 89.9 };
export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let iniciado = false;

function aplicar(info: CustomerInfo) {
  const ativo = !!info.entitlements.active[ENTITLEMENT];
  const atual = useApp.getState().premium;
  if (ativo) useApp.getState().definirPremium({ ativo: true, origem: "loja", desde: atual?.desde ?? diaLocal(new Date()) });
  else if (atual?.origem === "loja") useApp.getState().definirPremium(null);
}

/** Liga a loja e sincroniza o status da assinatura. Chamado ao abrir o app. */
export async function iniciarAssinatura() {
  if (!CHAVE || iniciado) return;
  iniciado = true;
  Purchases.configure({ apiKey: CHAVE });
  Purchases.addCustomerInfoUpdateListener(aplicar);
  try {
    aplicar(await Purchases.getCustomerInfo());
  } catch {
    // sem rede: mantém o último status salvo
  }
}

export type Plano = { tipo: "anual" | "mensal"; preco: string; porMes?: string; pacote?: PurchasesPackage };

export async function planos(): Promise<Plano[]> {
  const padrao: Plano[] = [
    { tipo: "anual", preco: brl(PRECO.anual), porMes: brl(PRECO.anual / 12) },
    { tipo: "mensal", preco: brl(PRECO.mensal) },
  ];
  if (!CHAVE) return padrao;
  try {
    const ofertas = await Purchases.getOfferings();
    const pacotes = ofertas.current?.availablePackages ?? [];
    const anual = pacotes.find((p) => p.packageType === Purchases.PACKAGE_TYPE.ANNUAL);
    const mensal = pacotes.find((p) => p.packageType === Purchases.PACKAGE_TYPE.MONTHLY);
    if (!anual && !mensal) return padrao;
    return [
      anual && { tipo: "anual" as const, preco: anual.product.priceString, porMes: anual.product.pricePerMonthString ?? undefined, pacote: anual },
      mensal && { tipo: "mensal" as const, preco: mensal.product.priceString, pacote: mensal },
    ].filter(Boolean) as Plano[];
  } catch {
    return padrao;
  }
}

export async function assinar(plano: Plano): Promise<{ ok?: boolean; cancelou?: boolean; erro?: string }> {
  if (!CHAVE || !plano.pacote) return { erro: "A assinatura ainda não está ativa nesta versão do app." };
  try {
    const r = await Purchases.purchasePackage(plano.pacote);
    aplicar(r.customerInfo);
    return { ok: !!r.customerInfo.entitlements.active[ENTITLEMENT] };
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return { cancelou: true };
    return { erro: "A compra não foi concluída. Nada foi cobrado." };
  }
}

export async function restaurar(): Promise<{ ok: boolean; erro?: string }> {
  if (!CHAVE) return { ok: false, erro: "A assinatura ainda não está ativa nesta versão do app." };
  try {
    const info = await Purchases.restorePurchases();
    aplicar(info);
    return { ok: !!info.entitlements.active[ENTITLEMENT] };
  } catch {
    return { ok: false, erro: "Não deu pra restaurar agora. Tenta de novo." };
  }
}
