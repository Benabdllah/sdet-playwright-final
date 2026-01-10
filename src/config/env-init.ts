// Zentrale Initialisierung der Umgebungsvariablen für das gesamte Test-Framework
// Nur EINMAL importieren (z.B. in globalSetup, main entry, oder als erstes in test runner)

import { config } from "@dotenvx/dotenvx";

config({ path: [".env.local", ".env.development", ".env"] });

// Hinweis: Diese Datei sollte als allererstes importiert werden!
