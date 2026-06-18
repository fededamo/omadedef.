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

## ☁️ Come deployare l'app in modo semplice

Ho progettato l'architettura per essere super semplice da pubblicare. Utilizzeremo **Google Cloud Run** per l'hosting e **Firebase** per database e sicurezza.

### 1. Database Firestore (Firebase)
Assicurati di aver configurato un progetto Firebase. Le regole di sicurezza del tuo database Firestore (`firestore.rules`) sono cruciali per mantenere i tuoi dati al sicuro.
Per pubblicare le regole di Firestore, apri il terminale ed esegui:
```bash
firebase deploy --only firestore
```

### 2. Applicazione (Google Cloud Run)
Per ospitare l'app non hai bisogno di complicati file Docker! I "Buildpacks" di Google Cloud capiranno automaticamente che è un progetto Node.js, eseguiranno la build (`pnpm build`) e avvieranno il server di produzione in Express (`pnpm start`).

Assicurati di avere la CLI di Google Cloud (`gcloud`) installata e autenticata sul tuo progetto. Esegui semplicemente questo comando per deployare tutto in un colpo solo:

```bash
gcloud run deploy smart-task-manager \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=inserisci_qui_la_tua_chiave,NODE_ENV=production"
```

*Nota: sostituisci `europe-west1` con la regione che preferisci e inserisci la tua vera chiave al posto di `inserisci_qui_la_tua_chiave`.*

---
Tutto qui! Spero che questa app ti piaccia. Divertiti ad organizzare i tuoi task con Gemini! ✨
