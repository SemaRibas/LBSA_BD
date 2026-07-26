import { Colecao, Material } from "@/types";
import { Slide } from "@/components/ui/Smooth3DSlideshow";

// SVG Data URL for default Search (Lupa) icon - Coleções
const DEFAULT_COLECAO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%230f172a"/><circle cx="360" cy="270" r="110" stroke="%230d9488" stroke-width="22" fill="none"/><line x1="440" y1="350" x2="550" y2="460" stroke="%230d9488" stroke-width="26" stroke-linecap="round"/><text x="400" y="530" font-family="sans-serif" font-size="28" font-weight="bold" fill="%232dd4bf" text-anchor="middle">COLEÇÃO SISTEMÁTICA</text></svg>`;

// SVG Data URL for default PackageOpen (Caixa aberta) icon - Materiais
const DEFAULT_MATERIAL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%230f172a"/><path d="M200 240 L400 140 L600 240 L400 340 Z" stroke="%23d97706" stroke-width="20" fill="none"/><path d="M200 240 L200 460 L400 560 L400 340" stroke="%23d97706" stroke-width="20" fill="none"/><path d="M600 240 L600 460 L400 560" stroke="%23d97706" stroke-width="20" fill="none"/><text x="400" y="90" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23fbbf24" text-anchor="middle">INVENTÁRIO / MATERIAL</text></svg>`;

export function colecoesToSlides(colecoes: Colecao[]): Slide[] {
  if (!colecoes || colecoes.length === 0) return [];

  return colecoes.map((c) => {
    const titleText = `${c.numeroTombo}\n${c.identificacaoBasica}`;
    const taxo = [c.filo, c.classe].filter((t) => t && t !== "-").join(" > ");
    const subtitleText = taxo ? `Taxonomia: ${taxo}` : `Local: ${c.localidade || "Não informada"}`;
    const imgSrc = c.imagemUrl && c.imagemUrl.trim() !== "" ? c.imagemUrl : DEFAULT_COLECAO_SVG;

    return {
      id: c.id,
      image: {
        src: imgSrc,
        alt: `${c.numeroTombo} - ${c.identificacaoBasica}`,
      },
      title: titleText,
      subtitle: subtitleText,
      badge: `Exemplares: ${c.numeroExemplares || "1"} | ${c.status || "Ativo"}`,
      itemData: c,
    };
  });
}

export function materiaisToSlides(materiais: Material[]): Slide[] {
  if (!materiais || materiais.length === 0) return [];

  return materiais.map((m) => {
    const titleText = `${m.material}\nQtd: ${m.quantidade}`;
    const subtitleText = m.observacoes && m.observacoes !== "-" ? m.observacoes : `Validade: ${m.validade || "Indeterminada"}`;
    const imgSrc = m.imagemUrl && m.imagemUrl.trim() !== "" ? m.imagemUrl : DEFAULT_MATERIAL_SVG;

    return {
      id: m.id,
      image: {
        src: imgSrc,
        alt: m.material,
      },
      title: titleText,
      subtitle: subtitleText,
      badge: `Estado: ${m.estado}`,
      itemData: m,
    };
  });
}

export function getColecaoImage(c: Colecao): string {
  return c.imagemUrl && c.imagemUrl.trim() !== "" ? c.imagemUrl : DEFAULT_COLECAO_SVG;
}

export function getColecaoImages(c: Colecao) {
  const mainImg = c.imagemUrl && c.imagemUrl.trim() !== "" ? c.imagemUrl : DEFAULT_COLECAO_SVG;
  return [{ image: { src: mainImg, alt: `${c.numeroTombo} - ${c.identificacaoBasica}` } }];
}

export function getMaterialImage(m: Material): string {
  return m.imagemUrl && m.imagemUrl.trim() !== "" ? m.imagemUrl : DEFAULT_MATERIAL_SVG;
}

export function getMaterialImages(m: Material) {
  const mainImg = m.imagemUrl && m.imagemUrl.trim() !== "" ? m.imagemUrl : DEFAULT_MATERIAL_SVG;
  return [{ image: { src: mainImg, alt: m.material } }];
}
