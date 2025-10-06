import React from 'react';
import { useAuth } from '../utils/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const localStorageUser = localStorage.getItem('user');
  const localStorageToken = localStorage.getItem('token');
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>User Object:</strong></p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
          <div className="space-y-2">
            <p><strong>User Data:</strong></p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {localStorageUser || 'null'}
            </pre>
            <p><strong>Token:</strong></p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {localStorageToken || 'null'}
            </pre>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Local Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;