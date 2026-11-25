import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { KiteLogo } from '../assets/KiteLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { User, Mail, Hash, Building2, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Department of Computer Science');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter your first and last name.';
    }

    if (!universityId.trim()) {
      newErrors.universityId = 'University ID is required.';
    } else if (universityId.trim().length < 4) {
      newErrors.universityId = 'University ID must be at least 4 characters (e.g. KIT-2026-4401).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'University Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid institutional email address.';
    }

    if (!department) {
      newErrors.department = 'Department selection is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register({
        fullName,
        universityId,
        email,
        department,
        password,
      });

      toast.success(
        'Patron Account Activated',
        `Welcome to Kite ILS, ${fullName}! Your library card has been provisioned.`
      );
      navigate('/dashboard');
    } catch {
      toast.error('Registration Error', 'Unable to register patron record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentsList = [
    { label: 'Department of Computer Science', value: 'Department of Computer Science' },
    { label: 'School of Architecture & Urban Design', value: 'School of Architecture & Urban Design' },
    { label: 'Department of Physics & Astronomy', value: 'Department of Physics & Astronomy' },
    { label: 'Department of Philosophy & Cognitive Science', value: 'Department of Philosophy & Cognitive Science' },
    { label: 'Faculty of Mathematics & Statistics', value: 'Faculty of Mathematics & Statistics' },
    { label: 'School of Economics & Public Policy', value: 'School of Economics & Public Policy' },
    { label: 'Department of Biological Sciences', value: 'Department of Biological Sciences' },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-block mb-3 focus:outline-none">
          <KiteLogo size={36} showText={true} />
        </Link>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
          Register Student Patron Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enroll your university credentials to enable automated locker holds, borrowing privileges, and spatial stacks guidance.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="bg-white shadow-xs p-6 sm:p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Alex Chen"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                leftIcon={<User className="w-4 h-4" />}
                error={errors.fullName}
                required
              />

              <Input
                label="University ID / Patron No. *"
                placeholder="e.g. KIT-2026-4401"
                value={universityId}
                onChange={(e) => {
                  setUniversityId(e.target.value);
                  if (errors.universityId) setErrors((prev) => ({ ...prev, universityId: '' }));
                }}
                leftIcon={<Hash className="w-4 h-4" />}
                error={errors.universityId}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="email"
                label="University Email *"
                placeholder="alex.chen@kite.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                required
              />

              <Select
                label="Academic Department *"
                options={departmentsList}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="password"
                label="Password *"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password}
                required
              />

              <Input
                type="password"
                label="Confirm Password *"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* University Library Terms Note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 leading-relaxed">
              By creating a Kite ILS account, you agree to comply with University Library Circulation Regulations, monograph loan deadlines, and respectful stacks conduct.
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Complete Registration
            </Button>
          </form>

          {/* Footer Link to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an active university patron ID? </span>
            <Link
              to="/login"
              className="font-medium text-sky-700 hover:text-sky-900 transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
