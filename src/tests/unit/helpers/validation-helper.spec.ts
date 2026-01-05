import { ValidationHelper } from '@helpers';

describe('ValidationHelper - Unit Tests', () => {
  describe('Email Validation', () => {
    it('should validate correct email format - UNIT-VAL-001', () => {
      expect(ValidationHelper.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationHelper.isValidEmail('john.doe@company.co.uk')).toBe(true);
    });

    it('should reject invalid email format - UNIT-VAL-002', () => {
      expect(ValidationHelper.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationHelper.isValidEmail('@example.com')).toBe(false);
      expect(ValidationHelper.isValidEmail('test@')).toBe(false);
      expect(ValidationHelper.isValidEmail('test @example.com')).toBe(false);
    });

    it('should reject empty email - UNIT-VAL-003', () => {
      expect(ValidationHelper.isValidEmail('')).toBe(false);
    });
  });

  describe('Name Validation', () => {
    it('should validate correct names - UNIT-VAL-004', () => {
      expect(ValidationHelper.isValidName('John')).toBe(true);
      expect(ValidationHelper.isValidName('John Doe')).toBe(true);
      expect(ValidationHelper.isValidName('Jean-Claude')).toBe(true);
      expect(ValidationHelper.isValidName("O'Brien")).toBe(true);
    });

    it('should reject names with numbers - UNIT-VAL-005', () => {
      expect(ValidationHelper.isValidName('John123')).toBe(false);
      expect(ValidationHelper.isValidName('Test123Name')).toBe(false);
    });

    it('should reject empty or short names - UNIT-VAL-006', () => {
      expect(ValidationHelper.isValidName('')).toBe(false);
      expect(ValidationHelper.isValidName('A')).toBe(false);
    });

    it('should reject names with special characters - UNIT-VAL-007', () => {
      expect(ValidationHelper.isValidName('John@Doe')).toBe(false);
      expect(ValidationHelper.isValidName('John#Doe')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should validate correct date format - UNIT-VAL-008', () => {
      expect(ValidationHelper.isValidDate('2024-01-15')).toBe(true);
      expect(ValidationHelper.isValidDate('2024-12-31')).toBe(true);
    });

    it('should reject invalid date format - UNIT-VAL-009', () => {
      expect(ValidationHelper.isValidDate('01-15-2024')).toBe(false);
      expect(ValidationHelper.isValidDate('2024/01/15')).toBe(false);
      expect(ValidationHelper.isValidDate('15-01-2024')).toBe(false);
    });

    it('should reject invalid dates - UNIT-VAL-010', () => {
      expect(ValidationHelper.isValidDate('2024-13-01')).toBe(false);
      expect(ValidationHelper.isValidDate('2024-02-30')).toBe(false);
    });

    it('should reject empty date - UNIT-VAL-011', () => {
      expect(ValidationHelper.isValidDate('')).toBe(false);
    });
  });

  describe('Date Range Validation', () => {
    it('should validate correct date range - UNIT-VAL-012', () => {
      expect(ValidationHelper.isValidDateRange('2024-01-01', '2024-01-15')).toBe(true);
      expect(ValidationHelper.isValidDateRange('2024-01-01', '2024-01-01')).toBe(true); // Same day
    });

    it('should reject when from date is after to date - UNIT-VAL-013', () => {
      expect(ValidationHelper.isValidDateRange('2024-01-15', '2024-01-01')).toBe(false);
    });

    it('should reject invalid date formats in range - UNIT-VAL-014', () => {
      expect(ValidationHelper.isValidDateRange('invalid', '2024-01-15')).toBe(false);
      expect(ValidationHelper.isValidDateRange('2024-01-01', 'invalid')).toBe(false);
    });
  });

  describe('Employee ID Validation', () => {
    it('should validate correct employee IDs - UNIT-VAL-015', () => {
      expect(ValidationHelper.isValidEmployeeId(123)).toBe(true);
      expect(ValidationHelper.isValidEmployeeId('456')).toBe(true);
      expect(ValidationHelper.isValidEmployeeId(1)).toBe(true);
    });

    it('should reject invalid employee IDs - UNIT-VAL-016', () => {
      expect(ValidationHelper.isValidEmployeeId(0)).toBe(false);
      expect(ValidationHelper.isValidEmployeeId(-1)).toBe(false);
      expect(ValidationHelper.isValidEmployeeId('ABC')).toBe(false);
      expect(ValidationHelper.isValidEmployeeId('123ABC')).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone formats - UNIT-VAL-017', () => {
      expect(ValidationHelper.isValidPhoneNumber('+1234567890')).toBe(true);
      expect(ValidationHelper.isValidPhoneNumber('1234567890')).toBe(true);
      expect(ValidationHelper.isValidPhoneNumber('+1 (234) 567-8900')).toBe(true);
    });

    it('should reject invalid phone numbers - UNIT-VAL-018', () => {
      expect(ValidationHelper.isValidPhoneNumber('123')).toBe(false); // Too short
      expect(ValidationHelper.isValidPhoneNumber('ABC')).toBe(false);
    });
  });

  describe('Salary Validation', () => {
    it('should validate correct salary format - UNIT-VAL-019', () => {
      expect(ValidationHelper.isValidSalary('5000')).toBe(true);
      expect(ValidationHelper.isValidSalary('5000.50')).toBe(true);
      expect(ValidationHelper.isValidSalary(5000)).toBe(true);
    });

    it('should reject invalid salary format - UNIT-VAL-020', () => {
      expect(ValidationHelper.isValidSalary('5000.5555')).toBe(false); // Too many decimals
      expect(ValidationHelper.isValidSalary('-5000')).toBe(false); // Negative
      expect(ValidationHelper.isValidSalary('0')).toBe(false); // Zero
      expect(ValidationHelper.isValidSalary('ABC')).toBe(false);
    });
  });
});
