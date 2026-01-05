/**
 * Validation Helper für OrangeHRM Tests
 */

export class ValidationHelper {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate employee name (no numbers)
   */
  static isValidName(name: string): boolean {
    if (!name || name.trim().length === 0) return false;
    if (name.length < 2) return false;
    // Allow letters, hyphens, and spaces only
    return /^[a-zA-Z\s\-']+$/.test(name);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  /**
   * Validate date range (from <= to)
   */
  static isValidDateRange(fromDate: string, toDate: string): boolean {
    if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
      return false;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    return from <= to;
  }

  /**
   * Validate employee ID format
   */
  static isValidEmployeeId(empId: string | number): boolean {
    if (typeof empId === 'number') {
      return empId > 0;
    }
    return /^\d+$/.test(String(empId));
  }

  /**
   * Validate phone number (basic international format)
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Allow formats like: +1234567890 or 1234567890
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate salary (positive number with up to 2 decimals)
   */
  static isValidSalary(salary: string | number): boolean {
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    return salaryRegex.test(String(salary)) && Number.parseFloat(String(salary)) > 0;
  }
}
