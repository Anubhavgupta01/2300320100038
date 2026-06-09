import React, { useEffect, useState } from 'react';
import type { Notification } from '../types/Notification';
import { fetchNotifications } from '../api/notificationApi';
import { MinHeap, compareNotifications } from '../utils/heap';
import { NotificationCard } from '../components/NotificationCard';
import { Log } from '../utils/logger';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadNotifications = async () => {
    setLoading(true);
    await Log('info', 'state', 'State updated: loading set to true');
    setError(null);

    try {
      // API call automatically logs request details
      const allNotifications = await fetchNotifications();

      // Log sorting operation started
      await Log(
        'info',
        'page',
        `Sorting ${allNotifications.length} raw notifications using Min-Heap priority strategy.`
      );

      // Maintain a Min-Heap of size K = 10
      const heap = new MinHeap(compareNotifications);

      for (const item of allNotifications) {
        if (heap.size() < 10) {
          heap.push(item);
        } else {
          const root = heap.peek();
          // If current item is higher priority than the minimum in our top 10, swap
          if (root && compareNotifications(item, root) > 0) {
            heap.pop();
            heap.push(item);
          }
        }
      }

      // Convert heap to sorted descending array
      const top10 = heap.toSortedArray();

      // Log top 10 generation success
      await Log(
        'info',
        'page',
        `Top 10 generated successfully. Retained ${top10.length} highest priority notifications.`
      );

      setNotifications(top10);
      await Log('info', 'state', 'State updated: notifications collection populated.');
      
      setLastRefreshed(new Date());
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      setError(errorMsg);
      await Log('error', 'page', `Failed to load and prioritize notifications: ${errorMsg}`);
    } finally {
      setLoading(false);
      await Log('debug', 'state', 'State updated: loading set to false');
    }
  };

  useEffect(() => {
    // Mount log
    Log('info', 'page', 'NotificationsPage component mounted. Loading initial feed.');
    loadNotifications();
  }, []);

  return (
    <main className="page-container" id="notifications-page">
      <header className="page-header">
        <div className="header-title-area">
          <h1 className="main-title">Campus Notifications</h1>
          <p className="subtitle">Real-time alerts, placements, events, and results</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary refresh-button" 
            onClick={loadNotifications}
            disabled={loading}
            aria-label="Refresh notifications list"
          >
            {loading ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
      </header>

      {error && (
        <section className="error-state" aria-label="Error announcement">
          <div className="error-card">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <div className="error-details">
              <h3>Unable to load notifications</h3>
              <p>{error}</p>
            </div>
            <button className="btn btn-secondary retry-button" onClick={loadNotifications}>
              Retry Fetch
            </button>
          </div>
        </section>
      )}

      {loading && (
        <section className="loading-state" aria-label="Loading notifications">
          <div className="spinner" aria-hidden="true"></div>
          <p>Prioritizing notifications...</p>
        </section>
      )}

      {!loading && !error && (
        <section className="notifications-section">
          <div className="list-meta">
            <span className="results-count">
              Showing <strong>{notifications.length}</strong> highest priority alerts
            </span>
            <span className="last-sync">
              Updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">🔔</div>
              <h3>All caught up!</h3>
              <p>No unread notifications available at this time.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <NotificationCard 
                  key={notification.ID} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};
