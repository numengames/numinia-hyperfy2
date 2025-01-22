# Mesh

Represents a mesh to be rendered. 
Internally the mesh is automatically instanced for performance.

NOTE: Setting/modifying the geometry or materials are not currently supported, and only be configured within a GLTF (eg via blender).

### `mesh.castShadow`: Boolean

Whether this mesh should cast a shadow. Defaults to `true`.

### `mesh.receiveShadow`: Boolean

Whether this mesh should receive a shadow. Defaults to `true`.

### `mesh.visible`: Boolean

Whether the mesh is visible and rendered. Defaults to `true`.

### `mesh.{...Node}`

Inherits all [Node](/docs/ref/Node.md) properties

