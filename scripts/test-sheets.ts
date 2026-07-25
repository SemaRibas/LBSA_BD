import { getSheet } from "../src/lib/excel";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  try {
    console.log("Testando busca de Materiais...");
    const mat = await getSheet("Materiais");
    console.log("Materiais encontrados:", mat.rows.length);
    console.log("Primeiro material:", mat.rows[0]);

    console.log("\nTestando busca de Colecoes...");
    const col = await getSheet("Colecoes");
    console.log("Colecoes encontradas:", col.rows.length);
    console.log("Primeira colecao:", col.rows[0]);
  } catch (err) {
    console.error("Erro no teste:", err);
  }
}

test();
