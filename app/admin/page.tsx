'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { supabase, type Booking } from '@/src/lib/supabase';
import { Calendar, Clock, Mail, Phone, Users, FileText, LogOut, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin session
    const token = localStorage.getItem('admin_session');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchBookings();
    }
  }, [router]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('admin_session');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // If unauthorized, redirect to login
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('admin_session');
        router.push('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  const exportBookings = () => {
    const csv = [
      ['Date', 'Time', 'Name', 'Email', 'Phone', 'Event Type', 'Budget', 'Guests', 'Location'],
      ...bookings.map(b => [
        b.consultation_date,
        b.consultation_time,
        `${b.first_name} ${b.last_name}`,
        b.email,
        b.phone,
        b.event_types?.join(', ') || '',
        b.budget || '',
        b.guests || '',
        b.event_location || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent"></div>
          <p className="mt-4 text-brand-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <header className="bg-white border-b border-brand-purple/10 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-brand-dark">Admin Dashboard</h1>
              <p className="text-sm text-brand-gray">Manage your bookings</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className="rounded-full">
                  View Site
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray mb-1">Total Bookings</p>
                <p className="text-3xl font-serif text-brand-dark">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-brand-purple opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray mb-1">This Month</p>
                <p className="text-3xl font-serif text-brand-dark">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.consultation_date);
                    const now = new Date();
                    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-brand-pink opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray mb-1">Pending</p>
                <p className="text-3xl font-serif text-brand-dark">
                  {bookings.filter(b => new Date(b.consultation_date) >= new Date()).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-brand-purple opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray mb-1">With Files</p>
                <p className="text-3xl font-serif text-brand-dark">
                  {bookings.filter(b => b.file_urls && b.file_urls.length > 0).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-brand-pink opacity-50" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-brand-dark">All Bookings</h2>
          <Button onClick={exportBookings} className="bg-brand-purple hover:bg-brand-pink text-white rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-purple/10">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-brand-light/50">
                    <td className="px-6 py-4 text-sm text-brand-dark">
                      {format(new Date(booking.consultation_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-dark">
                      {booking.consultation_time}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-brand-dark">
                          {booking.first_name} {booking.last_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-brand-gray">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${booking.email}`} className="hover:text-brand-pink">
                            {booking.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-brand-gray">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${booking.phone}`} className="hover:text-brand-pink">
                            {booking.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-gray">
                      {booking.event_types?.join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-dark">
                      {booking.budget || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {booking.file_urls && booking.file_urls.length > 0 ? (
                        <span className="inline-flex items-center text-xs bg-brand-pink/10 text-brand-pink px-2 py-1 rounded-full">
                          {booking.file_urls.length} file(s)
                        </span>
                      ) : (
                        <span className="text-sm text-brand-gray">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brand-gray">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
