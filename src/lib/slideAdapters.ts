import { Colecao, Material } from "@/types"
import { Slide } from "@/components/ui/Smooth3DSlideshow"

export const COLECAO_IMAGES = [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop", // Flasks / Jars
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop", // Biology Lab
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop", // Vials
    "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=800&auto=format&fit=crop", // Insect / Nature
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop", // Coastal specimen
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop", // Aquatic sample
]

export const MATERIAL_IMAGES = [
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=800&auto=format&fit=crop", // Microscope
    "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop", // Reagents / Alcohol
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop", // Computer / Tech
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop", // Field tools
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop", // Glassware
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop", // Precision tools
]

export function getColecaoImage(colecao: Partial<Colecao>, index: number = 0): string {
    if (colecao.imagemUrl) return colecao.imagemUrl
    return COLECAO_IMAGES[index % COLECAO_IMAGES.length]
}

export function getMaterialImage(material: Partial<Material>, index: number = 0): string {
    if (material.imagemUrl) return material.imagemUrl
    return MATERIAL_IMAGES[index % MATERIAL_IMAGES.length]
}

export function colecoesToSlides(colecoes: Colecao[]): Slide[] {
    if (!colecoes || colecoes.length === 0) return []

    return colecoes.map((c, index) => {
        const titleText = `${c.numeroTombo}\n${c.identificacaoBasica}`
        const taxo = [c.filo, c.classe].filter((t) => t && t !== "-").join(" > ")
        const subtitleText = taxo ? `Taxonomia: ${taxo}` : `Local: ${c.localidade || "Não informada"}`
        const imgSrc = getColecaoImage(c, index)

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
        }
    })
}

export function materiaisToSlides(materiais: Material[]): Slide[] {
    if (!materiais || materiais.length === 0) return []

    return materiais.map((m, index) => {
        const titleText = `${m.material}\nQtd: ${m.quantidade}`
        const subtitleText = m.observacoes && m.observacoes !== "-" ? m.observacoes : `Validade: ${m.validade || "Indeterminada"}`
        const imgSrc = getMaterialImage(m, index)

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
        }
    })
}
