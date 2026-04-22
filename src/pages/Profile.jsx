import React from 'react';
import { User } from 'lucide-react';

export default function Profile({ user }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 dark:border-purple-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center border-4 border-purple-200 dark:border-purple-700">
                <User className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.displayName || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                <p className="text-gray-900 dark:text-white">{user.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              {user.mobile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <p className="text-gray-900 dark:text-white">{user.mobile}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">App Usage</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                <p className="text-gray-900 dark:text-white">Recent</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="text-green-600 dark:text-green-400">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
