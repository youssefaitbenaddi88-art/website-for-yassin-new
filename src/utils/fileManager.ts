import { DonationData, Donation, Expense } from '../types';

// GitHub configuration
const GITHUB_CONFIG = {
  owner: 'sayprob',
  repo: 'website-for-yassin',
  donationsPath: 'src/data/donations.json',
  expensesPath: 'src/data/expenses.json',
};

// GitHub Pages URLs for loading data
const GITHUB_PAGES_URLS = {
  donations: 'https://sayprob.github.io/website-for-yassin/src/data/donations.json',
  expenses: 'https://sayprob.github.io/website-for-yassin/src/data/expenses.json',
};

// Get GitHub token from localStorage
const getGitHubToken = (): string | null => {
  return localStorage.getItem('github_token');
};

// GitHub API headers
const getGitHubHeaders = () => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found');
  }
  
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
};

// Get file SHA from GitHub API (needed for updates)
const getFileSha = async (path: string): Promise<string> => {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
  
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get file SHA: ${response.statusText}`);
  }

  const data = await response.json();
  return data.sha;
};

// Load donations from GitHub Pages
export const loadDonationsFromFile = async (): Promise<DonationData> => {
  try {
    console.log('Loading donations from GitHub Pages...');
    
    // Try to fetch fresh data from GitHub Pages with cache busting
    const response = await fetch(`${GITHUB_PAGES_URLS.donations}?t=${Date.now()}`, {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const freshData = await response.json();
      console.log('Successfully loaded donations from GitHub Pages:', freshData);
      // Update localStorage with fresh data
      localStorage.setItem('donations', JSON.stringify(freshData, null, 2));
      return freshData as DonationData;
    } else {
      console.warn(`GitHub Pages response not ok: ${response.status}`);
      throw new Error(`GitHub Pages response not ok: ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to fetch donations from GitHub Pages, trying localStorage:', error);
    
    // Fallback to localStorage
    const stored = localStorage.getItem('donations');
    if (stored) {
      console.log('Using cached donations from localStorage');
      return JSON.parse(stored);
    }
    
    // Final fallback to local JSON file
    try {
      const { default: donationsData } = await import('../data/donations.json');
      console.log('Using local donations data as fallback');
      return donationsData as DonationData;
    } catch (importError) {
      console.error('All fallbacks failed for donations:', importError);
      return {};
    }
  }
};

// Load expenses from GitHub Pages
export const loadExpensesFromFile = async (): Promise<Expense[]> => {
  try {
    console.log('Loading expenses from GitHub Pages...');
    
    // Try to fetch fresh data from GitHub Pages with cache busting
    const response = await fetch(`${GITHUB_PAGES_URLS.expenses}?t=${Date.now()}`, {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const freshData = await response.json();
      console.log('Successfully loaded expenses from GitHub Pages:', freshData);
      // Update localStorage with fresh data
      localStorage.setItem('expenses', JSON.stringify(freshData, null, 2));
      return freshData as Expense[];
    } else {
      console.warn(`GitHub Pages response not ok: ${response.status}`);
      throw new Error(`GitHub Pages response not ok: ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to fetch expenses from GitHub Pages, trying localStorage:', error);
    
    // Fallback to localStorage
    const stored = localStorage.getItem('expenses');
    if (stored) {
      console.log('Using cached expenses from localStorage');
      return JSON.parse(stored);
    }
    
    // Final fallback to local JSON file
    try {
      const { default: expensesData } = await import('../data/expenses.json');
      console.log('Using local expenses data as fallback');
      return expensesData as Expense[];
    } catch (importError) {
      console.error('All fallbacks failed for expenses:', importError);
      return [];
    }
  }
};

// Save donations to GitHub repository
export const saveDonationsToFile = async (donations: DonationData): Promise<void> => {
  try {
    // Always save to localStorage first for immediate feedback
    localStorage.setItem('donations', JSON.stringify(donations, null, 2));
    console.log('Donations saved to localStorage');
    
    // Try to save to GitHub if token is available
    const token = getGitHubToken();
    if (!token) {
      console.log('No GitHub token found, saving only to localStorage');
      return;
    }

    try {
      const content = JSON.stringify(donations, null, 2);
      const encodedContent = btoa(content);
      const sha = await getFileSha(GITHUB_CONFIG.donationsPath);
      
      const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.donationsPath}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getGitHubHeaders(),
        body: JSON.stringify({
          message: 'Update donations data via web interface',
          content: encodedContent,
          sha,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      console.log('Donations saved to GitHub successfully');
    } catch (githubError) {
      console.warn('Failed to save donations to GitHub:', githubError);
      // Don't throw error here - local save succeeded
      throw new Error(`Failed to sync with GitHub: ${githubError instanceof Error ? githubError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in saveDonationsToFile:', error);
    throw error;
  }
};

// Save expenses to GitHub repository
export const saveExpensesToFile = async (expenses: Expense[]): Promise<void> => {
  try {
    // Always save to localStorage first for immediate feedback
    localStorage.setItem('expenses', JSON.stringify(expenses, null, 2));
    console.log('Expenses saved to localStorage');
    
    // Try to save to GitHub if token is available
    const token = getGitHubToken();
    if (!token) {
      console.log('No GitHub token found, saving only to localStorage');
      return;
    }

    try {
      const content = JSON.stringify(expenses, null, 2);
      const encodedContent = btoa(content);
      const sha = await getFileSha(GITHUB_CONFIG.expensesPath);
      
      const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.expensesPath}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getGitHubHeaders(),
        body: JSON.stringify({
          message: 'Update expenses data via web interface',
          content: encodedContent,
          sha,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      console.log('Expenses saved to GitHub successfully');
    } catch (githubError) {
      console.warn('Failed to save expenses to GitHub:', githubError);
      // Don't throw error here - local save succeeded
      throw new Error(`Failed to sync with GitHub: ${githubError instanceof Error ? githubError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in saveExpensesToFile:', error);
    throw error;
  }
};