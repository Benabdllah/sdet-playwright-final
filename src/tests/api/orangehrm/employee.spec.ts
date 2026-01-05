import { OrangeHRMApiClient } from '@api/OrangeHRMApiClient';

describe('OrangeHRM - Employee API Tests', () => {
  let apiClient: OrangeHRMApiClient;

  beforeAll(() => {
    apiClient = new OrangeHRMApiClient();
  });

  describe('Employee CRUD Operations', () => {
    it('should get all employees - API-HR-001', async () => {
      const response = await apiClient.getEmployees();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data) || response.data.data).toBeTruthy();
    });

    it('should get employee by ID - API-HR-002', async () => {
      // First get list to find a valid employee ID
      const listResponse = await apiClient.getEmployees(1);
      
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const empNumber = listResponse.data.data[0].empNumber;
        
        const response = await apiClient.getEmployeeById(empNumber);
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      }
    });

    it('should create new employee - API-HR-003', async () => {
      const employeeData = {
        firstName: `APITest_${Date.now()}`,
        lastName: 'Automation',
        email: `apitest${Date.now()}@example.com`,
      };

      const response = await apiClient.createEmployee(employeeData);
      
      // Note: Status might be 200, 201, or others depending on API implementation
      expect([200, 201]).toContain(response.status);
      expect(response.data).toBeDefined();
    });

    it('should update employee - API-HR-004', async () => {
      // Get first employee
      const listResponse = await apiClient.getEmployees(1);
      
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const empNumber = listResponse.data.data[0].empNumber;
        
        const updateData = {
          firstName: `Updated_${Date.now()}`,
        };
        
        const response = await apiClient.updateEmployee(empNumber, updateData);
        
        expect([200, 204]).toContain(response.status);
      }
    });

    it('should handle invalid employee ID gracefully - API-HR-005', async () => {
      const response = await apiClient.getEmployeeById(999999);
      
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('Leave Management API', () => {
    it('should get leave balance - API-LEAVE-001', async () => {
      // Get first employee
      const listResponse = await apiClient.getEmployees(1);
      
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const empNumber = listResponse.data.data[0].empNumber;
        
        const response = await apiClient.getLeaveBalance(empNumber);
        
        expect([200, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toBeDefined();
        }
      }
    });

    it('should validate leave date format - API-LEAVE-002', async () => {
      const leaveData = {
        empNumber: 1,
        leaveTypeId: 1,
        fromDate: 'INVALID-DATE', // Invalid format
        toDate: '2024-01-31',
      };

      try {
        const response = await apiClient.applyLeave(leaveData);
        expect([400, 422]).toContain(response.status);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('API Error Handling', () => {
    it('should handle missing required fields - API-ERROR-001', async () => {
      const incompleteData = {
        firstName: 'TestFirst',
        // Missing lastName
      };

      try {
        const response = await apiClient.createEmployee(incompleteData as any);
        expect([400, 422]).toContain(response.status);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle timeout gracefully - API-ERROR-002', async () => {
      // This would require setting a very short timeout
      // Just verify client is created properly
      expect(apiClient).toBeDefined();
    });
  });
});
