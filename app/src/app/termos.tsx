import { TERMOS } from "../lib/legal";
import { Documento } from "../ui/documento";

export default function Termos() {
  return <Documento titulo="Termos de uso" secoes={TERMOS} />;
}
