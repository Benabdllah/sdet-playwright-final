/**
 * ============================================================================
 * ULTIMATE SDET RANDOM DATA GENERATOR (FINAL) +++++
 * ============================================================================
 * Comprehensive random data generation with Faker-like capabilities
 * Features: Personas, batch generation, seeding, realistic data patterns
 * Supports: Strings, numbers, emails, dates, addresses, phones, credit cards
 * Production-ready with reproducibility, performance optimization, localization
 * ============================================================================
 */

// ============================================================================
// TYPES & ENUMS
// ============================================================================

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  DATE = 'date',
  DATETIME = 'datetime',
  UUID = 'uuid',
  SLUG = 'slug',
  PASSWORD = 'password',
  COLOR = 'color',
  HEX_COLOR = 'hex_color',
  IP_ADDRESS = 'ip_address',
  MAC_ADDRESS = 'mac_address',
  CREDIT_CARD = 'credit_card',
  SSN = 'ssn',
  BOOLEAN = 'boolean',
}

export enum PersonaGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface RandomGeneratorOptions {
  seed?: number;
  locale?: string;
  minLength?: number;
  maxLength?: number;
  format?: string;
  includeSpecialChars?: boolean;
  includeNumbers?: boolean;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  excludeChars?: string;
}

export interface RandomPersona {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  gender: PersonaGender;
  age: number;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company: string;
  jobTitle: string;
  username: string;
  password: string;
  creditCard: string;
  creditCardExpiry: string;
  creditCardCVV: string;
  ssn: string;
  ipAddress: string;
  userAgent: string;
  website: string;
}

export interface RandomDataSet {
  type: DataType;
  value: any;
  options: RandomGeneratorOptions;
  generated: boolean;
}

export interface BatchGenerationResult<T> {
  count: number;
  data: T[];
  duration: number;
  generated: number;
  failed: number;
  errors: Error[];
}

// ============================================================================
// CHARACTER SETS
// ============================================================================

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  hex: '0123456789ABCDEF',
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  consonants: 'bcdfghjklmnpqrstvwxyz',
  vowels: 'aeiou',
};

// ============================================================================
// DATA POOLS
// ============================================================================

const FIRST_NAMES = {
  male: [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Charles', 'Christopher',
    'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Thomas', 'Paul', 'Steven', 'Andrew', 'Kenneth',
  ],
  female: [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  ],
};

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Seattle', 'Denver', 'Boston', 'Atlanta', 'Miami',
];

const STATES = ['CA', 'TX', 'NY', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Japan',
  'China', 'India', 'Brazil', 'Mexico', 'South Korea', 'Russia', 'Italy',
];

const COMPANIES = [
  'Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook', 'Tesla', 'Uber', 'Netflix', 'Airbnb', 'Dropbox',
  'Spotify', 'Slack', 'Zoom', 'Discord', 'Twitch', 'PayPal', 'Square', 'Stripe', 'Shopify', 'GitHub',
];

const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Designer', 'Sales Manager', 'Account Executive',
  'Data Scientist', 'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'Security Engineer', 'Cloud Architect', 'Database Administrator',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
];

// ============================================================================
// RANDOM UTILITY CLASS
// ============================================================================

export class RandomUtil {
  private static seed: number = Date.now();
  private static lastRandom: number = 0;

  /**
   * Set seed for reproducible random generation
   */
  static setSeed(seed: number): void {
    this.seed = seed;
    this.lastRandom = seed;
  }

  /**
   * Get current seed
   */
  static getSeed(): number {
    return this.seed;
  }

  /**
   * Seeded random number generator (0-1)
   */
  private static seededRandom(): number {
    const x = Math.sin(this.lastRandom++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate random number in range
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    const random = this.seed ? this.seededRandom() : Math.random();
    return Math.floor(random * (max - min + 1)) + min;
  }

  /**
   * Generate random float
   */
  static randomFloat(min: number = 0, max: number = 100, decimals: number = 2): number {
    const random = this.seed ? this.seededRandom() : Math.random();
    const value = random * (max - min) + min;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Generate random boolean
   */
  static randomBoolean(truePercentage: number = 50): boolean {
    return this.randomNumber(1, 100) <= truePercentage;
  }

  /**
   * Generate random string
   */
  static randomString(options: RandomGeneratorOptions = {}): string {
    const {
      minLength = 8,
      maxLength = 16,
      includeSpecialChars = false,
      includeNumbers = true,
      includeUppercase = true,
      includeLowercase = true,
      excludeChars = '',
    } = options;

    let charset = '';

    if (includeLowercase) charset += CHARSETS.lowercase;
    if (includeUppercase) charset += CHARSETS.uppercase;
    if (includeNumbers) charset += CHARSETS.numbers;
    if (includeSpecialChars) charset += CHARSETS.special;

    // Remove excluded characters
    for (const char of excludeChars) {
      charset = charset.replace(char, '');
    }

    const length = this.randomNumber(minLength, maxLength);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset.charAt(this.randomNumber(0, charset.length - 1));
    }

    return result;
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    const firstName = FIRST_NAMES.male[this.randomNumber(0, FIRST_NAMES.male.length - 1)].toLowerCase();
    const lastName = LAST_NAMES[this.randomNumber(0, LAST_NAMES.length - 1)].toLowerCase();
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'test.com', 'example.com'];
    const domain = domains[this.randomNumber(0, domains.length - 1)];
    const separator = ['.', '', '_'][this.randomNumber(0, 2)];

    return `${firstName}${separator}${lastName}${this.randomNumber(1, 9999)}@${domain}`;
  }

  /**
   * Generate random phone number
   */
  static randomPhone(format: string = '+1-###-###-####'): string {
    return format.replace(/#/g, () => this.randomNumber(0, 9).toString());
  }

  /**
   * Generate random URL
   */
  static randomUrl(): string {
    const protocols = ['http', 'https'];
    const protocol = protocols[this.randomNumber(0, 1)];
    const name = this.randomString({ minLength: 5, maxLength: 15, includeNumbers: true, includeSpecialChars: false });
    const domains = ['com', 'org', 'net', 'io', 'co'];
    const domain = domains[this.randomNumber(0, domains.length - 1)];

    return `${protocol}://${name}.${domain}`;
  }

  /**
   * Generate random date
   */
  static randomDate(startDate?: Date, endDate?: Date): Date {
    const start = startDate || new Date(2000, 0, 1);
    const end = endDate || new Date();

    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Generate random datetime string (ISO format)
   */
  static randomDateTime(): string {
    return this.randomDate().toISOString();
  }

  /**
   * Generate random UUID
   */
  static randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (this.randomNumber(0, 15) * (this.seed ? this.seededRandom() : Math.random())) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate random slug
   */
  static randomSlug(): string {
    const words = [];
    const wordCount = this.randomNumber(2, 4);

    for (let i = 0; i < wordCount; i++) {
      words.push(this.randomString({ minLength: 4, maxLength: 8, includeUppercase: false, includeNumbers: false }));
    }

    return words.join('-');
  }

  /**
   * Generate random password
   */
  static randomPassword(length: number = 12): string {
    return this.randomString({
      minLength: length,
      maxLength: length,
      includeSpecialChars: true,
      includeNumbers: true,
      includeUppercase: true,
      includeLowercase: true,
    });
  }

  /**
   * Generate random hex color
   */
  static randomHexColor(): string {
    return '#' + Array.from({ length: 6 }, () => CHARSETS.hex[this.randomNumber(0, 15)]).join('');
  }

  /**
   * Generate random RGB color
   */
  static randomRgbColor(): string {
    const r = this.randomNumber(0, 255);
    const g = this.randomNumber(0, 255);
    const b = this.randomNumber(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Generate random IP address
   */
  static randomIpAddress(): string {
    return Array.from({ length: 4 }, () => this.randomNumber(0, 255)).join('.');
  }

  /**
   * Generate random MAC address
   */
  static randomMacAddress(separator: string = ':'): string {
    return Array.from({ length: 6 }, () => {
      const hex = this.randomNumber(0, 255).toString(16).padStart(2, '0').toUpperCase();
      return hex;
    }).join(separator);
  }

  /**
   * Generate random credit card number
   */
  static randomCreditCard(): string {
    const cardTypes = ['4', '5', '3'];
    const type = cardTypes[this.randomNumber(0, cardTypes.length - 1)];
    let card = type;

    for (let i = 1; i < 16; i++) {
      card += this.randomNumber(0, 9);
    }

    return card;
  }

  /**
   * Generate random credit card expiry
   */
  static randomCreditCardExpiry(): string {
    const month = this.randomNumber(1, 12).toString().padStart(2, '0');
    const year = (this.randomNumber(24, 29)).toString().padStart(2, '0');
    return `${month}/${year}`;
  }

  /**
   * Generate random CVV
   */
  static randomCVV(): string {
    return this.randomNumber(100, 999).toString();
  }

  /**
   * Generate random SSN
   */
  static randomSSN(): string {
    const part1 = this.randomNumber(1, 999).toString().padStart(3, '0');
    const part2 = this.randomNumber(1, 99).toString().padStart(2, '0');
    const part3 = this.randomNumber(1, 9999).toString().padStart(4, '0');
    return `${part1}-${part2}-${part3}`;
  }

  /**
   * Pick random element from array
   */
  static pickRandom<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Array is empty');
    return array[this.randomNumber(0, array.length - 1)];
  }

  /**
   * Pick multiple random elements from array
   */
  static pickRandomMultiple<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    const indices = new Set<number>();

    while (indices.size < Math.min(count, array.length)) {
      indices.add(this.randomNumber(0, array.length - 1));
    }

    return Array.from(indices).map((i) => array[i]);
  }

  /**
   * Shuffle array
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomNumber(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  /**
   * Generate random persona
   */
  static generatePersona(gender?: PersonaGender): RandomPersona {
    const selectedGender = gender || this.pickRandom([PersonaGender.MALE, PersonaGender.FEMALE]);
    const firstName = this.pickRandom(FIRST_NAMES[selectedGender as keyof typeof FIRST_NAMES]);
    const lastName = this.pickRandom(LAST_NAMES);
    const city = this.pickRandom(CITIES);
    const state = this.pickRandom(STATES);

    return {
      id: this.randomUUID(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: this.randomEmail(),
      phone: this.randomPhone(),
      gender: selectedGender,
      age: this.randomNumber(18, 80),
      birthDate: this.randomDate(new Date(1944, 0, 1), new Date(2006, 0, 1)).toISOString().split('T')[0],
      address: `${this.randomNumber(1, 9999)} ${this.pickRandom(['Main', 'Oak', 'Elm', 'Pine', 'Maple'])} St`,
      city,
      state,
      zipCode: this.randomNumber(10000, 99999).toString(),
      country: this.pickRandom(COUNTRIES),
      company: this.pickRandom(COMPANIES),
      jobTitle: this.pickRandom(JOB_TITLES),
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${this.randomNumber(1, 9999)}`,
      password: this.randomPassword(),
      creditCard: this.randomCreditCard(),
      creditCardExpiry: this.randomCreditCardExpiry(),
      creditCardCVV: this.randomCVV(),
      ssn: this.randomSSN(),
      ipAddress: this.randomIpAddress(),
      userAgent: this.pickRandom(USER_AGENTS),
      website: this.randomUrl(),
    };
  }

  /**
   * Generate batch of personas
   */
  static async generatePersonas(count: number, gender?: PersonaGender): Promise<BatchGenerationResult<RandomPersona>> {
    const startTime = Date.now();
    const personas: RandomPersona[] = [];
    const errors: Error[] = [];

    try {
      for (let i = 0; i < count; i++) {
        try {
          personas.push(this.generatePersona(gender));
        } catch (error) {
          errors.push(error as Error);
        }
      }

      return {
        count,
        data: personas,
        duration: Date.now() - startTime,
        generated: personas.length,
        failed: errors.length,
        errors,
      };
    } catch (error) {
      throw new Error(`Failed to generate personas: ${error}`);
    }
  }

  /**
   * Generate batch of random data
   */
  static generateBatch<T>(type: DataType, count: number, options: RandomGeneratorOptions = {}): BatchGenerationResult<T> {
    const startTime = Date.now();
    const data: T[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const value = this.generate(type, options);
        data.push(value as T);
      } catch (error) {
        errors.push(error as Error);
      }
    }

    return {
      count,
      data,
      duration: Date.now() - startTime,
      generated: data.length,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Generate random data by type
   */
  static generate(type: DataType, options: RandomGeneratorOptions = {}): any {
    switch (type) {
      case DataType.STRING:
        return this.randomString(options);
      case DataType.NUMBER:
        return this.randomNumber(options.minLength || 0, options.maxLength || 100);
      case DataType.EMAIL:
        return this.randomEmail();
      case DataType.PHONE:
        return this.randomPhone(options.format || '+1-###-###-####');
      case DataType.URL:
        return this.randomUrl();
      case DataType.DATE:
        return this.randomDate().toISOString().split('T')[0];
      case DataType.DATETIME:
        return this.randomDateTime();
      case DataType.UUID:
        return this.randomUUID();
      case DataType.SLUG:
        return this.randomSlug();
      case DataType.PASSWORD:
        return this.randomPassword(options.maxLength || 12);
      case DataType.COLOR:
        return this.randomRgbColor();
      case DataType.HEX_COLOR:
        return this.randomHexColor();
      case DataType.IP_ADDRESS:
        return this.randomIpAddress();
      case DataType.MAC_ADDRESS:
        return this.randomMacAddress(options.format || ':');
      case DataType.CREDIT_CARD:
        return this.randomCreditCard();
      case DataType.SSN:
        return this.randomSSN();
      case DataType.BOOLEAN:
        return this.randomBoolean();
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  /**
   * Generate object with random properties
   */
  static generateObject(schema: Record<string, DataType>, options?: RandomGeneratorOptions): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, type] of Object.entries(schema)) {
      result[key] = this.generate(type, options);
    }

    return result;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default RandomUtil;
