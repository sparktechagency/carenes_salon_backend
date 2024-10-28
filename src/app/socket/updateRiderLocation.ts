import Client from '../modules/client/Client.model';

/* eslint-disable @typescript-eslint/no-explicit-any */
const updateClientLocation = async (io: any, socket: any) => {
  // Listen for Client location update event
  socket.on('updateLocation', async (data: any) => {
    const { ClientId, coordinates } = data;

    if (!coordinates || coordinates.length !== 2) {
      socket.emit('socket-error', {
        message:
          'Invalid coordinates format. Must provide [longitude, latitude]',
      });
      return;
    }

    try {
      const updatedClient = await Client.findByIdAndUpdate(
        ClientId,
        { location: { type: 'Point', coordinates } },
        { new: true },
      );

      if (!updatedClient) {
        socket.emit('socket-error', { message: 'Client not found' });
      } else {
        socket.emit('locationUpdated', {
          message: 'Client location updated successfully',
          Client: updatedClient,
        });
      }
    } catch (error) {
      socket.emit('socket-error', { message: 'Server error', error });
    }
  });
};

export default updateClientLocation;
