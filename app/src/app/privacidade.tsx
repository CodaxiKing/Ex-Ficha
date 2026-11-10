import { PRIVACIDADE } from "../lib/legal";
import { Documento } from "../ui/documento";

export default function Privacidade() {
  return <Documento titulo="Política de privacidade" secoes={PRIVACIDADE} />;
}
