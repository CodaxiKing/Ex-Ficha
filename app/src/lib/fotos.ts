import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

/**
 * Escolhe ou tira uma foto e guarda uma cópia na pasta do app (fica no aparelho).
 * Devolve o endereço da cópia, ou null se a pessoa desistiu.
 */
export async function pegarFoto(origem: "camera" | "galeria"): Promise<string | null> {
  const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [3, 4], quality: 0.7 };
  if (origem === "camera") {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) return null;
  }
  const r = origem === "camera" ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);
  if (r.canceled || !r.assets[0]) return null;
  const uri = r.assets[0].uri;
  if (Platform.OS === "web") return uri; // no navegador a foto já vem embutida (data:)

  const pasta = new Directory(Paths.document, "fotos");
  if (!pasta.exists) pasta.create({ intermediates: true, idempotent: true });
  const destino = new File(pasta, `${Date.now()}.jpg`);
  new File(uri).copy(destino);
  return destino.uri;
}

export function apagarArquivo(uri: string) {
  if (Platform.OS === "web" || uri.startsWith("data:")) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // já não existe
  }
}
