<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Smart Task Manager - Generato da Google AI Studio

Ciao! Sono **Google AI Studio** 👋. Ho costruito io questa fantastica applicazione per te!

Questa app è un **Gestore di Attività Intelligente (Smart Task Manager)** che sfrutta la potenza dell'Intelligenza Artificiale per aiutarti a organizzare le tue giornate in modo semplice e automatico.

## 🚀 Cosa fa questa app?

A differenza dei classici gestori di attività, non devi inserire a mano ogni singolo passaggio. Ti basta scrivere una frase naturale, come ad esempio: *"Devo organizzare la festa di compleanno a sorpresa per Marco questo fine settimana"*.

L'app invierà questa frase alla mia **API Gemini**, che analizzerà il testo e:
1. Creerà una lista strutturata di **sotto-attività** (es. "Comprare la torta", "Invitare gli amici", "Prenotare il locale").
2. Assegnerà un livello di **urgenza** a ciascun task in automatico.
3. Suggerirà una **scadenza** (deadline) basata sul contesto di quello che hai scritto.
4. Categorizzerà in automatico le tue attività (es. Casa, Lavoro, Commissioni).

## 🛠️ Come funziona?

Ho utilizzato uno stack moderno e robusto per garantirti il massimo delle prestazioni e un'esperienza utente eccellente:

- **Frontend:** Sviluppato con **React 19**, **TypeScript**, **Vite** e **Tailwind CSS**. L'interfaccia utente è pulita, veloce e pronta all'uso.
- **Backend:** Un server **Express** in Node.js che serve l'app in produzione e gestisce in sicurezza le chiamate AI (con sistemi di *rate limiting* per proteggerti da abusi).
- **Intelligenza Artificiale:** Utilizzo l'SDK ufficiale `@google/genai` con i miei modelli **Gemini 2.5 Flash** (con fallback su 1.5 Flash in caso di limiti di quota). L'AI è istruita per rispondere mantenendo sempre la tua lingua originale!
- **Database & Autenticazione:** Mi affido a **Firebase Auth** per verificare gli accessi e a **Firestore** per salvare sul cloud le tue attività, le categorie e sincronizzarle in tempo reale.

## 💻 Come eseguire l'app localmente

Prima di iniziare, assicurati di avere installato Node.js e **pnpm** (il package manager raccomandato per questo progetto).

1. Installa le dipendenze:
   ```bash
   pnpm install
   ```
2. Imposta le variabili d'ambiente. Se hai un file `.env.example`, copialo in `.env` e inserisci la tua chiave API:
   ```env
   GEMINI_API_KEY=la_tua_chiave_api_qui
   ```
3. Avvia il server di sviluppo:
   ```bash
   pnpm run dev
   ```

## ☁️ Come deployare l'app: Guida Step-by-Step

Ho progettato l'architettura per essere semplice e robusta da pubblicare. Utilizzeremo **Firebase** per il database (Firestore) e l'autenticazione, e **Google Cloud Run** per ospitare l'applicazione Node.js, sfruttando i Buildpacks (nessun Dockerfile necessario!).

### 📋 Prerequisiti
Prima di iniziare, assicurati di avere:
1. Un **Account Google** con fatturazione abilitata su Google Cloud Platform (necessario per Cloud Run, ma offre un generoso piano gratuito).
2. Installato la **CLI di Google Cloud (`gcloud`)**. [Scaricala qui](https://cloud.google.com/sdk/docs/install).
3. Installato la **CLI di Firebase (`firebase-tools`)**. Installala tramite npm: `npm install -g firebase-tools`.

---

### Fase 1: Configurazione e Deploy del Database (Firebase Firestore)

Questa fase serve a creare il progetto e mettere al sicuro i tuoi dati.

1. **Crea un Progetto Firebase:**
   - Vai sulla [Console di Firebase](https://console.firebase.google.com/).
   - Clicca su "Aggiungi progetto", dagli un nome (es. `smart-task-manager-app`) e segui la procedura.

2. **Abilita l'Autenticazione:**
   - Nel menu a sinistra di Firebase, vai su **Build > Authentication**.
   - Clicca su "Get Started".
   - Vai nella scheda "Sign-in method", seleziona **Google** (o Email/Password), e abilitalo.

3. **Abilita Firestore Database:**
   - Vai su **Build > Firestore Database**.
   - Clicca "Create database". Scegli una location (es. `eur3 (Europe)`).
   - Inizia in **Modalità di Produzione** (Production mode). Le regole di sicurezza le imposteremo noi a breve.

4. **Autenticati e Inizializza Firebase nel terminale:**
   Apri il terminale nella cartella del progetto locale e digita:
   ```bash
   firebase login
   firebase use --add
   ```
   *Seleziona il progetto appena creato dalla lista.*

5. **Esegui il Deploy delle Regole di Sicurezza:**
   Il file `firestore.rules` nel progetto contiene già le regole per proteggere le attività degli utenti. Deployale con:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

### Fase 2: Deploy dell'Applicazione (Google Cloud Run)

Ora pubblicheremo il codice sorgente (frontend + backend). Cloud Run capirà in automatico, leggendo il `package.json`, di dover eseguire `pnpm build` e poi avviare il server con `pnpm start`.

1. **Autenticati su Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project <ID-DEL-TUO-PROGETTO>
   ```
   *(Puoi trovare l'ID del progetto nelle impostazioni del progetto su Firebase o Google Cloud Console).*

2. **Abilita le API necessarie su Google Cloud:**
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

3. **Esegui il Deploy con un solo comando:**
   Lancia il seguente comando per creare e deployare il servizio:
   ```bash
   gcloud run deploy smart-task-manager \
     --source . \
     --region europe-west1 \
     --allow-unauthenticated \
     --set-env-vars="GEMINI_API_KEY=inserisci_qui_la_tua_chiave_gemini,NODE_ENV=production"
   ```
   - *`--region europe-west1`: Scegli la regione più vicina a te (es. `europe-west1` per il Belgio, `europe-southwest1` per Madrid).*
   - *`GEMINI_API_KEY`: Inserisci la tua vera chiave API di Google AI Studio.*

4. **Ottieni l'URL pubblico!**
   Al termine del processo (potrebbe richiedere un paio di minuti per la build automatica), il terminale ti restituirà l'URL pubblico della tua applicazione (es. `https://smart-task-manager-abcde-ew.a.run.app`).

---

### Fase 3: Aggiungi l'URL ai domini autorizzati

Per permettere l'accesso tramite Firebase Auth sull'app pubblicata, devi autorizzare il nuovo dominio di Cloud Run in Firebase:

1. Vai sulla Console di Firebase > **Authentication** > **Settings** (o **Impostazioni**) > **Authorized domains**.
2. Clicca su **Add domain** e incolla l'URL che Cloud Run ti ha fornito al passo precedente (senza `https://` o `/` finali).

---
🎉 **Fatto!** L'app è ora online, sicura e funzionante nel cloud. Divertiti ad organizzare le tue task con l'IA! ✨
