import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { KiteLogo } from '../assets/KiteLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Lock, Mail, UserCheck, Shield, GraduationCap, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, loginAsDemo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide your university email/ID and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(identifier, password);
      const isLibrarian = identifier.toLowerCase().includes('lib') || identifier.toLowerCase().includes('vance');
      toast.success(
        'Signed In Successfully',
        `Welcome to Kite ILS, ${isLibrarian ? 'Prof. Vance' : 'Alex Chen'}.`
      );
      navigate(isLibrarian ? '/admin/dashboard' : '/dashboard');
    } catch {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStudent = () => {
    loginAsDemo('student');
    toast.success('Signed In as Demo Student', 'Navigating to Student Research Dashboard...');
    navigate('/dashboard');
  };

  const handleDemoLibrarian = () => {
    loginAsDemo('librarian');
    toast.success('Signed In as Demo Librarian', 'Navigating to Library Administration Dashboard...');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3 focus:outline-none">
          <KiteLogo size={36} showText={true} />
        </Link>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
          Sign In to Kite ILS
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Use your verified university credentials or select a mock demo role.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="University Email / Student ID"
              placeholder="e.g. alex.chen@kite.edu or KIT-2026-4401"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError(null);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-sky-700 hover:text-sky-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Mock Role Switchers */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3 text-center">
              Or Instant Demo Authentication
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<GraduationCap className="w-4 h-4 text-sky-600" />}
                onClick={handleDemoStudent}
                className="text-xs"
              >
                Demo Student
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Shield className="w-4 h-4 text-slate-700" />}
                onClick={handleDemoLibrarian}
                className="text-xs"
              >
                Demo Librarian
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Instant login with simulated research privileges & local session state.
            </p>
          </div>

          {/* Footer Link to Register */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>New student, faculty or researcher? </span>
            <Link
              to="/register"
              className="font-medium text-sky-700 hover:text-sky-900 transition-colors"
            >
              Register Patron Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
