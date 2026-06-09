import type { Notification } from '../types/Notification';
import { Log } from '../utils/logger';

/**
 * Fetches notifications from the evaluation service endpoint.
 * Requires Bearer Token authorization.
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const rawToken = import.meta.env.VITE_AUTH_TOKEN;
  console.log("TOKEN:", import.meta.env.VITE_AUTH_TOKEN);
  const token = (rawToken || '').trim();

  // Log API request started
  await Log('info', 'api', 'API request started: Fetching notifications.');

  if (!token) {
    const errorMsg = 'VITE_AUTH_TOKEN environment variable is missing or empty.';
    await Log('error', 'api', `API request failed: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch('http://4.224.186.213/evaluation-service/notifications', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMsg = `Server responded with status ${response.status}: ${response.statusText}`;
      await Log('error', 'api', `API request failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (
      !data ||
      !data.notifications ||
      !Array.isArray(data.notifications)
    ) {
      const errorMsg = 'Invalid notifications response format';
      await Log('error', 'api', `API request failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Log API request success
    await Log(
      'info',
      'api',
      `API request successful: Retrieved ${data.notifications.length} notifications.`
    );

    return data.notifications as Notification[];
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // Log API request failure
    await Log('error', 'api', `API request failed: ${errorMsg}`);
    throw error;
  }
}
