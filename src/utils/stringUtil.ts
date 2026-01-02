/**
 * ============================================================================
 * ULTIMATIVES SDET STRING-DIENSTPROGRAMM (FINAL) +++++
 * ============================================================================
 * Umfassende String-Manipulations- und Validierungsfunktionen
 * Features: Case-Konvertierung, Validierung, Suche, Metriken, Normalisierung
 * Unterstützt: Regex, Templates, Ähnlichkeit, Tokenisierung, Unicode
 * Production-Ready mit Performance-Optimierung und detaillierten Analytics
 * ============================================================================
 */

// ============================================================================
// TYPEN & ENUMS
// ============================================================================

export enum CaseFormat {
  LOWER = 'lower',
  UPPER = 'upper',
  CAMEL = 'camel',
  PASCAL = 'pascal',
  SNAKE = 'snake',
  KEBAB = 'kebab',
  TITLE = 'title',
  SENTENCE = 'sentence',
  CONSTANT = 'constant',
  TRAIN = 'train',
  DOT = 'dot',
}

export enum StringSearchMode {
  EXACT = 'exact',
  CASE_INSENSITIVE = 'case_insensitive',
  REGEX = 'regex',
  FUZZY = 'fuzzy',
  CONTAINS = 'contains',
}

export enum StringPadding {
  START = 'start',
  END = 'end',
  CENTER = 'center',
}

export interface StringSimilarityResult {
  similarity: number;
  distance: number;
  percentage: number;
  matches: number;
}

export interface StringMetrics {
  length: number;
  wordCount: number;
  characterCount: number;
  uniqueCharacters: number;
  vowels: number;
  consonants: number;
  digits: number;
  specialCharacters: number;
  spaces: number;
  lines: number;
  sentences: number;
  averageWordLength: number;
  averageLineLength: number;
}

export interface StringValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// STRING-UTILITIES KLASSE
// ============================================================================

export class StringUtil {
  /**
   * Konvertiere String zu verschiedenen Case-Formaten
   */
  static convertCase(str: string, format: CaseFormat): string {
    if (!str) return str;

    switch (format) {
      case CaseFormat.LOWER:
        return str.toLowerCase();

      case CaseFormat.UPPER:
        return str.toUpperCase();

      case CaseFormat.CAMEL:
        return this.toCamelCase(str);

      case CaseFormat.PASCAL:
        return this.toPascalCase(str);

      case CaseFormat.SNAKE:
        return this.toSnakeCase(str);

      case CaseFormat.KEBAB:
        return this.toKebabCase(str);

      case CaseFormat.TITLE:
        return this.toTitleCase(str);

      case CaseFormat.SENTENCE:
        return this.toSentenceCase(str);

      case CaseFormat.CONSTANT:
        return this.toConstantCase(str);

      case CaseFormat.TRAIN:
        return this.toTrainCase(str);

      case CaseFormat.DOT:
        return this.toDotCase(str);

      default:
        return str;
    }
  }

  /**
   * Konvertiere zu camelCase
   */
  private static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toLowerCase());
  }

  /**
   * Konvertiere zu PascalCase
   */
  private static toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toUpperCase());
  }

  /**
   * Konvertiere zu snake_case
   */
  private static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Konvertiere zu kebab-case
   */
  private static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Konvertiere zu Title Case
   */
  private static toTitleCase(str: string): string {
    return str.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  /**
   * Konvertiere zu Sentence case
   */
  private static toSentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Konvertiere zu CONSTANT_CASE
   */
  private static toConstantCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  }

  /**
   * Konvertiere zu Train-Case
   */
  private static toTrainCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  }

  /**
   * Konvertiere zu dot.case
   */
  private static toDotCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1.$2')
      .replace(/[\s_-]+/g, '.')
      .toLowerCase();
  }

  /**
   * Trimme String
   */
  static trim(str: string, chars?: string): string {
    if (!chars) return str.trim();

    const regex = new RegExp(`^[${this.escapeRegex(chars)}]+|[${this.escapeRegex(chars)}]+$`, 'g');
    return str.replace(regex, '');
  }

  /**
   * Trimme vom Anfang
   */
  static trimStart(str: string, chars?: string): string {
    if (!chars) return str.trimStart();

    const regex = new RegExp(`^[${this.escapeRegex(chars)}]+`);
    return str.replace(regex, '');
  }

  /**
   * Trimme vom Ende
   */
  static trimEnd(str: string, chars?: string): string {
    if (!chars) return str.trimEnd();

    const regex = new RegExp(`[${this.escapeRegex(chars)}]+$`);
    return str.replace(regex, '');
  }

  /**
   * Polstere String
   */
  static pad(str: string, length: number, char: string = ' ', position: StringPadding = StringPadding.END): string {
    if (str.length >= length) return str;

    const padLength = length - str.length;
    const padding = char.repeat(Math.ceil(padLength / char.length)).slice(0, padLength);

    switch (position) {
      case StringPadding.START:
        return padding + str;
      case StringPadding.CENTER:
        const leftPad = Math.floor(padLength / 2);
        const rightPad = padLength - leftPad;
        return padding.slice(0, leftPad) + str + padding.slice(0, rightPad);
      case StringPadding.END:
      default:
        return str + padding;
    }
  }

  /**
   * Kehre String um
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Wiederhole String
   */
  static repeat(str: string, count: number): string {
    return str.repeat(count);
  }

  /**
   * Teile String in Chunke auf
   */
  static chunk(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Suche in String
   */
  static search(str: string, query: string, mode: StringSearchMode = StringSearchMode.CONTAINS): boolean {
    switch (mode) {
      case StringSearchMode.EXACT:
        return str === query;

      case StringSearchMode.CASE_INSENSITIVE:
        return str.toLowerCase() === query.toLowerCase();

      case StringSearchMode.REGEX:
        try {
          const regex = new RegExp(query);
          return regex.test(str);
        } catch {
          return false;
        }

      case StringSearchMode.FUZZY:
        return this.fuzzyMatch(str, query);

      case StringSearchMode.CONTAINS:
      default:
        return str.includes(query);
    }
  }

  /**
   * Fuzzy-Matching
   */
  private static fuzzyMatch(str: string, pattern: string): boolean {
    const strLower = str.toLowerCase();
    const patternLower = pattern.toLowerCase();

    let patternIdx = 0;
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === patternLower.length;
  }

  /**
   * Berechne Ähnlichkeit (Levenshtein Distance)
   */
  static similarity(str1: string, str2: string): StringSimilarityResult {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) {
      return { similarity: 1, distance: 0, percentage: 100, matches: 0 };
    }

    const distance = this.levenshteinDistance(str1, str2);
    const similarity = 1 - distance / maxLen;
    const percentage = Math.round(similarity * 100);
    const matches = this.countMatches(str1, str2);

    return { similarity, distance, percentage, matches };
  }

  /**
   * Levenshtein-Distanz berechnen
   */
  private static levenshteinDistance(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        const cost = s2[i - 1] === s1[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[len2][len1];
  }

  /**
   * Zähle Übereinstimmungen
   */
  private static countMatches(str1: string, str2: string): number {
    let matches = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] === str2[i]) matches++;
    }
    return matches;
  }

  /**
   * Ersetze Text mit Pattern
   */
  static replace(str: string, search: string | RegExp, replacement: string): string {
    if (typeof search === 'string') {
      return str.split(search).join(replacement);
    }
    return str.replace(search, replacement);
  }

  /**
   * Ersetze alle Vorkommen
   */
  static replaceAll(str: string, search: string, replacement: string): string {
    const regex = new RegExp(this.escapeRegex(search), 'g');
    return str.replace(regex, replacement);
  }

  /**
   * Escape Regex-Spezialzeichen
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validiere Email
   */
  static isEmail(str: string): StringValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(str);

    return {
      valid,
      errors: valid ? [] : ['Ungültiges Email-Format'],
      warnings: [],
      metadata: { format: 'email' },
    };
  }

  /**
   * Validiere URL
   */
  static isUrl(str: string): StringValidationResult {
    try {
      new URL(str);
      return {
        valid: true,
        errors: [],
        warnings: [],
        metadata: { format: 'url' },
      };
    } catch {
      return {
        valid: false,
        errors: ['Ungültiges URL-Format'],
        warnings: [],
      };
    }
  }

  /**
   * Validiere Telefonnummer
   */
  static isPhone(str: string): StringValidationResult {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const valid = phoneRegex.test(str) && str.replace(/\D/g, '').length >= 10;

    return {
      valid,
      errors: valid ? [] : ['Ungültiges Telefonformat'],
      warnings: [],
      metadata: { format: 'phone' },
    };
  }

  /**
   * Validiere Passwort
   */
  static isStrongPassword(str: string, minLength: number = 8): StringValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (str.length < minLength) errors.push(`Mindestlänge: ${minLength} Zeichen`);
    if (!/[a-z]/.test(str)) errors.push('Muss Kleinbuchstaben enthalten');
    if (!/[A-Z]/.test(str)) errors.push('Muss Großbuchstaben enthalten');
    if (!/\d/.test(str)) errors.push('Muss Ziffern enthalten');
    if (!/[!@#$%^&*]/.test(str)) warnings.push('Empfohlen: Spezialzeichen hinzufügen');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { strength: errors.length === 0 ? 'strong' : 'weak' },
    };
  }

  /**
   * Berechne String-Metriken
   */
  static getMetrics(str: string): StringMetrics {
    const chars = str.split('');
    const words = str.trim().split(/\s+/).filter((w) => w.length > 0);
    const lines = str.split('\n');
    const sentences = str.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    let vowels = 0;
    let consonants = 0;
    let digits = 0;
    let specialChars = 0;
    let spaces = 0;
    const uniqueChars = new Set(str);

    chars.forEach((char) => {
      if (/[aeiouAEIOU]/.test(char)) vowels++;
      else if (/[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/.test(char)) consonants++;
      else if (/\d/.test(char)) digits++;
      else if (/\s/.test(char)) spaces++;
      else specialChars++;
    });

    return {
      length: str.length,
      wordCount: words.length,
      characterCount: str.replace(/\s/g, '').length,
      uniqueCharacters: uniqueChars.size,
      vowels,
      consonants,
      digits,
      specialCharacters: specialChars,
      spaces,
      lines: lines.length,
      sentences: sentences.length,
      averageWordLength: words.length > 0 ? words.join('').length / words.length : 0,
      averageLineLength: lines.length > 0 ? str.length / lines.length : 0,
    };
  }

  /**
   * Normalisiere String
   */
  static normalize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Tokenisiere String
   */
  static tokenize(str: string, delimiter: string = /\s+/): string[] {
    const regex = typeof delimiter === 'string' ? new RegExp(this.escapeRegex(delimiter)) : delimiter;
    return str.split(regex).filter((token) => token.length > 0);
  }

  /**
   * Extrahiere Emails aus Text
   */
  static extractEmails(str: string): string[] {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
    return (str.match(emailRegex) || []).filter((email) => this.isEmail(email).valid);
  }

  /**
   * Extrahiere URLs aus Text
   */
  static extractUrls(str: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return str.match(urlRegex) || [];
  }

  /**
   * Extrahiere Zahlen aus Text
   */
  static extractNumbers(str: string): number[] {
    const numberRegex = /-?\d+\.?\d*/g;
    return (str.match(numberRegex) || []).map((num) => parseFloat(num));
  }

  /**
   * Extrahiere Hashtags
   */
  static extractHashtags(str: string): string[] {
    const hashtagRegex = /#\w+/g;
    return str.match(hashtagRegex) || [];
  }

  /**
   * Extrahiere @mentions
   */
  static extractMentions(str: string): string[] {
    const mentionRegex = /@\w+/g;
    return str.match(mentionRegex) || [];
  }

  /**
   * Truncate String
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  }

  /**
   * Capitalize String
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Decapitalize String
   */
  static decapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Swapcase String
   */
  static swapCase(str: string): string {
    return str.replace(/[a-z]/i, (char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase(),
    );
  }

  /**
   * Slugify String
   */
  static slugify(str: string, separator: string = '-'): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, separator)
      .replace(new RegExp(`${this.escapeRegex(separator)}+`, 'g'), separator)
      .replace(new RegExp(`^${this.escapeRegex(separator)}|${this.escapeRegex(separator)}$`, 'g'), '');
  }

  /**
   * Dezentrale Anführungszeichen
   */
  static unquote(str: string): string {
    return str.replace(/^["']|["']$/g, '');
  }

  /**
   * Zitiere String
   */
  static quote(str: string, char: string = '"'): string {
    return char + str + char;
  }

  /**
   * Escape HTML
   */
  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Unescape HTML
   */
  static unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  /**
   * Interpoliere Template-String
   */
  static interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\$\{([^}]+)\}/g, (_, key) => {
      const value = this.getNestedProperty(data, key);
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * Hole verschachtelte Eigenschaft
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Berechne String-Hash
   */
  static hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// ============================================================================
// STANDARD-EXPORT
// ============================================================================

export default StringUtil;
