# First Runner - Voice API Backend

Servidor backend para intermediar as requisições de áudio do painel `coach-ia.html` para a API do Gemini 2.0 Flash. Projetado para rodar no Google Cloud Run.

## Como fazer o Deploy no Google Cloud Run

1. Certifique-se de que o **Google Cloud SDK (gcloud)** está instalado e autenticado na sua máquina:
   ```bash
   gcloud auth login
   gcloud config set project firstrun-74ce2
   ```

2. Crie a imagem Docker (usando Buildpacks nativos do Google Cloud) e faça o deploy diretamente:
   ```bash
   gcloud run deploy first-runner-api \
       --source . \
       --region us-central1 \
       --allow-unauthenticated \
       --set-env-vars="GEMINI_API_KEY=sua_chave_aqui"
   ```

3. Após finalizar, o terminal exibirá a **Service URL** (ex: `https://first-runner-api-xxxx.a.run.app`). Copie essa URL.

4. Atualize o arquivo `coach-ia.html` na função `handleChat` para apontar para essa nova URL em vez de `/api/chat`.
