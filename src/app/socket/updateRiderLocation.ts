import Rider from '../modules/rider/rider.model';

/* eslint-disable @typescript-eslint/no-explicit-any */
const updateRiderLocation = async (io: any, socket: any) => {
  // Listen for rider location update event
  socket.on('updateLocation', async (data: any) => {
    const { riderId, coordinates } = data;

    if (!coordinates || coordinates.length !== 2) {
      socket.emit('socket-error', {
        message:
          'Invalid coordinates format. Must provide [longitude, latitude]',
      });
      return;
    }

    try {
      const updatedRider = await Rider.findByIdAndUpdate(
        riderId,
        { location: { type: 'Point', coordinates } },
        { new: true },
      );

      if (!updatedRider) {
        socket.emit('socket-error', { message: 'Rider not found' });
      } else {
        socket.emit('locationUpdated', {
          message: 'Rider location updated successfully',
          rider: updatedRider,
        });
      }
    } catch (error) {
      socket.emit('socket-error', { message: 'Server error', error });
    }
  });
};

export default updateRiderLocation;
