import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { KiteLogo } from '../assets/KiteLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please provide a valid university email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setIsSent(true);
      toast.success(
        'Reset Instructions Dispatched',
        `A secure verification token has been routed to ${email}.`
      );
    } catch {
      setError('Unable to dispatch reset email. Please contact library IT.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3 focus:outline-none">
          <KiteLogo size={36} showText={true} />
        </Link>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
          Reset Library Credentials
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Recover patron account access via institutional identity recovery.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white shadow-xs p-6 sm:p-8">
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your verified university email associated with your library card. We will send a secure password reset link valid for 60 minutes.
              </p>

              <Input
                type="email"
                label="University Email"
                placeholder="jensen@jainuniversity.ac.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Send Password Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-medium text-slate-900">
                  Check Your University Inbox
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  We have sent credentials reset instructions to{' '}
                  <strong className="text-slate-800">{email}</strong>. Please check your inbox and spam filters.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsSent(false)}
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
