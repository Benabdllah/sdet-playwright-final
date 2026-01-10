# language: de
Funktionalität: Urlaubssaldo-Validierung in OrangeHRM

  Als Mitarbeiter mit niedrigem Urlaubssaldo
  Ich möchte kein Urlaub beantragen können wenn nicht genug Tage verfügbar sind
  Damit der Urlaubsbestand korrekt bleibt

  Hintergrund:
    Angenommen mein Jahresurlaub-Saldo beträgt 2 Tage
    Und ich bin als Mitarbeiter angemeldet

  Szenario: Urlaub kann nicht mit unzureichendem Saldo beantragt werden
    Wenn ich zum Urlaub-Bereich navigiere
    Und ich auf "Urlaub beantragen" klicke
    Und ich den Urlaubstyp "Jahresurlaub" auswähle
    Und ich das Startdatum "2024-02-01" auswähle
    Und ich das Enddatum "2024-02-05" auswähle (5 Tage)
    Und ich auf "Beantragen" klicke
    Dann sollte ich die Fehlermeldung "Unzureichender Urlaubssaldo" sehen
    Und der Urlaubsantrag sollte nicht eingereicht werden
