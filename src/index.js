import _ from 'lodash';

import BossmodeCG from '@bossmodecg/core';

const DEFAULT_CONFIG = {
  countInterval: 1000
};

export default class ClienteleModule extends BossmodeCG.BModule {
  constructor(config) {
    super("clientele", _.merge({}, DEFAULT_CONFIG, config),
          { shouldCacheState: false, internalStateUpdatesOnly: true });

    this._state = { unauthenticatedClients: {}, authenticatedClients: {} };
  }

  async _doRegister() {
    this.server.on('internal.clientConnected', (client) => {
      const change = {
        unauthenticatedClients: {}
      };

      change.unauthenticatedClients[client.id] = {
        id: client.id,
        address: client.request.connection.remoteAddress
      };

      this.setState(change);
      this.emit("clientConnected", change.unauthenticatedClients[client.id]);
    });

    this.server.on('internal.clientAuthenticated', (client) => {
      const change = {
        unauthenticatedClients: {},
        authenticatedClients: {}
      };

      change.unauthenticatedClients[client.id] = null;
      change.authenticatedClients[client.id] = {
        id: client.id,
        address: client.request.connection.remoteAddress,
        identifier: client.identity.identifier,
        clientType: client.identity.clientType
      };

      this.setState(change);
      this.emit("clientAuthenticated", change.authenticatedClients[client.id]);
    });

    this.server.on('internal.clientDisconnected', (client) => {
      const change = {
        unauthenticatedClients: {},
        authenticatedClients: {}
      };

      change.unauthenticatedClients[client.id] = null;
      change.authenticatedClients[client.id] = null;

      this.setState(change);
      this.emit("clientDisconnected", { id: client.id });
    });
  }
}
