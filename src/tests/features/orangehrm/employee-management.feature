# language: de
Funktionalität: Mitarbeiterverwaltung in OrangeHRM

  Als HR-Administrator
  Ich möchte Mitarbeiterinformationen verwalten
  Damit ich genaue Mitarbeiterdatensätze führen kann

  Hintergrund:
    Angenommen ich bin als Administrator angemeldet

  Szenario: Einen neuen Mitarbeiter erfolgreich erstellen
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich auf den "Hinzufügen"-Button klicke
    Und ich die folgenden Mitarbeiterinformationen eingebe:
      | Feld        | Wert            |
      | Vorname     | John            |
      | Nachname    | Automation      |
      | E-Mail      | john@example.com|
    Und ich auf den "Speichern"-Button klicke
    Dann sollte ich eine Erfolgsmeldung "Erfolgreich gespeichert" sehen
    Und der Mitarbeiter "John Automation" sollte in der Mitarbeiterliste erscheinen

  Szenario: Erforderliche Felder bei der Erstellung von Mitarbeitern validieren
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich auf den "Hinzufügen"-Button klicke
    Und ich auf den "Speichern"-Button klicke, ohne Felder auszufüllen
    Dann sollte ich Validierungsfehler für erforderliche Felder sehen
    Und der Mitarbeiter sollte nicht erstellt werden

  Szenario: Nach Mitarbeiter nach Name suchen
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich nach Mitarbeiter "Peter Mac" suche
    Dann sollten die Suchergebnisse Mitarbeiter anzeigen, die dem Namen entsprechen

  Szenario: Einen Mitarbeiter löschen
    Angenommen ein Mitarbeiter "Jane Smith" existiert im System
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich nach "Jane Smith" suche
    Und ich auf den Löschen-Button für "Jane Smith" klicke
    Und ich die Löschaktion bestätige
    Dann sollte ich eine Erfolgsmeldung "Erfolgreich gelöscht" sehen
    Und "Jane Smith" sollte nicht mehr in der Mitarbeiterliste erscheinen

  Szenario: Mitarbeiterinformationen bearbeiten
    Angenommen ein Mitarbeiter "Michael Scott" existiert im System
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich nach "Michael Scott" suche
    Und ich auf "Michael Scott" klicke, um zu bearbeiten
    Und ich die E-Mail auf "michael.new@example.com" aktualisiere
    Und ich auf den "Speichern"-Button klicke
    Dann sollte ich eine Erfolgsmeldung "Erfolgreich aktualisiert" sehen
    Und die E-Mail für "Michael Scott" sollte "michael.new@example.com" sein

  Szenario: Mitarbeiterdetails anzeigen
    Angenommen ein Mitarbeiter "Peter Parker" existiert im System
    Wenn ich zum Abschnitt Mitarbeiterverwaltung navigiere
    Und ich auf "Peter Parker" klicke, um Details anzuzeigen
    Dann sollte ich alle Mitarbeiterinformationen sehen
    Und die Mitarbeiter-ID sollte angezeigt werden
    Und der Beschäftigungsstatus sollte angezeigt werden
