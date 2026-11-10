/**
 * Política de privacidade e termos de uso do Ex-Ficha.
 * Fonte única: o app mostra estes textos e `npm run legal` gera docs/privacidade.md e
 * docs/termos.md (para publicar num link, que as lojas pedem).
 *
 * ANTES DE PUBLICAR: preencha RESPONSAVEL e revise com um advogado.
 */
export const RESPONSAVEL = {
  nome: "[NOME OU RAZÃO SOCIAL DO RESPONSÁVEL]",
  documento: "[CPF OU CNPJ]",
  email: "[E-MAIL DE CONTATO]",
  encarregado: "[NOME E E-MAIL DO ENCARREGADO DE DADOS]",
};

export const VIGENCIA = "10 de novembro de 2026";
/** Sobe quando o texto muda de um jeito que precise de novo aceite. */
export const VERSAO_TERMOS = 1;

export type Secao = { titulo: string; paragrafos: string[] };

export const PRIVACIDADE: Secao[] = [
  {
    titulo: "Resumo",
    paragrafos: [
      "O Ex-Ficha guarda seus dados no seu aparelho. Nada sai dele a menos que você crie uma conta para fazer backup. Não vendemos dados, não mostramos anúncios e não usamos ferramentas de rastreamento de terceiros.",
      "Alguns dados que você registra no app são dados de saúde (humor, peso, medidas, fotos do corpo e dieta). Pela Lei Geral de Proteção de Dados (LGPD), eles são dados pessoais sensíveis e só são tratados com o seu consentimento.",
    ],
  },
  {
    titulo: "Quem é o responsável",
    paragrafos: [
      `O controlador dos dados é ${RESPONSAVEL.nome}, ${RESPONSAVEL.documento}. Contato: ${RESPONSAVEL.email}. Encarregado pelo tratamento de dados pessoais: ${RESPONSAVEL.encarregado}.`,
    ],
  },
  {
    titulo: "Quais dados e onde ficam",
    paragrafos: [
      "No seu aparelho: o perfil (apelido, se foi ela, ele ou prefere não dizer, a data do término, o objetivo e o nível de sofrência), a ficha, os treinos, as cargas e os recordes, o diário (humor e texto), as medidas, as fotos de evolução, os dados da dieta (sexo para o cálculo, idade, altura e peso), o placar do botão de pânico e as suas preferências.",
      "Na nuvem, só se você criar uma conta: o e-mail, a senha (guardada pelo provedor de forma protegida, nunca em texto puro), o apelido e uma cópia de segurança dos dados acima, exceto as fotos, que nunca saem do aparelho.",
      "Na assinatura premium: a compra é feita pela App Store ou pelo Google Play. A RevenueCat, que gerencia a assinatura, recebe um identificador do app e o histórico de compras. Nós não recebemos os dados do seu cartão.",
      "Os lembretes são notificações agendadas no próprio aparelho. Não usamos servidor de notificações.",
      "Não coletamos sua localização, seus contatos ou suas mensagens. O botão de pânico não lê nem envia nada: ele só conta flexões.",
    ],
  },
  {
    titulo: "Para que usamos",
    paragrafos: [
      "Para o app funcionar: montar e ajustar a ficha, contar os dias, mostrar sua evolução, calcular a dieta, escolher as frases e os lembretes, ativar o modo sério quando o diário indicar que você não está bem, e fazer o backup, se você quiser.",
      "Não usamos seus dados para publicidade, para traçar perfil para terceiros, nem para treinar modelos de inteligência artificial.",
    ],
  },
  {
    titulo: "Bases legais (LGPD)",
    paragrafos: [
      "Dados de saúde (diário, peso, medidas, fotos e dieta): consentimento específico e destacado, dado no começo do uso (art. 11, I). Você pode retirar a qualquer momento apagando os dados no app.",
      "Conta, backup e assinatura: execução do contrato que você aceita ao usar o app (art. 7º, V).",
      "Registros de compra: cumprimento de obrigação legal (art. 7º, II).",
    ],
  },
  {
    titulo: "Com quem compartilhamos",
    paragrafos: [
      "Só com quem é necessário para o app funcionar, que atuam como operadores e seguem nossas instruções: Supabase (hospedagem da conta e do backup), RevenueCat (gestão da assinatura) e Apple ou Google (loja e pagamento).",
      "Esses serviços podem guardar dados em servidores fora do Brasil. Nesse caso, a transferência segue o art. 33 da LGPD, com contratos que exigem proteção equivalente.",
      "Também podemos compartilhar dados se a lei ou uma ordem judicial exigir.",
    ],
  },
  {
    titulo: "Por quanto tempo",
    paragrafos: [
      "No aparelho: até você apagar (Perfil > Apagar meus dados) ou desinstalar o app.",
      "Na nuvem: enquanto a conta existir. Ao excluir a conta, a conta e o backup são apagados na hora. Registros de compra ficam com a loja e a RevenueCat pelo prazo que a lei exigir.",
    ],
  },
  {
    titulo: "Seus direitos",
    paragrafos: [
      "Pela LGPD (art. 18), você pode pedir: confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre com quem compartilhamos e a revogação do consentimento.",
      "No próprio app: corrija tudo no Perfil e nas telas de cada recurso; apague o que está no aparelho em Perfil > Apagar meus dados; exclua a conta e o backup em Perfil > Conta e backup > Excluir conta.",
      `Para o resto, escreva para ${RESPONSAVEL.email}. Respondemos em até 15 dias. Você também pode reclamar na Autoridade Nacional de Proteção de Dados (ANPD).`,
    ],
  },
  {
    titulo: "Segurança",
    paragrafos: [
      "Os dados no aparelho ficam na área privada do app, protegida pelo sistema. A comunicação com a nuvem usa conexão criptografada (HTTPS), e cada conta só consegue ler o próprio backup.",
      "Nenhum sistema é 100% seguro. Se acontecer um incidente que possa te causar dano relevante, avisamos você e a ANPD.",
    ],
  },
  {
    titulo: "Idade mínima",
    paragrafos: ["O Ex-Ficha é para maiores de 18 anos. Não coletamos dados de menores de idade de propósito; se soubermos de um caso, apagamos."],
  },
  {
    titulo: "Saúde mental",
    paragrafos: [
      "O Ex-Ficha não é um serviço de saúde. Se você estiver mal, ligue para o CVV no 188 (24 horas, de graça) ou converse pelo chat em cvv.org.br. Em emergência, ligue 192 (SAMU).",
    ],
  },
  {
    titulo: "Mudanças nesta política",
    paragrafos: [`Esta versão vale desde ${VIGENCIA}. Se mudarmos algo importante, avisamos no app antes de valer.`],
  },
];

export const TERMOS: Secao[] = [
  {
    titulo: "Aceite",
    paragrafos: [
      `Estes termos são um contrato entre você e ${RESPONSAVEL.nome}, ${RESPONSAVEL.documento}. Ao usar o Ex-Ficha, você concorda com eles e com a Política de Privacidade. Se não concordar, não use o app.`,
    ],
  },
  {
    titulo: "Quem pode usar",
    paragrafos: ["Maiores de 18 anos. Você é responsável pelas informações que coloca no app e por manter sua senha em segredo."],
  },
  {
    titulo: "O que o app é, e o que não é",
    paragrafos: [
      "O Ex-Ficha é um app de treino com humor ácido para quem saiu de um relacionamento: ficha, contador de dias, diário, dieta básica, botão de pânico e lembretes.",
      "Não é aconselhamento médico, nutricional, psicológico ou de educação física. As fichas, cargas e calorias são estimativas genéricas. Antes de começar a treinar ou mudar a alimentação, principalmente se você tem alguma condição de saúde, procure um profissional. Pare o exercício se sentir dor, tontura ou falta de ar.",
      "As frases são humor. Você escolhe o nível (Leve, Médio ou Sem dó) e pode pausar a zoeira. Se o diário mostrar três dias seguidos de \"Morto\", o app entra no modo sério e mostra onde pedir ajuda. Isso não substitui atendimento profissional: em crise, ligue 188 (CVV) ou 192 (SAMU).",
    ],
  },
  {
    titulo: "Premium \"Sem dó\"",
    paragrafos: [
      "O premium é uma assinatura mensal ou anual, com o preço mostrado na loja antes da compra, e pode ter um período grátis de 7 dias.",
      "A cobrança é feita pela App Store ou pelo Google Play e renova sozinha no fim de cada período, a menos que você cancele até 24 horas antes. O cancelamento e os reembolsos seguem as regras da loja e o Código de Defesa do Consumidor; cancele nas assinaturas da sua conta da loja.",
      "Se o período grátis for cancelado antes de acabar, nada é cobrado.",
    ],
  },
  {
    titulo: "Uso aceitável",
    paragrafos: [
      "Não tente invadir, copiar ou burlar o app ou a assinatura, nem usar o app para algo ilegal. Podemos suspender contas que façam isso.",
    ],
  },
  {
    titulo: "Conteúdo e marcas",
    paragrafos: [
      "O app, a marca, as frases e o visual pertencem ao responsável pelo Ex-Ficha. As animações de exercícios vêm do ExerciseDB, as fotos do Pexels e as fontes do Google Fonts, cada um com a sua licença.",
      "O que você escreve e fotografa no app é seu.",
    ],
  },
  {
    titulo: "Disponibilidade e responsabilidade",
    paragrafos: [
      "Fazemos o possível para o app funcionar bem, mas ele pode ter falhas ou ficar fora do ar. Faça backup se não quiser perder seus dados.",
      "Nos limites da lei, não respondemos por lesões causadas por exercícios feitos sem orientação, por decisões tomadas com base nas estimativas do app, nem por mensagens que você mandou apesar do botão de pânico. Nada aqui limita os seus direitos de consumidor.",
    ],
  },
  {
    titulo: "Encerramento",
    paragrafos: ["Você pode parar de usar e excluir sua conta quando quiser, no próprio app. Podemos encerrar o app avisando com antecedência razoável."],
  },
  {
    titulo: "Mudanças e lei aplicável",
    paragrafos: [
      `Esta versão vale desde ${VIGENCIA}. Se mudarmos algo importante, avisamos no app e pedimos um novo aceite.`,
      "Valem as leis do Brasil. O foro é o do seu domicílio.",
      `Contato: ${RESPONSAVEL.email}.`,
    ],
  },
];
