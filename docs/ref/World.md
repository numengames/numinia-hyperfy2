# World

The global `world` variable is always available within the app scripting runtime.

### `world.networkId`: String

A unique ID for the current server or client.

### `world.isServer`: Boolean

Whether the script is currently executing on the server.

### `world.isClient`: Boolean

Whether the script is currently executing on the client.

### `world.add(node)`

Adds a node into world-space, outside of the apps local hierarchy.

### `world.remove(node)`

Removes a node from world-space, outside of the apps local hierarchy.

### `world.attach(node)`

Adds a node into world-space, maintaining its current world transform.

### `world.on(event, callback)`

Subscribes to world events.
Currently only `enter` and `leave` are available which let you know when a player enters or leaves the world.

### `world.off(event, callback)`

Unsubscribes from world events.


