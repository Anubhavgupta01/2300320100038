export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';

/**
 * Log transmits application-level logs to the external evaluation logging service.
 * Do NOT use console.log in the application; utilize this function instead.
 */
export async function Log(
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<void> {
  const rawToken = import.meta.env.VITE_AUTH_TOKEN;
  console.log("TOKEN:", import.meta.env.VITE_AUTH_TOKEN);
  const token = (rawToken || '').trim();
  
  if (!token) {
    console.error(`[Logger Error] VITE_AUTH_TOKEN is not defined in the environment variables.`);
    return;
  }

  const requestBody = {
    stack: 'frontend',
    level,
    package: packageName,
    message: message.length > 48 ? message.slice(0, 45) + '...' : message,
  };

  try {
    const response = await fetch('http://4.224.186.213/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      // Use console.warn only as a last resort fallback when the logging API fails
      console.warn(
        `[Logger Warning] Log transmission failed with status ${response.status}: ${response.statusText}\n` +
        `Response Body: ${responseBody}\n` +
        `Request Payload: ${JSON.stringify(requestBody)}`
      );
    }
  } catch (err) {
    console.error('[Logger Exception] Failed to transmit log to evaluation service:', err);
  }
}
