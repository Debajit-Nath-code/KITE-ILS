import React, { useState } from 'react';
import { Users, Search, ShieldCheck, UserCheck, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const patrons = [
    {
      id: 'usr-01',
      name: 'Alex Chen',
      email: 'alex.chen@kite.edu',
      patronNumber: 'KIT-2026-4401',
      role: 'Student (Undergraduate)',
      department: 'Computer Science',
      loansCount: 3,
      reservationsCount: 1,
      standing: 'Good Standing',
    },
    {
      id: 'usr-02',
      name: 'Dr. Aris Thorne',
      email: 'a.thorne@kite.edu',
      patronNumber: 'KIT-8849-012',
      role: 'Faculty Researcher',
      department: 'Computing & Information Science',
      loansCount: 4,
      reservationsCount: 0,
      standing: 'Good Standing',
    },
    {
      id: 'usr-03',
      name: 'Elena Rostova',
      email: 'e.rostova@kite.edu',
      patronNumber: 'KIT-2026-1182',
      role: 'Graduate Researcher',
      department: 'Design & Media Arts',
      loansCount: 2,
      reservationsCount: 1,
      standing: 'Good Standing',
    },
    {
      id: 'usr-04',
      name: 'Marcus Holloway',
      email: 'm.holloway@kite.edu',
      patronNumber: 'KIT-2025-9034',
      role: 'Student (Senior)',
      department: 'Mathematics',
      loansCount: 1,
      reservationsCount: 0,
      standing: 'Good Standing',
    },
    {
      id: 'usr-05',
      name: 'Prof. Margaret Vance',
      email: 'm.vance@kite.edu',
      patronNumber: 'KIT-LIB-009',
      role: 'Head Librarian',
      department: 'University Library Administration',
      loansCount: 0,
      reservationsCount: 0,
      standing: 'Faculty Admin',
    },
  ];

  const filtered = patrons.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.patronNumber.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 select-none">
              Patron Services
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-500">{patrons.length} Registered Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Patron Accounts & Circulation Privileges
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Student, researcher, and faculty borrowing privileges, university ID cards, and account standings.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-white border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patron name, university ID, department..."
            className="w-full h-9 px-3 pl-9 bg-slate-50 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </Card>

      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Patron Name</th>
                <th className="px-4 py-3">University ID</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3">Active Loans</th>
                <th className="px-4 py-3">Active Holds</th>
                <th className="px-4 py-3">Account Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {u.name}
                    <span className="text-[11px] font-normal text-slate-500 block">{u.email}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-700">{u.patronNumber}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="block font-medium">{u.department}</span>
                    <span className="text-[10px] text-slate-500">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800">{u.loansCount} books</td>
                  <td className="px-4 py-3 font-mono text-slate-800">{u.reservationsCount} holds</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {u.standing}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
