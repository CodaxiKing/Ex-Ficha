/**
 * Banco de frases do Ex-Ficha.
 * Cada frase tem um nível: L (leve), M (médio) ou S (sem dó).
 * Marcadores: {ela} {dela} {Ela} viram ela/ele/essa pessoa; {nome} vira o apelido.
 * O sorteio evita repetir as frases vistas recentemente (ver sorteio.ts).
 */
export type Nivel = "L" | "M" | "S";
export type Frase = [Nivel, string];

export type Situacao =
  | "acordar"
  | "faltou"
  | "descanso"
  | "fim"
  | "recorde"
  | "panico"
  | "panicoInsiste"
  | "panicoVenceu"
  | "noite"
  | "fimDeSemana"
  | "hoje"
  | "hojeTreinou"
  | "fichaVencendo"
  | "fichaNova"
  | "diarioMorto"
  | "diarioMal"
  | "diarioIndo"
  | "diarioBem"
  | "diarioBruto"
  | "medidas"
  | "foto"
  | "voltou";

export const BANCO: Record<Situacao, Frase[]> = {
  acordar: [
    ["L", "Bom dia. O dia é seu, não {dela}."],
    ["M", "{Ela} tá dormindo. Você vai dormir também? Levanta."],
    ["S", "{Ela} tá dormindo de conchinha. Você tá de conchinha com o travesseiro. Levanta."],
    ["L", "A academia abre antes da sua vontade. Vai mesmo assim."],
    ["M", "Ninguém vai te mandar bom dia. A barra vai te esperar."],
    ["S", "Acordou pensando {nela}? Usa isso no agachamento."],
    ["L", "Café, água e treino. Nessa ordem."],
    ["M", "Ficar na cama não traz ninguém de volta. Treinar também não, mas pelo menos você treinou."],
    ["S", "O despertador tocou três vezes. {Ela} não ligou nenhuma. Levanta."],
    ["M", "Todo dia é dia de perna. Principalmente hoje."],
    ["L", "Novo dia, mesma ficha. A ficha é fiel."],
    ["M", "Primeira coisa que você vê de manhã não é o story {dela}. É o treino de hoje."],
    ["S", "O lado {dela} da cama tá vazio. O banco do supino também. Escolhe um pra ocupar."],
    ["L", "Levanta devagar. Mas levanta."],
    ["M", "O sol nasceu. Sua vontade ainda não. Vai sem ela, você já tá acostumado."],
    ["S", "Você não precisa de bom dia {dela}. Precisa de proteína e de vergonha na cara."],
    ["L", "Hoje conta. Ontem já foi."],
    ["M", "A playlist de sofrência pode tocar. Desde que seja no caminho da academia."],
    ["S", "{Ela} acordou bem. Você vai acordar como? Decide no supino."],
    ["M", "Escova os dentes, toma água, abre o app. Não abre a conversa."],
    ["L", "Hoje tem treino {treino}. Ele não vai se fazer sozinho."],
    ["S", "Você passou anos acordando por alguém. Acorda por você, que pelo menos aparece."],
  ],
  faltou: [
    ["L", "Um dia sem treino acontece. Dois vira hábito."],
    ["M", "Dois dias sem treinar. Tá esperando {ela} voltar ou o shape?"],
    ["S", "Três dias parado. Até a fila do banco andou mais que você."],
    ["L", "Ontem não rolou. Hoje rola."],
    ["M", "Sua ficha tá com saudade. Pelo menos alguém tá."],
    ["S", "Faltou de novo. O sofá não vai te pedir em namoro."],
    ["M", "A academia não manda mensagem perguntando onde você tá. Eu mando."],
    ["L", "Falta não apaga o que você já fez. Volta hoje."],
    ["S", "Você sumiu da academia sem explicação. Você conhece essa sensação."],
    ["M", "Seu streak morreu. Igual a outras coisas. Recomeça."],
    ["L", "O treino {treino} ainda tá aqui. Ele não foi embora."],
    ["M", "Hoje não teve treino. Teve o quê? Story {dela}?"],
    ["S", "Você foi largado uma vez. Não larga a ficha também."],
    ["L", "Ainda dá tempo hoje. Vinte minutos já valem."],
    ["M", "A barra não guarda rancor. Mas também não te espera pra sempre."],
    ["S", "Dia sem treino é dia em que {ela} ganhou. Vai deixar?"],
    ["M", "Ghostou a academia. Você sabe como é do outro lado."],
    ["L", "Cansado? Faz o aquecimento. Se depois quiser ir embora, vai."],
    ["S", "A única coisa que tá crescendo é a sua lista de desculpas."],
    ["M", "O app não vai implorar. Mas vai lembrar amanhã também."],
  ],
  descanso: [
    ["L", "Descanso. Respira. Não é hora de pensar {nela}."],
    ["M", "Descanso. Não é pra abrir o Instagram {dela}."],
    ["S", "Não dá tempo de stalkear e voltar. Nem tenta."],
    ["L", "Bebe água. Hidratação também é amor-próprio."],
    ["M", "Esse celular na sua mão não é pra {ela}. É o timer."],
    ["S", "Ninguém lá está pensando em você. Próxima série."],
    ["L", "Mais um pouco e volta. Você aguenta."],
    ["M", "A carga não vai se levantar sozinha enquanto você rola o feed."],
    ["S", "{Ela} visualizou e não respondeu? A próxima série responde."],
    ["M", "Descansa o músculo. Não o propósito."],
    ["L", "Solta os ombros. A próxima é melhor."],
    ["M", "Se for olhar o celular, olha o cronômetro."],
    ["S", "Esse tempo é pra recuperar o músculo, não a relação."],
    ["L", "Respira fundo. Quatro segundos pra dentro, quatro pra fora."],
    ["M", "Não abre o WhatsApp. Eu tô vendo."],
    ["S", "O 'digitando…' que você espera não vem. A série vem."],
    ["L", "Você tá indo bem. Sério."],
    ["M", "Pensou {nela}? Normal. Agora pensa na próxima série."],
    ["S", "Você descansa mais entre séries do que {ela} demorou pra te esquecer."],
    ["M", "Seca o banco, ajusta a pegada, volta."],
    ["S", "O espelho da academia é o único que ainda te acha interessante. Dá motivo."],
    ["L", "Faltam {faltam} séries. Uma de cada vez."],
  ],
  fim: [
    ["L", "Treino pago. Orgulho de você."],
    ["M", "Mais uma série que {ela} não vai ver. Mas o espelho vai."],
    ["S", "Mais peso do que {ela} carregou nessa relação."],
    ["L", "Fechou o treino. Um dia de cada vez."],
    ["M", "Suado, cansado e sem mandar mensagem. Dia perfeito."],
    ["S", "Você treinou. {Ela} postou story. Adivinha quem evoluiu."],
    ["L", "Cada treino é um tijolo. Tá subindo."],
    ["M", "Hoje você escolheu você. Repete amanhã."],
    ["S", "Terminou o treino antes de terminar de sofrer. Recorde."],
    ["M", "Vai pro banho. Hoje você merece a água quente inteira."],
    ["L", "Isso aqui ninguém leva embora na mudança."],
    ["M", "Treino pago. Diferente de certas promessas."],
    ["S", "{Ela} levou as coisas. O volume de hoje ficou com você."],
    ["L", "Feito. Agora come direito e dorme."],
    ["M", "Esse cansaço é do bom. Diferente do outro."],
    ["S", "Você levantou mais hoje do que {ela} levantou a voz pra te defender."],
    ["M", "Mais um treino no histórico. Esse histórico ninguém apaga."],
    ["S", "Se {ela} perguntar como você tá: ocupado. Treinando."],
  ],
  recorde: [
    ["L", "Novo recorde. Isso é seu, ninguém leva."],
    ["M", "Novo recorde. {Ela} perdeu isso aqui."],
    ["S", "Tem gente que troca de pessoa. Você trocou de carga."],
    ["L", "Pequeno pra barra, grande pra você."],
    ["M", "A carga subiu. A autoestima foi junto."],
    ["S", "Você tá mais forte do que quando estava com {ela}. Literalmente. Tá no gráfico."],
    ["L", "Recorde batido. Anota a data."],
    ["M", "Recorde pós-término. O melhor tipo de recorde."],
    ["S", "{Ela} ficou com a senha do streaming. Você ficou com o recorde."],
    ["M", "Carga nova. Vida nova. Mesma camiseta suada."],
  ],
  panico: [
    ["L", "Respira. A vontade passa. Quase sempre passa na décima."],
    ["M", "Se depois de 20 flexões ainda quiser mandar, faz mais 20."],
    ["S", "Ninguém responde às 3 da manhã. A barra responde."],
    ["L", "Sentir saudade tá tudo bem. Mandar 'oi sumida' não."],
    ["M", "A mensagem fica no rascunho. O peitoral fica com você."],
    ["S", "'Só queria saber se você tá bem.' Não queria não. Flexão."],
    ["S", "{Ela} esperou você mandar? Não. Então espera também."],
    ["L", "Cada flexão é uma mensagem que você não mandou."],
    ["M", "O teclado pode esperar. O chão tá aqui."],
    ["S", "Você vai mandar textão pra quem te mandou embora? Desce."],
    ["M", "Conta as flexões em voz alta. Abafa o pensamento."],
    ["L", "Não precisa resolver nada agora. Só as próximas vinte."],
    ["S", "Se {ela} quisesse falar com você, o celular {dela} funciona."],
    ["M", "Bloqueado por vinte flexões. Depois a gente conversa."],
  ],
  panicoInsiste: [
    ["M", "Lê em voz alta antes de mandar. Ainda parece boa ideia?"],
    ["S", "Você leu e ainda acha uma boa ideia? Então faz mais vinte e lê de novo."],
    ["L", "Tudo bem querer. Esperar até amanhã cedo também é uma opção."],
    ["S", "Mensagem de madrugada não volta. Print também não."],
    ["M", "Se a resposta for o silêncio, você aguenta? Pensa antes."],
    ["S", "Você não quer conversar. Quer ser lembrado. A barra lembra de você toda vez."],
  ],
  panicoVenceu: [
    ["L", "Passou. Mensagem não enviada: mais um ponto de dignidade."],
    ["M", "Rascunho apagado. Ninguém precisa saber."],
    ["S", "Vinte flexões e zero vergonha amanhã. Bom negócio."],
    ["L", "Viu? Passou. Passa sempre."],
    ["M", "Mais uma crise vencida. O placar tá do seu lado."],
    ["S", "{Ela} nem soube que você quase mandou. E nunca vai saber."],
  ],
  noite: [
    ["L", "Noite tranquila. Amanhã você acorda mais forte."],
    ["M", "Hora perigosa. Deixa o celular longe da cama."],
    ["S", "Bebeu? Não manda nada. Bebe água e vai dormir."],
    ["S", "A playlist de sofrência acabou. Coloca a de treino."],
    ["L", "Dorme cedo. Amanhã tem treino {treino}."],
    ["M", "Se bater a vontade de mandar mensagem, o botão de pânico tá aqui."],
    ["S", "Se o plano da noite é chorar no banho, pelo menos faz panturrilha em pé."],
    ["M", "Celular carregando longe da cama. Você também precisa recarregar."],
    ["L", "Oito horas de sono valem mais que oito stories."],
    ["S", "Ninguém manda 'tá acordado?' por um bom motivo. Dorme."],
  ],
  fimDeSemana: [
    ["L", "Fim de semana. Dorme bem e treina sem pressa."],
    ["M", "Sábado sem plano? Sábado de perna."],
    ["M", "Rolê cancelado? Treino confirmado."],
    ["L", "Domingo é dia da foto da semana. Capricha."],
    ["S", "{Ela} tá num rolê. Você tá num leg press. Só um dos dois vai lembrar disso com orgulho."],
    ["M", "Fim de semana sem {ela}. E com treino. Combinação nova."],
    ["S", "Sexta à noite e você aqui. Pelo menos faz valer: treino amanhã às oito."],
  ],
  hoje: [
    ["L", "O luto passa. O shape também, se você deixar."],
    ["M", "Cada dia treinado é um dia que {ela} não decidiu por você."],
    ["L", "A ficha não te largou. Não larga ela."],
    ["M", "Você tá contando os dias. Faz eles contarem também."],
    ["S", "{Ela} seguiu em frente. Você segue a ficha."],
    ["L", "Um treino por dia. Só isso por hoje."],
    ["S", "Você não perdeu {ela}. Perdeu o peso morto. Agora pega peso de verdade."],
    ["M", "O contador sobe sozinho. O resto depende de você."],
    ["S", "Ninguém vai te salvar. Ainda bem que você sabe fazer supino."],
    ["L", "Devagar também chega."],
    ["M", "Hoje você pode sentir saudade e treinar. Uma coisa não impede a outra."],
    ["S", "{Ela} trocou você. Você troca a carga. Quem sai ganhando?"],
  ],
  hojeTreinou: [
    ["L", "Treino de hoje pago. Agora é comer e dormir."],
    ["M", "Hoje já foi. {Ela} que lute."],
    ["S", "Treinou. Não mandou mensagem. Tá virando outra pessoa."],
    ["L", "Feito por hoje. Amanhã tem mais."],
    ["M", "Treino feito. Se bater saudade, já sabe onde fica o botão."],
  ],
  fichaVencendo: [
    ["L", "Sua ficha vence em {dias} dias. Já pensa na próxima."],
    ["M", "Faltam {dias} dias pra ficha vencer. Trocou de vida? Troca de ficha."],
    ["S", "A ficha tá velha. Igual aquela foto de vocês dois que você ainda não apagou."],
    ["M", "Ficha vencendo. Diferente do relacionamento, essa a gente renova."],
  ],
  fichaNova: [
    ["L", "Ficha nova. Começo novo."],
    ["M", "Ficha trocada. Era isso que faltava trocar."],
    ["S", "{Ela} te trocou primeiro. Agora você troca tudo: começou pela ficha."],
  ],
  diarioMorto: [
    ["L", "Obrigado por contar. Hoje pode ser só o básico: água, comida e dormir."],
    ["L", "Dia pesado. Não precisa treinar pesado. Precisa se cuidar."],
    ["L", "Anotado. Se apertar, o CVV atende no 188, a qualquer hora."],
  ],
  diarioMal: [
    ["L", "Dia ruim também conta. Um treino leve pode ajudar."],
    ["M", "Mal hoje. Amanhã é outro dia, e outro treino."],
    ["L", "Tá tudo bem não estar bem. Só não some."],
    ["M", "Anotado. Um aquecimento de dez minutos já muda o dia."],
  ],
  diarioIndo: [
    ["L", "Indo já é ir. Bora com isso pro treino."],
    ["M", "Indo. Igual carga nova: no começo pesa, depois acostuma."],
    ["M", "Nem bem, nem mal. A ficha resolve o resto."],
  ],
  diarioBem: [
    ["L", "Bom dia, de verdade. Guarda isso."],
    ["M", "Bem? Olha só. Nem precisou {dela}."],
    ["S", "Tá bem e {ela} nem sabe. Melhor assim."],
  ],
  diarioBruto: [
    ["M", "Bruto. Hoje a barra que se cuide."],
    ["S", "Modo bruto ligado. Se {ela} te visse agora… não importa."],
    ["L", "Dia bom. Aproveita pra bater um recorde."],
  ],
  medidas: [
    ["L", "Medida anotada. O corpo muda devagar, mas muda."],
    ["M", "Cintura caindo, braço subindo. A direção é essa."],
    ["S", "O pote de sorvete das 23h está indo embora."],
    ["M", "Número novo. Esse ninguém consegue curtir e desfazer."],
  ],
  foto: [
    ["L", "Foto da semana guardada. Só você vê."],
    ["M", "Daqui a um mês você vai agradecer por essa foto."],
    ["S", "Essa foto não vai pro story. Vai pro antes e depois."],
  ],
  voltou: [
    ["L", "Voltou. A ficha te esperou."],
    ["M", "Sumiu uns dias, mas voltou. Diferente de certas pessoas."],
    ["S", "Achei que tinha te perdido também. Bora, treino {treino}."],
  ],
};

/** Marcos de dias desde o fim, para a Hoje e as notificações. */
export const MARCOS: Record<number, Frase[]> = {
  1: [["L", "Dia 1. O mais difícil é esse."]],
  7: [["M", "7 dias. Uma semana sem {ela} e com treino."], ["L", "Uma semana. Sobreviveu. Agora vive."]],
  14: [["S", "14 dias. Você nem lembra mais a senha do streaming {dela}. Ótimo."], ["M", "Duas semanas. Já dá pra notar a diferença na carga."]],
  21: [["L", "21 dias. Dizem que é o tempo de criar um hábito."]],
  30: [["M", "30 dias. Um mês inteiro escolhendo você."], ["S", "30 dias. Antes você media o tempo pelo último 'oi'. Agora mede em séries."]],
  60: [["L", "60 dias. Olha a foto do dia 1. Olha agora."]],
  90: [["M", "90 dias. {Ela} virou passado. O shape virou presente."]],
  100: [["S", "100 dias. Se {ela} te visse agora... não importa. Você se vê."]],
  180: [["M", "Seis meses. Você não é mais quem {ela} deixou."]],
  365: [["L", "Um ano. Isso aqui não é mais sobre {ela}."]],
};

/** Frases do modo calmo: sem zoeira, sem citar a pessoa. */
export const CALMO = [
  "Hoje sem zoeira. Um passo de cada vez.",
  "Um treino leve de 20 minutos, se você quiser. Se não, tudo bem também.",
  "Comer, beber água e dormir já é bastante hoje.",
  "Você não precisa dar conta de tudo hoje.",
  "Se apertar, liga pro CVV no 188. A qualquer hora.",
  "Uma caminhada curta também conta.",
];
