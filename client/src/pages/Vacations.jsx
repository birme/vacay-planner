import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { vacationService } from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';
import { format, parseISO } from 'date-fns';

const statusIcons = {
  pending: ClockIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Vacations() {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: vacations, isLoading } = useQuery('vacations', () =>
    vacationService.getVacations().then(res => res.data)
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => vacationService.updateVacation(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacations');
      },
    }
  );

  const deleteVacationMutation = useMutation(vacationService.deleteVacation, {
    onSuccess: () => {
      queryClient.invalidateQueries('vacations');
    },
  });

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vacation request?')) {
      deleteVacationMutation.mutate(id);
    }
  };

  const filteredVacations = vacations?.filter(vacation => {
    if (filter === 'all') return true;
    return vacation.status === filter;
  }) || [];

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            {isAdmin ? 'All Vacation Requests' : 'My Vacation Requests'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isAdmin 
              ? 'Review and manage vacation requests from all team members.'
              : 'Manage your vacation requests and track their status.'
            }
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/vacations/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" aria-hidden="true" />
            New Request
          </Link>
        </div>
      </div>

      <div className="flex space-x-4">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 text-sm font-medium rounded-md capitalize ${
              filter === status
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-600 rounded-full">
                {vacations?.filter(v => v.status === status).length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVacations.map((vacation) => {
              const StatusIcon = statusIcons[vacation.status];
              return (
                <tr key={vacation.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vacation.title}</div>
                      {vacation.description && (
                        <div className="text-sm text-gray-500">{vacation.description}</div>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vacation.userName}</div>
                      <div className="text-sm text-gray-500">{vacation.userEmail}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(parseISO(vacation.startDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {format(parseISO(vacation.endDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 capitalize">
                      {vacation.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[vacation.status]}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {vacation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {isAdmin && vacation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(vacation.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(vacation.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <Link
                        to={`/vacations/${vacation.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(vacation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredVacations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No vacation requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}