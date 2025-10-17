import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vacationService } from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';

export default function VacationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: vacation, isLoading } = useQuery(
    ['vacation', id],
    () => vacationService.getVacation(id).then(res => res.data),
    { enabled: isEditing }
  );

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

  const createMutation = useMutation(vacationService.createVacation, {
    onSuccess: () => {
      queryClient.invalidateQueries('vacations');
      navigate('/vacations');
    },
  });

  const updateMutation = useMutation(
    (data) => vacationService.updateVacation(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacations');
        navigate('/vacations');
      },
    }
  );

  useEffect(() => {
    if (vacation) {
      reset({
        title: vacation.title,
        description: vacation.description,
        startDate: vacation.startDate.split('T')[0],
        endDate: vacation.endDate.split('T')[0],
        type: vacation.type,
        ...(isAdmin && { status: vacation.status }),
      });
    }
  }, [vacation, reset, isAdmin]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const startDate = watch('startDate');

  if (isLoading && isEditing) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">
          {isEditing ? 'Edit Vacation Request' : 'New Vacation Request'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          {isEditing 
            ? 'Update your vacation request details.'
            : 'Submit a new vacation request for approval.'
          }
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Title
              </label>
              <div className="mt-2">
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Summer vacation"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  {...register('description')}
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Optional description of your vacation plans..."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Start Date
              </label>
              <div className="mt-2">
                <input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="date"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                End Date
              </label>
              <div className="mt-2">
                <input
                  {...register('endDate', { 
                    required: 'End date is required',
                    validate: (value) => {
                      if (startDate && value && new Date(value) < new Date(startDate)) {
                        return 'End date must be after start date';
                      }
                      return true;
                    }
                  })}
                  type="date"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Type
              </label>
              <div className="mt-2">
                <select
                  {...register('type')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {isAdmin && isEditing && (
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Status
                </label>
                <div className="mt-2">
                  <select
                    {...register('status')}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/vacations')}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isEditing ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}