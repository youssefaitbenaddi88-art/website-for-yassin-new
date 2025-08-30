import { DonationData, Donation, Expense } from '../types';

export const saveDonationsToFile = async (donations: DonationData): Promise<void> => {
  try {
    // In a real environment, this would save to the file system
    // For now, we'll store in localStorage as a fallback
    localStorage.setItem('donations', JSON.stringify(donations, null, 2));
    console.log('Donations saved to localStorage');
  } catch (error) {
    console.error('Error saving donations:', error);
    throw new Error('Failed to save donations');
  }
};

export const loadDonationsFromFile = async (): Promise<DonationData> => {
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem('donations');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to importing the JSON file
    const { default: donationsData } = await import('../data/donations.json');
    return donationsData as DonationData;
  } catch (error) {
    console.error('Error loading donations:', error);
    return {};
  }
};

export const loadExpensesFromFile = async (): Promise<Expense[]> => {
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem('expenses');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to importing the JSON file
    const { default: expensesData } = await import('../data/expenses.json');
    return expensesData as Expense[];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const saveExpensesToFile = async (expenses: Expense[]): Promise<void> => {
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses, null, 2));
    console.log('Expenses saved to localStorage');
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw new Error('Failed to save expenses');
  }
};