import React from 'react';
import type { Notification } from '../types/Notification';
import { getWeight } from '../utils/heap';

interface NotificationCardProps {
  notification: Notification;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const { Type, Message, Timestamp } = notification;

  // Formats timestamps into a readable, localized layout
  const formatTimestamp = (rawTimestamp: string): string => {
    try {
      const date = new Date(rawTimestamp);
      if (isNaN(date.getTime())) {
        return rawTimestamp;
      }
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return rawTimestamp;
    }
  };

  const priorityWeight = getWeight(Type);

  // Categorize cards by priority style classes
  let priorityLabel = 'Low Priority';
  let badgeClass = 'badge-event';

  if (priorityWeight === 3) {
    priorityLabel = 'High Priority';
    badgeClass = 'badge-placement';
  } else if (priorityWeight === 2) {
    priorityLabel = 'Medium Priority';
    badgeClass = 'badge-result';
  }

  return (
    <article 
      className={`notification-card priority-${priorityWeight}`}
      aria-label={`Notification type: ${Type}, priority: ${priorityLabel}`}
    >
      <div className="card-header">
        <span className={`badge ${badgeClass}`}>{Type}</span>
        <time className="timestamp" dateTime={Timestamp}>
          {formatTimestamp(Timestamp)}
        </time>
      </div>
      <div className="card-body">
        <p className="message">{Message}</p>
      </div>
    </article>
  );
};
