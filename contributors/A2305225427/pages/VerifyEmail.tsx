import React from 'react';

const VerifyEmail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 7.5L21 3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Check your email</h1>
          <p className="text-gray-400 text-lg mb-2">We've sent a verification link to</p>
          <p className="text-cyan-400 font-mono bg-gray-800/50 px-3 py-1 rounded-lg inline-block text-sm">
            your-email@example.com
          </p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
            Open Email App
          </button>
          
          <button className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:bg-gray-800/50">
            Resend Verification Email
          </button>
        </div>

        <div className="mt-10 space-y-2 text-xs text-gray-500">
          <p>• Check your spam folder if you don't see the email</p>
          <p>• Verification link expires in 24 hours</p>
          <p>• Didn't receive it? <span className="text-cyan-400 cursor-pointer hover:underline">Contact support</span></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
