import ApiClient from "./ApiClient";

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  isVerified?: boolean;
}

interface BankDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    hostelId: string;
    hostelName: string;
    bankDetails: BankDetails & {
      isVerified: boolean;
    };
  };
  errors?: any;
}

interface GetBankDetailsResponse {
  success: boolean;
  data?: {
    hostelId: string;
    hostelName: string;
    bankDetails: BankDetails & {
      isVerified: boolean;
    };
  };
  errors?: any;
}

interface ValidationError {
  field: string;
  message: string;
}

export const bankService = {
  // Set bank details for a specific approved hostel
  async setBankDetails(hostelId: string, bankData: BankDetails): Promise<BankDetailsResponse> {
    try {
      // Format the data exactly as the API expects
      const payload = {
        accountHolderName: bankData.accountHolderName,
        accountNumber: bankData.accountNumber,
        ifscCode: bankData.ifscCode,
        bankName: bankData.bankName,
        branchName: bankData.branchName,
        upiId: bankData.upiId || '', // Empty string if not provided
      };

      console.log('📤 Sending bank details payload:', {
        url: `/bank/hostel/${hostelId}/details`,
        payload,
        hostelId
      });

      const response = await ApiClient.post<BankDetailsResponse>(
        `/bank/hostel/${hostelId}/details`,
        payload
      );
      
      console.log('✅ Bank details response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to set bank details');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Error setting bank details:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        hostelId
      });
      
      // Extract validation errors from response
      if (error.response?.data?.errors) {
        const validationErrors = this.parseValidationErrors(error.response.data.errors);
        throw new Error(validationErrors);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to set bank details');
    }
  },

  // Parse validation errors from backend
  parseValidationErrors(errors: any): string {
    if (Array.isArray(errors)) {
      return errors.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.msg) return err.msg;
        return JSON.stringify(err);
      }).join(', ');
    }
    
    if (typeof errors === 'object') {
      const errorMessages: string[] = [];
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => {
            errorMessages.push(`${field}: ${msg}`);
          });
        } else if (typeof messages === 'string') {
          errorMessages.push(`${field}: ${messages}`);
        }
      });
      return errorMessages.join(', ');
    }
    
    if (typeof errors === 'string') {
      return errors;
    }
    
    return 'Validation failed. Please check all fields.';
  },

  // Get bank details for a specific approved hostel
  async getBankDetails(hostelId: string): Promise<GetBankDetailsResponse> {
    try {
      console.log('📥 Getting bank details for hostel:', hostelId);
      
      const response = await ApiClient.get<GetBankDetailsResponse>(
        `/bank/hostel/${hostelId}/details`
      );
      
      console.log('✅ Bank details fetched:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get bank details');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Error getting bank details:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        hostelId
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to get bank details');
    }
  },

  // Validate bank details before submission (client-side validation)
  validateBankDetails(bankData: BankDetails): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Trim all inputs
    const trimmedData = {
      accountHolderName: bankData.accountHolderName?.trim() || '',
      accountNumber: bankData.accountNumber?.trim() || '',
      ifscCode: bankData.ifscCode?.trim() || '',
      bankName: bankData.bankName?.trim() || '',
      branchName: bankData.branchName?.trim() || '',
      upiId: bankData.upiId?.trim() || '',
    };

    // Account Holder Name validation
    if (!trimmedData.accountHolderName) {
      errors.accountHolderName = 'Account holder name is required';
    } else if (trimmedData.accountHolderName.length < 3) {
      errors.accountHolderName = 'Account holder name must be at least 3 characters';
    } else if (!/^[A-Za-z\s.]{3,}$/.test(trimmedData.accountHolderName)) {
      errors.accountHolderName = 'Only letters, spaces and dots are allowed';
    }

    // Account Number validation
    if (!trimmedData.accountNumber) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(trimmedData.accountNumber)) {
      errors.accountNumber = 'Account number should be 9-18 digits (numbers only)';
    }

    // IFSC Code validation
    if (!trimmedData.ifscCode) {
      errors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmedData.ifscCode)) {
      errors.ifscCode = 'Invalid IFSC code format (e.g., SBIN0001234)';
    }

    // Bank Name validation
    if (!trimmedData.bankName) {
      errors.bankName = 'Bank name is required';
    } else if (trimmedData.bankName.length < 2) {
      errors.bankName = 'Bank name must be at least 2 characters';
    }

    // Branch Name validation
    if (!trimmedData.branchName) {
      errors.branchName = 'Branch name is required';
    } else if (trimmedData.branchName.length < 2) {
      errors.branchName = 'Branch name must be at least 2 characters';
    }

    // UPI ID validation (optional)
    if (trimmedData.upiId && !/^[\w.-]+@[\w]+$/.test(trimmedData.upiId)) {
      errors.upiId = 'Invalid UPI ID format (e.g., name@bank)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Get approved hostels from user data
  getApprovedHostels(user: any): any[] {
    if (!user || !user.hostels) return [];
    return user.hostels.filter((hostel: any) => 
      hostel.status === 'approved' && hostel.isActive === true
    );
  },

  // Check if a specific hostel is approved
  isHostelApproved(user: any, hostelId: string): boolean {
    const approvedHostels = this.getApprovedHostels(user);
    return approvedHostels.some(hostel => hostel.hostelId === hostelId);
  },

  // Get hostel details by ID
  getHostelById(user: any, hostelId: string): any | null {
    if (!user || !user.hostels) return null;
    return user.hostels.find((hostel: any) => hostel.hostelId === hostelId);
  }
};