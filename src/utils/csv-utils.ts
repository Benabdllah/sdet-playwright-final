import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';


/**
 * Liest eine CSV-Datei ein und gibt sie als 2D-Array zurück
 */
export function readCSV(filePath: string): string[][] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return raw
    .trim()
    .split('\n')                          // 🔹 Datei in Zeilen aufteilen:Teilt den Text an jedem Zeilenumbruch in ein Array von Zeilen auf.["Name,Alter,Stadt", "Anna,25,Berlin", "Tom,30,Hamburg"]
    .map(row => row.split(',').map(col => col.trim())); // 🔹 Jede Zeile in Spalten zerlegen
}
/*
JEDE Zeile wird an den Kommas aufgeteilt → ein Array von Spalten.

Danach werden Leerzeichen um jede Spalte entfernt.

Ergebnis ist ein Array von Arrays:
[
  ["Name", "Alter", "Stadt"],
  ["Anna", "25", "Berlin"],
  ["Tom", "30", "Hamburg"]
]

*/

export function readCSVRobust(filePath: string): string[][] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return parse(raw, {
    columns: true,        // 👈 Macht aus Headern automatisch Keys
    skip_empty_lines: true,
    trim: true,
  });
}



export function readCSVAsObjectsOhneExterneBibliotheke(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8').trim();
  const lines = raw.split('\n');

  if (lines.length === 0) return [];

  // Erste Zeile = Header
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1);

  // Jede weitere Zeile → Objekt mit Headern als Keys
  return rows.map(line => {
    const cols = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((key, i) => {
      obj[key] = cols[i] ?? ''; // Falls Spalte fehlt → leer
    });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
