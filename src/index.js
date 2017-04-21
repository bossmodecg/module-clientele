import Module from '@bossmodecg/module';

const DEFAULT_CONFIG = {};

export default class ClienteleModule extends Module {
  constructor(config) {
    super("clientele", config,
          { shouldCacheState: false, internalStateUpdatesOnly: true });

    this._state = { unauthenticatedClients: {}, authenticatedClients: {} };

    this.on("internal.registerServer", (server) => {
      server.on('internal.clientConnected', (client) => {
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

      server.on('internal.clientAuthenticated', (client) => {
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

      server.on('internal.clientDisconnected', (client) => {
        const change = {
          unauthenticatedClients: {},
          authenticatedClients: {}
        };

        change.unauthenticatedClients[client.id] = null;
        change.authenticatedClients[client.id] = null;

        this.setState(change);
        this.emit("clientDisconnected", { id: client.id });
      });
    });
  }

  /* eslint-disable class-methods-use-this */
  get defaultConfig() { return DEFAULT_CONFIG; }
  /* eslint-enable class-methods-use-this */
}
