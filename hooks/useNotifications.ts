
import { useEffect, useRef } from 'react';
import { Task, Settings } from '../types';

export const useNotifications = (tasks: Task[], settings: Settings) => {
  const lastCheck = useRef<string>('');

  // Request permission if enabled in settings
  useEffect(() => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      // Avoid double firing in the same minute
      if (currentTime === lastCheck.current) return;
      lastCheck.current = currentTime;

      // 1. Daily Intention Reminder
      if (settings.dailyReminderTime === currentTime) {
        new Notification("The Intentional System", {
          body: "Align your compass. It's time to set your Daily Intention (Niyyah).",
          tag: 'daily-intention',
          icon: '/favicon.ico'
        });
      }

      // 2. Task Reminders
      tasks.forEach(task => {
        if (!task.completed && task.reminderTime === currentTime) {
          new Notification(`Reminder: ${task.title}`, {
            body: task.purpose ? `Purpose: ${task.purpose}` : "It's time to focus on this task.",
            tag: `task-${task.id}`,
            icon: '/favicon.ico'
          });
        }
      });
    };

    // Check every 10 seconds to ensure we catch the minute change
    const interval = setInterval(checkReminders, 10000); 
    
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, settings]);
};
