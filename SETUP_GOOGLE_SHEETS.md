# Configuracao do Google Sheets como Banco de Dados

## Passo 1: Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a API do Google Sheets:
   - Va em "APIs & Services" > "Library"
   - Busque "Google Sheets API"
   - Clique em "Enable"

## Passo 2: Criar Service Account

1. Va em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "Service Account"
3. Preencha:
   - Nome: `lbsa-sheets`
   - Descricao: `Acesso ao Google Sheets do LBSA`
4. Clique em "Create and Continue"
5. Na permissao, selecione "Editor" (ou "Owner" para testes)
6. Clique em "Done"

## Passo 3: Gerar chave da Service Account

1. Clique na service account criada
2. Va na aba "Keys"
3. Clique em "Add Key" > "Create new key"
4. Selecione "JSON"
5. Clique em "Create" - um arquivo sera baixado

## Passo 4: Criar planilha no Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com/)
2. Crie uma nova planilha
3. Nomeie como "LBSA Database"
4. Copie o ID da planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_E_O_ID_EDITAR/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^
   ```

## Passo 5: Compartilhar planilha com Service Account

1. Na planilha criada, clique em "Compartilhar"
2. Adicione o email da service account (esta no arquivo JSON baixado)
3. De permissao de "Editor"

## Passo 6: Configurar variaveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
GOOGLE_SHEETS_ID=ID_DA_SUA_PLANILHA
GOOGLE_SERVICE_ACCOUNT_EMAIL=email@projetoid.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----"
```

**Importante:** A chave privada deve ter `\n` para quebras de linha.

## Passo 7: Inicializar as planilhas

Execute o comando para criar as abas necessarias:

```bash
npm run init-sheets
```

Isso criara as abas:
- `Usuarios` - Para login/cadastro
- `Materiais` - Para inventario
- `Colecoes` - Para colecoes sistematicas

## Passo 8: Inserir usuario admin

Apos inicializar, acesse a planilha e insira na aba `Usuarios`:

| id | name | email | password | role | createdAt |
|----|------|-------|----------|------|-----------|
| admin001 | Administrador | admin@lbsa.ufsc.br | admin123 | admin | 2024-01-01T00:00:00.000Z |

## Alternativa: Usar planilha existente

Se ja tem uma planilha Excel, faca o upload para o Google Drive e converta para Google Sheets. Depois siga os passos acima.

## Solucao de problemas

### Erro "Permission denied"
- Verifique se a planilha esta compartilhada com o email da service account
- Verifique se a permissao e "Editor"

### Erro "Spreadsheet not found"
- Verifique se o ID da planilha esta correto
- Verifique se a API do Google Sheets esta habilitada

### Erro "Invalid private key"
- Verifique se a chave privada esta completa
- Verifique se os `\n` estao corretos
- Nao inclua aspas extras
