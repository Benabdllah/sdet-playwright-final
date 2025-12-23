import * as fs from 'fs';
import * as path from 'path';

/**
 * Liest eine CSV-Datei ein und gibt sie als 2D-Array zurück
 */
export function readCSV(filePath: string): string[][] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return raw
    .trim()
    .split('\n')
    .map(row => row.split(',').map(col => col.trim()));
}
