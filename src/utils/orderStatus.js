/**
 * Get display label for order status based on order type
 * @param {string} status - The order status (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
 * @param {string} orderType - The order type (dine_in, takeaway, delivery)
 * @returns {string} - The display label for the status
 */
export const getOrderStatusLabel = (status, orderType) => {
  // Handle statuses that are the same for all order types
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'cancelled':
      return 'Cancelled';
    case 'delivered':
      return 'Delivered';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'ready':
      // Different labels based on order type
      if (orderType === 'delivery') {
        return 'Out for Delivery';
      } else if (orderType === 'dine_in') {
        return 'Started Preparing';
      } else if (orderType === 'takeaway') {
        return 'Package Packed';
      }
      return 'Ready';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
};

/**
 * Get the next status action label based on current status and order type
 * @param {string} status - The current order status
 * @param {string} orderType - The order type (dine_in, takeaway, delivery)
 * @returns {object} - Object with nextStatus and label
 */
export const getNextStatusAction = (status, orderType) => {
  switch (status) {
    case 'pending':
      return { nextStatus: 'confirmed', label: 'Confirm Order' };
    case 'confirmed':
      return { nextStatus: 'preparing', label: 'Start Preparing' };
    case 'preparing':
      // When ready, show different labels based on order type
      if (orderType === 'delivery') {
        return { nextStatus: 'ready', label: 'Mark as Out for Delivery' };
      } else if (orderType === 'dine_in') {
        return { nextStatus: 'ready', label: 'Mark as Started Preparing' };
      } else if (orderType === 'takeaway') {
        return { nextStatus: 'ready', label: 'Mark as Package Packed' };
      }
      return { nextStatus: 'ready', label: 'Mark Ready' };
    case 'ready':
      // For delivery, ready -> out_for_delivery, for others ready -> delivered
      if (orderType === 'delivery') {
        return { nextStatus: 'out_for_delivery', label: 'Out for Delivery' };
      } else {
        return { nextStatus: 'delivered', label: 'Mark Delivered' };
      }
    case 'out_for_delivery':
      return { nextStatus: 'delivered', label: 'Mark Delivered' };
    default:
      return null;
  }
};

