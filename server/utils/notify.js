import Notification from '../models/Notification.js';

/**
 * Creates and persists a notification in the database
 * @param {Object} options
 * @param {String} options.recipient - User ObjectId
 * @param {String} [options.sender] - Optional User ObjectId
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification description
 * @param {String} [options.type] - Notification type ('Complaint', 'Appointment', 'Event', 'Skill', 'Announcement', 'System')
 * @param {String} [options.link] - Frontend route path
 */
export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'System',
  link = '',
}) => {
  try {
    if (!recipient) return null;

    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (err) {
    console.error('[Notification Dispatcher Error]:', err.message);
    return null;
  }
};
