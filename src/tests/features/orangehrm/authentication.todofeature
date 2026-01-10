# language: de
Funktionalität: Authentifizierung in OrangeHRM

  Als Benutzer
  Ich möchte mich bei OrangeHRM anmelden
  Damit ich auf das System sicher zugreifen kann

  Szenario: Erfolgreiche Anmeldung mit gültigen Anmeldedaten
    Angenommen ich bin auf der OrangeHRM-Anmeldeseite
    Wenn ich den Benutzernamen "Admin" eingebe
    Und ich das Passwort "admin123" eingebe
    Und ich auf den "Login"-Button klicke
    Dann sollte ich erfolgreich angemeldet sein
    Und ich sollte das Dashboard sehen

  Szenario: Anmeldung fehlgeschlagen mit ungültigen Anmeldedaten
    Angenommen ich bin auf der OrangeHRM-Anmeldeseite
    Wenn ich den Benutzernamen "Admin" eingebe
    Und ich das Passwort "wrongpassword" eingebe
    Und ich auf den "Login"-Button klicke
    Dann sollte ich eine Fehlermeldung "Ungültige Anmeldedaten" sehen
    Und ich sollte auf der Anmeldeseite bleiben

  Szenario: Anmeldung mit leerem Benutzernamen
    Angenommen ich bin auf der OrangeHRM-Anmeldeseite
    Wenn ich das Benutzernamenfeld leer lasse
    Und ich das Passwort "admin123" eingebe
    Und ich auf den "Login"-Button klicke
    Dann sollte ich einen Validierungsfehler sehen
    Und das Formular sollte nicht eingereicht werden

  Szenario: Erfolgreich abmelden
    Angenommen ich bin als Administrator angemeldet
    Wenn ich auf das Benutzerprofilmenü klicke
    Und ich auf die Option "Logout" klicke
    Dann sollte ich abgemeldet sein
    Und ich sollte auf die Anmeldeseite weitergeleitet werden

  Szenario: Sitzungszeitüberschreitung nach Inaktivität
    Angenommen ich bin als Administrator angemeldet
    Wenn ich 30 Minuten lang keine Aktion ausführe
    Und ich versuche, zu einer authentifizierten Seite zu navigieren
    Dann sollte ich auf die Anmeldeseite weitergeleitet werden
    Und ich sollte eine Sitzungszeitüberschreitung-Meldung sehen
