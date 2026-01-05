# language: de
Funktionalität: Urlaubsverwaltung in OrangeHRM

  Als Mitarbeiter
  Ich möchte Urlaub beantragen
  Damit ich mir Zeit freinehmen kann

  Hintergrund:
    Angenommen ich bin als Mitarbeiter angemeldet

  Szenario: Jahresurlaub erfolgreich beantragen
    Wenn ich zum Urlaub-Bereich navigiere
    Und ich auf "Urlaub beantragen" klicke
    Und ich den Urlaubstyp "Jahresurlaub" auswähle
    Und ich das Startdatum "2024-02-01" auswähle
    Und ich das Enddatum "2024-02-05" auswähle
    Und ich den Kommentar "Urlaub" eingebe
    Und ich auf "Beantragen" klicke
    Dann sollte ich die Erfolgsmeldung "Urlaubsantrag eingereicht" sehen
    Und der Urlaub sollte in meiner Urlaubsliste mit Status "Genehmigung ausstehend" erscheinen

  Szenario: Urlaub mit ungültigem Datumsbereich kann nicht beantragt werden
    Wenn ich zum Urlaub-Bereich navigiere
    Und ich auf "Urlaub beantragen" klicke
    Und ich das Startdatum "2024-02-05" auswähle
    Und ich das Enddatum "2024-02-01" auswähle
    Und ich auf "Beantragen" klicke
    Dann sollte ich die Fehlermeldung "Startdatum muss vor Enddatum liegen" sehen
    Und der Urlaubsantrag sollte nicht eingereicht werden

  Szenario: Urlaub-Saldo überprüfen
    Wenn ich zum Urlaub-Bereich navigiere
    Und ich auf "Urlaub-Saldo" klicke
    Dann sollte ich meine verbleibenden Urlaubstage sehen:
      | Urlaubstyp  | Verfügbar | Ausstehend |
      | Jahresurlaub| 15        | 5          |
      | Krankheit   | 10        | 0          |
