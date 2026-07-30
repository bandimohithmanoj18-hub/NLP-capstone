import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Save,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isAdvocate, setIsAdvocate] = useState(user?.is_advocate || false);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-sm text-gray-600">
          Please sign in or use a demo account to access your user profile.
        </p>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile({
        full_name: fullName,
        phone_number: phone,
        is_advocate: isAdvocate,
        password: newPassword ? newPassword : undefined,
      });
      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-900">Account Profile</h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              user.is_advocate
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            {user.is_advocate ? 'Legal Advocate' : 'Consumer Account'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Manage your consumer identity, contact details, and advocate credentials for legal drafting.
        </p>
      </div>

      {/* Account Overview Badge Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base">
              {user.full_name || 'Anonymous Consumer'}
            </div>
            <div className="text-xs text-gray-600">{user.email}</div>
            <div className="text-xs text-blue-700 font-medium mt-0.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OAuth2 JWT Protected & Active</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-base mb-4">
          Personal & Professional Details
        </h3>

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address (Immutable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Display Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="advocate-toggle"
              checked={isAdvocate}
              onChange={(e) => setIsAdvocate(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="advocate-toggle"
              className="text-xs font-medium text-gray-700"
            >
              I am a Legal Advocate / Practice before Consumer Courts
            </label>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Change Password (Leave blank to keep current)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
