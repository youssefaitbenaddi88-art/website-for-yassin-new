import React, { useState, useEffect } from 'react';
import { Github, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface GitHubTokenSetupProps {
  isDarkMode: boolean;
}

export const GitHubTokenSetup: React.FC<GitHubTokenSetupProps> = ({ isDarkMode }) => {
  const [token, setToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    setIsTokenSet(!!savedToken);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    
    setIsValidating(true);
    
    try {
      // Validate token by making a test API call
      const response = await fetch('https://api.github.com/repos/sayprob/website-for-yassin/contents/src/data/donations.json', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (response.ok) {
        localStorage.setItem('github_token', token);
        setIsTokenSet(true);
        setShowTokenInput(false);
        alert('GitHub token saved successfully! Data will now sync with GitHub.');
      } else {
        alert('Invalid GitHub token. Please check your token and try again.');
      }
    } catch (error) {
      alert('Failed to validate GitHub token. Please check your internet connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveToken = () => {
    localStorage.removeItem('github_token');
    setToken('');
    setIsTokenSet(false);
    setShowTokenInput(false);
    alert('GitHub token removed. Data will only be saved locally.');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {!showTokenInput ? (
        <button
          onClick={() => setShowTokenInput(true)}
          className={`${
            isTokenSet 
              ? (isDarkMode ? 'bg-green-700 hover:bg-green-600 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700')
              : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700')
          } px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2`}
        >
          {isTokenSet ? <CheckCircle className="w-5 h-5" /> : <Github className="w-5 h-5" />}
          {isTokenSet ? 'GitHub متصل' : 'ربط GitHub'}
        </button>
      ) : (
        <div className={`${isDarkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-200'} rounded-lg shadow-xl p-4 w-80`}>
          <div className="flex items-center gap-2 mb-3">
            <Key className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              GitHub Token
            </h3>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-3`}>
            <p className="mb-2">لحفظ البيانات في GitHub، أدخل رمز الوصول الخاص بك:</p>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p>يجب أن يحتوي الرمز على صلاحيات:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>repo (للوصول للمستودع)</li>
                  <li>contents:write (لتعديل الملفات)</li>
                </ul>
              </div>
            </div>
          </div>

          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm mb-3`}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowTokenInput(false)}
              className={`flex-1 px-3 py-2 border ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} rounded-lg transition-colors duration-200 text-sm`}
            >
              إلغاء
            </button>
            {isTokenSet && (
              <button
                onClick={handleRemoveToken}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm"
              >
                إزالة
              </button>
            )}
            <button
              onClick={handleSaveToken}
              disabled={!token.trim() || isValidating}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              {isValidating ? 'التحقق...' : 'حفظ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};