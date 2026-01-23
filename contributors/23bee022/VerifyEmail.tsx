const VerifyEmail = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-900 p-8 text-center">
        <h1 className="text-2xl font-semibold mb-3">
          Verify your email
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          A verification link has been sent to your email address.
          Please verify to enable account-related features.
        </p>

        <button className="w-full px-4 py-3 bg-cyan-500 text-neutral-950 font-semibold hover:bg-cyan-400 transition-colors">
          Resend verification email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
