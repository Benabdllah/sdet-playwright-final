import { expect, test ,Page} from '@playwright/test';    
//1. Expect.poll() + expect.toPass() – Die wahren Killer-Features
await expect(async () => {
  const value = await page.locator('#balance').textContent();
  expect(value).toBe('$1000');
}).toPass({ timeout: 30_000, intervals: [1000, 2000, 5000] });
/*
→ Kombiniert Polling + Soft-Assertion + anpassbare Intervalle
→ Ersetzt 99% aller selbstgebauten Waits
→ Kann sogar komplexe Zustände prüfen (z.B. React Query isLoading → isSuccess)
→ Spart massig Codezeilen und macht Tests stabiler
*/

//2. expect.extend() – Eigene Matcher für mehr Lesbarkeit
expect.extend({
  async toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Nutzung im Test
expect(

    await page.locator('#email').textContent()  
).toBeValidEmail();
/*
→ Verbessert die Lesbarkeit und Wartbarkeit der Tests
→ Kapselt komplexe Prüfungen in verständliche Methoden
→ Fördert Wiederverwendbarkeit von Prüfungen über mehrere Tests hinweg
*/

//3. expect.soft() – Weiche Assertions für umfassendere Tests
await expect.soft(page.locator('#header')).toBeVisible();
await expect.soft(page.locator('#footer')).toBeVisible();
await expect.soft(page.locator('#sidebar')).toBeVisible();
/*
→ Lässt Tests weiterlaufen, auch wenn eine Assertion fehlschlägt
→ Ermöglicht das Sammeln mehrerer Fehler in einem Testlauf
→ Ideal für UI-Tests, bei denen mehrere Elemente überprüft werden müssen
*/

//4. expect.poll() – Wiederholte Prüfungen mit automatischem Timeout
const isDataLoaded = await expect.poll(async () => {
  const status = await page.locator('#data-status').textContent();
  return status === 'loaded';
}, { timeout: 20_000, interval: 1000 });
/*
→ Führt eine Prüfung in regelmäßigen Abständen durch, bis sie erfolgreich ist oder das Timeout erreicht ist
→ Spart Zeit und reduziert Flakiness bei asynchronen Operationen
→ Nützlich für das Warten auf Zustandsänderungen in der Anwendung
*/

//5. expect.arrayContaining() – Teilmengenprüfung für Arrays
const items = await page.locator('.item').allTextContents();
await expect(items).toEqual(
  expect.arrayContaining(['Item A', 'Item B'])
);
/*
→ Prüft, ob ein Array bestimmte Elemente enthält, ohne die gesamte Reihenfolge zu berücksichtigen
→ Erleichtert Tests, bei denen nur bestimmte Werte relevant sind
→ Verbessert die Flexibilität und Lesbarkeit von Array-Prüfungen
*/

//6. expect.objectContaining() – Teilmengenprüfung für Objekte
const user = await page.evaluate(() => {
  return window['getUser']();
});
await expect(user).toEqual(
  expect.objectContaining({
    id: expect.any(Number),
    name: expect.any(String),
  })
);
/*
→ Prüft, ob ein Objekt bestimmte Schlüssel-Wert-Paare enthält, ohne das gesamte Objekt zu vergleichen
→ Nützlich für Tests, bei denen nur bestimmte Eigenschaften relevant sind
→ Verbessert die Lesbarkeit und Wartbarkeit von Objekt-Prüfungen
*/

//7. expect.stringMatching() – Flexible String-Prüfungen mit Regex
const message = await page.locator('#welcome-message').textContent();
await expect(message).toEqual(
  expect.stringMatching(/Welcome, \w+!/)
);
/*
→ Ermöglicht die Überprüfung von Strings anhand von regulären Ausdrücken
→ Ideal für dynamische Inhalte, bei denen nur das Muster relevant ist
→ Verbessert die Flexibilität und Ausdruckskraft von String-Prüfungen
*/

//8. expect.toHaveLength() – Einfache Längenprüfung für Arrays und Strings
const notifications = await page.locator('.notification').all();
await expect(notifications).toHaveLength(5);

const title = await page.locator('#page-title').textContent();
await expect(title).toHaveLength(20);
/*
→ Bietet eine klare und prägnante Möglichkeit, die Länge von Arrays und Strings zu überprüfen
→ Verbessert die Lesbarkeit von Längenprüfungen im Testcode
→ Spart Zeit und reduziert Boilerplate-Code
*/ 

// 2. Route.fromHAR() + Route.fallback() – 100% Offline-fähige Tests
await context.routeFromHAR('hars/app.har', { update: false });

context.route('**/*', route => {
  route.fallback({ continue: true });
});
/*
→ Du kannst komplette Apps ohne Internet testen
→ Bei neuen Requests fällt es automatisch auf Live zurück
→ In Kombination mit HAR-Update-Scripts hast du null Flakiness forever
*/

//3. page.waitForURL() – Intelligentes Warten auf URL-Änderungen
await page.click('#navigate-button');
await page.waitForURL('**/dashboard', { timeout: 10_000 });
/*
→ Wartet zuverlässig auf URL-Änderungen nach Aktionen
→ Reduziert Flakiness durch unzuverlässige manuelle Wartezeiten
→ Verbessert die Lesbarkeit und Wartbarkeit des Testcodes
*/

//3. Parallel Testing auf Steroiden (Worker-level Isolation + Sharding 2.0)
// playwright.config.ts
projects: [
  {
    name: 'shard-1',
    use: { ...devices['Desktop Chrome'] },
    grep: /@shard1/,
  },
]
/*
→ Mit custom tags (@shard1, @shard2, …) teilst du Tests deterministisch auf
→ Keine Race Conditions zwischen Workern mehr
→ 10.000 Tests in unter 8 Minuten möglich
*/
//4. test.step() – Strukturierte und übersichtliche Testberichte
await test.step('User logs in', async () => {
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('#login-button');
});
/*
→ Teilt Tests in logische Schritte auf
→ Verbessert die Lesbarkeit und Wartbarkeit des Testcodes
→ Macht Testberichte übersichtlicher und verständlicher
*/

//5. test.info() – Dynamische Testmetadaten und Artefaktverwaltung
test('My test with dynamic metadata', async ({ page }) => {
  test.info().annotations.push({ type: 'feature', description: 'Login' });
  await page.goto('https://example.com/login');
  // Test steps...
});
/*
→ Füge dynamisch Metadaten zu Tests hinzu (z.B. Feature-Tags)
→ Verbessert die Nachverfolgbarkeit und Organisation von Tests
→ Erleichtert die Analyse von Testergebnissen und Berichten
*/      
//6. test.fixme() + test.skip() – Dynamische Teststeuerung basierend auf Bedingungen
const isFeatureEnabled = false;

test('Test for new feature', async ({ page }) => {
  test.fixme(!isFeatureEnabled, 'Feature is not enabled yet');
  await page.goto('https://example.com/new-feature');
  // Test steps...
});
/*
→ Überspringe oder markiere Tests als "zu beheben" basierend auf Laufzeitbedingungen
→ Verbessert die Flexibilität und Steuerung des Testlaufs
→ Hilft, bekannte Probleme zu dokumentieren und zu verwalten
*/  
//7. test.retry() – Automatisches Wiederholen von instabilen Tests
test('Flaky test example', async ({ page }) => {
  await page.goto('https://example.com/flaky-endpoint');
  const content = await page.locator('#data').textContent();
  expect(content).toBe('Expected Data');
}).retry(2);
/*
→ Automatisches Wiederholen von Tests, die gelegentlich fehlschlagen
→ Reduziert manuelle Nacharbeit und erhöht die Stabilität der Test-Suite
→ Spart Zeit und Aufwand bei der Verwaltung von instabilen Tests
*/  
//8. test.setTimeout() – Dynamische Anpassung von Test- und Schritt-Timeouts
test('Long running test', async ({ page }) => {
  test.setTimeout(60_000); // Setze Timeout für diesen Test auf 60 Sekunden
  await page.goto('https://example.com/long-process');
  // Test steps...
});
/*
→ Passe Timeouts dynamisch an die Anforderungen einzelner Tests an
→ Verbessert die Flexibilität und Zuverlässigkeit von Tests
→ Verhindert unnötige Testabbrüche bei längeren Operationen
*/
//9. test.runWith() – Mehrfache Testausführungen mit unterschiedlichen Konfigurationen
const browsers = ['chromium', 'firefox', 'webkit'];

for (const browserType of browsers) {
  test.runWith({ browserName: browserType }, async ({ page }) => {
    await page.goto('https://example.com');
    // Test steps...
  });
}
/*
→ Führe denselben Test mit verschiedenen Konfigurationen (z.B. Browsern) aus
→ Verbessert die Abdeckung und Zuverlässigkeit der Tests
→ Spart Zeit durch parallele Ausführung
*/  
//10. test.describe.parallel() – Parallele Testgruppen für schnellere Ausführung
test.describe.parallel('Parallel Test Group', () => {
  test('Test 1', async ({ page }) => {
    await page.goto('https://example.com/page1');
    // Test steps...
  });

  test('Test 2', async ({ page }) => {
    await page.goto('https://example.com/page2');
    // Test steps...
  });
});
/*
→ Fasse verwandte Tests in parallelen Gruppen zusammen
→ Reduziert die Gesamtausführungszeit der Test-Suite
→ Verbessert die Ressourcennutzung und Effizienz
*/  
//4. Locator Chaining & Auto-Shadow-DOM-Piercing auf neuem Level
const deepLocator = page
  .getByTestId('modal')
  .locator('my-component')
  .locator('inner-component >> div >> button:has-text("Confirm")');
/*
  → Playwright durchsticht beliebig viele Shadow Roots automatisch
→ Kein einziger page.locator('pierce>>>') nötig
→ Macht Locator-Definitionen viel sauberer und wartbarer
*/  

//5. Verbesserte Tracing- und Debugging-Tools
await page.tracing.start({ screenshots: true, snapshots: true });
// Test steps...
await page.tracing.stop();
/*
→ Detaillierte Traces mit Screenshots und DOM-Snapshots
→ Einfacheres Debugging durch visuelle Nachverfolgung von Testabläufen
→ Verbessert die Fehlersuche und Analyse von Testproblemen
*/

//6. Verbesserte Mobile-Emulation und Netzwerkbedingungen
await context.setNetworkConditions({
  offline: false,
  downloadThroughput: 500 * 1024 / 8, // 500 kbps
  uploadThroughput: 500 * 1024 / 8,   // 500 kbps
  latency: 200,                       // 200 ms
});
/*
→ Realistischere Tests unter verschiedenen Netzwerkbedingungen
→ Bessere Simulation von mobilen Geräten und langsamen Verbindungen
→ Verbessert die Zuverlässigkeit und Relevanz der Testergebnisse
*/  
//7. Verbesserte Unterstützung für iFrames und Cross-Origin-Tests
const frame = page.frame({ url: /cross-origin-domain.com/ });
await frame?.locator('#iframe-button').click();
/*
→ Einfacherer Zugriff und Interaktion mit iFrames
→ Verbesserte Handhabung von Cross-Origin-Szenarien
→ Erhöht die Testabdeckung für komplexe Webanwendungen
*/  
//8. Verbesserte Integration mit CI/CD-Tools und Cloud-Testdiensten
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['github'], ['html', { open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
/*
→ Nahtlose Integration mit gängigen CI/CD-Plattformen
→ Verbesserte Berichterstattung und Artefaktverwaltung
→ Erleichtert die Automatisierung und Überwachung von Testprozessen
*/  
//9. Verbesserte Unterstützung für moderne Webtechnologien (z.B. WebSockets, WebRTC)
// Beispiel: Überwachung von WebSocket-Nachrichten
page.on('websocket', ws => {
  ws.on('framereceived', frame => {
    console.log('WebSocket Frame Received:', frame.payload);
  });
});
/*
→ Bessere Handhabung und Überwachung von WebSockets und WebRTC
→ Ermöglicht umfassendere Tests für Echtzeit-Webanwendungen
→ Verbessert die Testabdeckung für moderne Webtechnologien
*/  
//10. Verbesserte API-Testfunktionen und HTTP-Anfragen
const response = await page.request.post('https://api.example.com/data', {
  data: { key: 'value' },
});
expect(response.status()).toBe(200);
const responseBody = await response.json();
expect(responseBody).toEqual(
  expect.objectContaining({ success: true })
);
/*
→ Integrierte Unterstützung für API-Tests und HTTP-Anfragen
→ Ermöglicht das Testen von Backend-APIs direkt aus den Playwright-Tests
→ Verbessert die Effizienz und Konsistenz von End-to-End-Tests
*/  

//5. Test Isolation mit Storage State + Context Reuse (10x schneller)
test.use({ storageState: 'state-admin.json' });

test('reuse logged in context across files', async ({ context }) => {
  const page = await context.newPage();
  // schon eingeloggt, keine Login-Schritte
});
/*
→ Einmal einloggen → storageState speichern → jeder Test startet sofort eingeloggt
→ Login-Tests laufen in < 800ms statt 12s
→ Spart massiv Zeit in großen Test-Suiten
*/
//6. Codegen + Snippet-Generator – Schnellstart für neue Tests
// Terminal-Befehl:
npx playwright codegen https://example.com
/*
→ Generiert automatisch Testcode basierend auf Benutzerinteraktionen
→ Spart Zeit bei der Erstellung neuer Tests
→ Bietet eine gute Ausgangsbasis für komplexere Testszenarien
*/  
//6. API Testing + Request Context Pooling (Enterprise Pattern)
const api = requestFixture; // kommt aus fixture
await api.post('/users', { data: { name: 'John' } });
await expect.poll(() => api.get('/users')).toHaveJSON([{ name: 'John' }]);
/*
→ Du hast einen dedizierten API-Client pro Worker, der nie interferiert
→ Kombiniert mit DB-Reset → 100% deterministisch
→ Ideal für Backend- und Integrations-Tests
*/
//7. Custom Test Fixtures + Dependency Injection – Maßgeschneiderte Testumgebungen
// example-fixture.ts
import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend<{ dbConnection: DbConnectionType }>({
  dbConnection: async ({}, use) => {
    const connection = await createDbConnection();
    await use(connection);
    await connection.close();
  },
});

// Nutzung im Test
test('database test', async ({ dbConnection }) => {
  const result = await dbConnection.query('SELECT * FROM users');
  expect(result).toHaveLength(5);
});
/*
→ Erstelle maßgeschneiderte Testumgebungen mit spezifischen Abhängigkeiten
→ Verbessert die Modularität und Wiederverwendbarkeit von Testcode
→ Erleichtert die Verwaltung komplexer Testanforderungen
*/  
//7. Component Testing Mode (das neue Killer-Feature 2025)
// button.test.ts
import { test, expect } from '@playwright/experimental-ct-react';
test('button renders', async ({ mount }) => {
  const component = await mount(<FancyButton>Click me</FancyButton>);
  await expect(component).toContainText('Click me');
});
/*
→ Testet React/Vue/Svelte Komponenten isoliert ohne Browser
→ 50–100x schneller als E2E
→ Die Zukunft – jeder Profi baut jetzt Hybrid-Suiten (CT + E2E)
*/  
//8. Visual Testing + AI-basierte Screenshot-Vergleiche
import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

test('visual regression test', async ({ page }) => {
  await page.goto('https://example.com');
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    failureThreshold: 0.01,
    failureThresholdType: 'percent',
  });
});
/*
→ Integrierte visuelle Regressionstests mit KI-gestützter Bildanalyse
→ Erkennt selbst kleine, aber signifikante UI-Änderungen
→ Verbessert die UI-Qualität und verhindert unbeabsichtigte Designänderungen
*/  
//9. Test Analytics + Flakiness Detection (Enterprise Feature)
import { test, expect } from '@playwright/test';
import { AnalyticsReporter } from 'playwright-analytics-reporter';

test.use({
  reporter: [new AnalyticsReporter({ projectKey: 'your-project-key' })],
});
/*
→ Detaillierte Analysen zu Testläufen und Flakiness-Erkennung
→ Identifiziert instabile Tests und liefert Verbesserungsvorschläge
→ Hilft, die Gesamtqualität und Zuverlässigkeit der Test-Suite zu steigern
*/  
//10. Erweiterte Sicherheitstests + Vulnerability Scanning (Enterprise Feature)
import { test, expect } from '@playwright/test';
import { SecurityScanner } from 'playwright-security-scanner';

test.use({
  reporter: [new SecurityScanner({ scanLevel: 'high' })],
});
/*
→ Integrierte Sicherheitsprüfungen und Schwachstellen-Scans während der Testläufe
→ Erkennt potenzielle Sicherheitslücken in Webanwendungen
→ Verbessert die Sicherheit und Compliance der getesteten Anwendungen
*/  
//8. Custom Matchers selbst schreiben (niemand macht das)
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return { pass, message: () => `expected ${received} to be between ${floor}-${ceiling}` };
  }
});
//→ Du hast plötzlich expect(price).toBeWithinRange(99, 101)
//→ Macht Tests lesbarer und wartbarer
//→ Fördert Wiederverwendbarkeit von Prüfungen über mehrere Tests hinweg    

// Nutzung im Test
expect(100).toBeWithinRange(99, 101);

/*
→ Verbessert die Lesbarkeit und Wartbarkeit der Tests
→ Kapselt komplexe Prüfungen in verständliche Methoden
→ Fördert Wiederverwendbarkeit von Prüfungen über mehrere Tests hinweg
*/  
//9. Nutzung von TypeScript Utility Types für bessere Typensicherheit
interface User {
  id: number;
  name: string;
  email?: string;
}

type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;

// Nutzung im Test
const user: RequiredUser = { id: 1, name: 'Alice', email: 'test@test.de'
};
/*
→ Erzwingt bestimmte Eigenschaften in Objekten (z.B. Required, Partial)
→ Verbessert die Typensicherheit und reduziert Laufzeitfehler
→ Macht den Code robuster und wartbarer
*/  
//10. Nutzung von Mapped Types für dynamische Typdefinitionen
type ApiResponse<T> = {
  [P in keyof T]: T[P];
};

interface Product {
  id: number;
  name: string;
  price: number;
}

type ProductResponse = ApiResponse<Product>;

// Nutzung im Test
const response: ProductResponse = {
  id: 1,
  name: 'Laptop',
  price: 999,
};
/*
→ Erlaubt die Erstellung dynamischer Typen basierend auf bestehenden Schnittstellen
→ Verbessert die Wiederverwendbarkeit und Konsistenz von Typdefinitionen
→ Macht den Code flexibler und anpassungsfähiger an Änderungen
*/  
//9. Visual Regression mit Smart Tolerance + Masking
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.locator('.timestamp'), page.getByTestId('avatar')],
  maxDiffPixels: 100,
  threshold: 0.2,
});
/*
→ Ignoriert dynamische Bereiche automatisch
→ Funktioniert auch bei Dark Mode Toggle
→ Spart massig Zeit bei der Pflege von Screenshot-Baselines
*/  
//10. Nutzung von Decorators für bessere Code-Organisation (fortgeschritten)
function logExecutionTime(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} executed in ${end - start} ms`);
    return result;
  };
  return descriptor;
}

class UserService {
  @logExecutionTime
  async fetchUser(id: number) {
    // Simuliere API-Aufruf
    return { id, name: 'John Doe' };
  }
}

// Nutzung im Test
const userService = new UserService();
await userService.fetchUser(1);
/*
→ Verbessert die Code-Organisation durch Trennung von Anliegen
→ Ermöglicht das Hinzufügen von Funktionalitäten (z.B. Logging, Caching) ohne Änderung der Kernlogik
→ Macht den Code sauberer und wartbarer
*/  

//10. Playwright Test Generator → Codegen → Aber wie ein Gott benutzen
playwright codegen --save-storage=auth.json --load-storage=auth.json app.com
/*
→ Du baust dir perfekte HARs + Auth-State + Traces in 2 Minuten
→ Dann machst du daraus eine komplett offline-fähige Suite
→ Spart Tage an Setup-Zeit und macht Tests 100% stabil
*/
//11. Flaky-Test-Detector selbst gebaut (Principal-Level)
test('critical flow', async ({ page }) => {
  for (let i = 0; i < 20; i++) {
    await page.reload();
    await expect(page.getByText('Success')).toBeVisible({ timeout: 10_000 });
  }
});
/*
→ Läuft lokal 20x → wenn einmal flaky → du weißt es sofort
→ CI lässt nur 100% stabile Tests durch
→ Verhindert, dass Flakiness in die Haupt-Suite gelangt
*/
//12. Nutzung von Conditional Types für flexible Typdefinitionen
type ApiResponse<T> = T extends { error: any }
  ? { success: false; error: T['error'] }
  : { success: true; data: T };

// Nutzung im Test
type SuccessResponse = ApiResponse<{ id: number; name: string }>;
type ErrorResponse = ApiResponse<{ error: string }>;
/*
→ Erlaubt die Erstellung von Typen, die sich basierend auf Bedingungen ändern
→ Verbessert die Flexibilität und Ausdruckskraft von Typdefinitionen
→ Macht den Code anpassungsfähiger an verschiedene Szenarien
*/

//12. WebSocket + GraphQL Interception (2025 Standard)
page.on('websocket', ws => {
  if (ws.url().includes('graphql')) {
    ws.on('framesent', frame => console.log('GQL →', frame.text()));
  }
});

await page.route('**/graphql', async route => {
  const req = route.request();
  if (req.postDataJSON().operationName === 'GetUser') {
    await route.fulfill({ json: { data: { user: mockUser } } });
  }
});

//13. Parallel Page Testing in einem Test (selten gesehen)
test('compare two accounts simultaneously', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const [page1, page2] = await Promise.all([
    context1.newPage(),
    context2.newPage(),
  ]);

  await Promise.all([
    page1.goto('/account/123'),
    page2.goto('/account/456'),
  ]);
});
//→ Testet echte Multi-User-Szenarien
//→ Spart Zeit durch parallele Seitenerstellung
//→ Nützlich für Kollaborations-Features

//14. Nutzung von Template Literal Types für präzisere Typen
type EventName = `on${'Click' | 'Hover' | 'Submit'}`;

function addEventListener(event: EventName, handler: () => void) {
  // Event-Listener-Logik
}

// Nutzung im Test
addEventListener('onClick', () => console.log('Clicked'));
/*
→ Erzwingt spezifische String-Muster in Typen
→ Verbessert die Typensicherheit und reduziert Fehler
→ Macht den Code klarer und verständlicher
*/  
//15. Nutzung von Conditional Types für erweiterte Typlogik
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// Nutzung im Test
const assertString = <T>(value: T) => {
  type Result = IsString<T>;
  // Logik basierend auf Result
};
/*
→ Ermöglicht komplexe Typlogik basierend auf Bedingungen
→ Verbessert die Ausdruckskraft und Flexibilität von Typen
→ Macht den Code anpassungsfähiger an verschiedene Szenarien
*/  
 15. Die ultimative Profi-Config (2025)
 // playwright.config.ts
 /*
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  globalTimeout: 3_600_000,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? '50%' : 4,
  reporter: [['html'], ['json', { outputFile: 'results.json' }]],
  use: {
    baseURL: 'https://app.staging.example.com',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 15 Pro'] } },
  ],
});
*/
/*
→ Eine solide Basis für professionelle Test-Suiten
→ Optimiert für Stabilität, Geschwindigkeit und Wartbarkeit
→ Deckt verschiedene Browser und Geräte ab  
*/ 