import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { vacationService, calendarService } from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

const statusIcons = {
  pending: ClockIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
};

const statusColors = {
  pending: 'text-yellow-500',
  approved: 'text-green-500',
  rejected: 'text-red-500',
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  
  const { data: vacations, isLoading } = useQuery('vacations', () =>
    vacationService.getVacations().then(res => res.data)
  );

  const { data: calendarUrls } = useQuery('calendarUrls', () =>
    calendarService.getCalendarUrls().then(res => res.data)
  );

  const upcomingVacations = vacations?.filter(vacation => {
    const startDate = parseISO(vacation.startDate);
    return isAfter(startDate, new Date()) && vacation.status === 'approved';
  }).slice(0, 5) || [];

  const pendingApprovals = vacations?.filter(vacation => 
    vacation.status === 'pending'
  ).length || 0;

  const myVacations = vacations?.filter(vacation => 
    vacation.userId === user?.id
  ) || [];

  const recentVacations = myVacations.slice(0, 3);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {user?.name}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/vacations/new"
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Vacation Request
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">My Vacation Requests</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {myVacations.length}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Upcoming Approved</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {myVacations.filter(v => 
              v.status === 'approved' && isAfter(parseISO(v.startDate), new Date())
            ).length}
          </dd>
        </div>

        {isAdmin && (
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Pending Approvals</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {pendingApprovals}
            </dd>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">My Recent Requests</h3>
            <div className="mt-6 flow-root">
              {recentVacations.length > 0 ? (
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentVacations.map((vacation) => {
                    const StatusIcon = statusIcons[vacation.status];
                    return (
                      <li key={vacation.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <StatusIcon className={`h-6 w-6 ${statusColors[vacation.status]}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {vacation.title}
                            </p>
                            <p className="truncate text-sm text-gray-500">
                              {format(parseISO(vacation.startDate), 'MMM d')} - {format(parseISO(vacation.endDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                              vacation.status === 'approved' ? 'bg-green-100 text-green-800' :
                              vacation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {vacation.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No vacation requests yet.</p>
              )}
            </div>
            <div className="mt-6">
              <Link
                to="/vacations"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all requests
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Team Calendar</h3>
            <div className="mt-6 flow-root">
              {upcomingVacations.length > 0 ? (
                <ul className="-my-5 divide-y divide-gray-200">
                  {upcomingVacations.map((vacation) => (
                    <li key={vacation.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {vacation.userName} - {vacation.title}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {format(parseISO(vacation.startDate), 'MMM d')} - {format(parseISO(vacation.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No upcoming team vacations.</p>
              )}
            </div>
            
            {calendarUrls && (
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium text-gray-900">Calendar Feeds</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Personal Feed</label>
                    <input
                      type="text"
                      readOnly
                      value={calendarUrls.personalFeed}
                      className="mt-1 block w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Team Feed</label>
                    <input
                      type="text"
                      readOnly
                      value={calendarUrls.teamFeed}
                      className="mt-1 block w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}