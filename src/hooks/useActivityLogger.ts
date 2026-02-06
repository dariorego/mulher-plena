import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface LogOptions {
  resourceId?: string;
  journeyId?: string;
  stationId?: string;
  activityId?: string;
  metadata?: Record<string, Json>;
}

export function useActivityLogger() {
  const { user } = useAuth();

  const logAction = useCallback(
    (action: string, resourceType: string = 'platform', options?: LogOptions) => {
      if (!user) return;

      supabase
        .from('user_activity_logs')
        .insert([{
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: options?.resourceId || null,
          journey_id: options?.journeyId || null,
          station_id: options?.stationId || null,
          activity_id: options?.activityId || null,
          metadata: (options?.metadata || {}) as Json,
        }])
        .then(({ error }) => {
          if (error) console.error('Error logging activity:', error);
        });
    },
    [user]
  );

  return { logAction };
}

/** Standalone log function for contexts where the hook can't be used (e.g. AuthContext) */
export async function logActivityDirect(
  userId: string,
  action: string,
  resourceType: string = 'platform',
  options?: LogOptions
) {
  const { error } = await supabase
    .from('user_activity_logs')
    .insert([{
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: options?.resourceId || null,
      journey_id: options?.journeyId || null,
      station_id: options?.stationId || null,
      activity_id: options?.activityId || null,
      metadata: (options?.metadata || {}) as Json,
    }]);

  if (error) console.error('Error logging activity:', error);
}
