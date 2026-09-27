import { Notification } from '../models.js';

/**
 * @desc Create a new notification
 * @route POST /api/notifications
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', metadata = {} } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const notification = await Notification.create({
      userId: req.user._id,
      title: String(title).trim(),
      message: String(message).trim(),
      type: type || 'info',
      metadata: metadata || {},
      unread: true,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('createNotification error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get user notifications
 * @route GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Mark single notification as read
 * @route PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { unread: false },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { unread: false });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete single notification
 * @route DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Clear all notifications for current user
 * @route DELETE /api/notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
