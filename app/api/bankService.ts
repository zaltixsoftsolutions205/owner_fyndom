import ApiClient from "./ApiClient";

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
}

interface BankDetailsResponse {
  success: boolean;
  message: string;
  data: {
    bankDetails: BankDetails & {
      isVerified: boolean;
    };
  };
}

export const bankService = {
  // Get bank details (from user data after login)
  async getBankDetails(): Promise<BankDetailsResponse['data']['bankDetails'] | null> {
    try {
      // Note: Bank details come with user data after login
      // You might need to fetch fresh user data if needed
      return null;
    } catch (error) {
      console.error('Error getting bank details:', error);
      return null;
    }
  },

  // Create or update bank details
  async createUpdateBankDetails(bankData: BankDetails): Promise<BankDetailsResponse> {
    try {
      const response = await ApiClient.post<BankDetailsResponse>('/details', bankData);
      return response;
    } catch (error: any) {
      console.error('Error updating bank details:', error);
      throw new Error(error.response?.data?.message || 'Failed to update bank details');
    }
  },

  // Validate bank details before submission
  validateBankDetails(bankData: BankDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bankData.accountHolderName?.trim()) {
      errors.push('Account holder name is required');
    }

    if (!bankData.accountNumber?.trim()) {
      errors.push('Account number is required');
    } else if (!/^\d{9,18}$/.test(bankData.accountNumber.replace(/\s/g, ''))) {
      errors.push('Account number should be 9-18 digits');
    }

    if (!bankData.ifscCode?.trim()) {
      errors.push('IFSC code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankData.ifscCode)) {
      errors.push('Invalid IFSC code format');
    }

    if (!bankData.bankName?.trim()) {
      errors.push('Bank name is required');
    }

    if (!bankData.branchName?.trim()) {
      errors.push('Branch name is required');
    }

    if (bankData.upiId && !/^[\w.-]+@[\w]+$/.test(bankData.upiId)) {
      errors.push('Invalid UPI ID format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};