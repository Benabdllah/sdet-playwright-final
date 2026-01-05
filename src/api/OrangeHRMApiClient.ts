import axios, { AxiosInstance } from 'axios';

export class OrangeHRMApiClient {
  private readonly client: AxiosInstance;
  private readonly baseURL = 'https://opensource-demo.orangehrmlive.com/api/v2';
  private token: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  /**
   * Authenticate with OrangeHRM API
   * Note: OrangeHRM may require OAuth2 or session-based auth
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      // OrangeHRM API typically uses OAuth2 or Laravel Sanctum tokens
      // This is a placeholder - adjust based on actual auth mechanism
      const response = await this.client.post('/auth/login', {
        username,
        password,
      });

      if (response.status === 200 && response.data.token) {
        this.token = response.data.token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Get all employees
   */
  async getEmployees(limit = 50, offset = 0): Promise<any> {
    try {
      const response = await this.client.get('/admin/employees', {
        params: { limit, offset },
      });
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get employees: ${error}`);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(empNumber: number): Promise<any> {
    try {
      const response = await this.client.get(`/admin/employees/${empNumber}`);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get employee: ${error}`);
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData: {
    firstName: string;
    lastName: string;
    email?: string;
    empNumber?: number;
  }): Promise<any> {
    try {
      const response = await this.client.post('/admin/employees', employeeData);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to create employee: ${error}`);
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(empNumber: number, employeeData: any): Promise<any> {
    try {
      const response = await this.client.put(`/admin/employees/${empNumber}`, employeeData);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to update employee: ${error}`);
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(empNumber: number): Promise<any> {
    try {
      const response = await this.client.delete(`/admin/employees/${empNumber}`);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error}`);
    }
  }

  /**
   * Get leave balance
   */
  async getLeaveBalance(empNumber: number): Promise<any> {
    try {
      const response = await this.client.get(`/admin/employees/${empNumber}/leave-balance`);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get leave balance: ${error}`);
    }
  }

  /**
   * Apply for leave
   */
  async applyLeave(leaveData: {
    empNumber: number;
    leaveTypeId: number;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
    comment?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/employee/leaves', leaveData);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to apply leave: ${error}`);
    }
  }

  /**
   * Get user info
   */
  async getUserInfo(): Promise<any> {
    try {
      const response = await this.client.get('/admin/users');
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error}`);
    }
  }
}
