# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.4.0]

### Added
- Expose fetch to app runtime
- Add UI, UIView and UIText nodes
- Add app.uuid() utility
- Add app.getTimestamp(format?) utility
- Add app.getTime() utility (uses performance.now)
- Allow apps to post to chat
- Support VRM drag and drop, to place or equip
- Add ability to run multiple worlds and switch using WORLD env

### Changed
- New pane improvements
- Update @pixiv/three-vrm to latest
- Support dynamic environment variables for containerized workflows

### Fixed
- Fix various edge cases where scripts can crash
- Fix node proxy mechanism not working
- Disabled VRM loading on server (affects vrm's renamed to glb)
- Properly abort all in-flight fetch requests an app is making when it rebuilds
- Prevent app async unhandled exceptions bubbling up to a full world crash (see lockdown)
- Fixed camera insanity when loading into the world

## [0.3.0]

### Added
- Environment variable to limit model upload size
- Node.traverse(callback)
- Ability to disable world saving completely
- Initial app networking
- Temporary skybox
- Re-enabled stats via /stats chat command
- Let players know when they are disconnected from the world
- Add /health endpoint
- Action node for interactive apps
- Script to clean up orphaned blueprints/files in a world (npm run world:clean) [experimental]
- Expose Collider.convex to script runtime
- Expose LOD.insert to script runtime
- Initial docs!

### Changed
- Use "geometry" type for Mesh and Collider nodes (instead of "custom")
- Enter and Leave world events are now a player object instead of just the networkId

### Fixed
- Production source-maps issue
- Errors using geometry with morph targets
- Server crash attempting to load an asset that does not exist
- World event unhandled errors

## [0.2.0] - 2025-01-14

### Added
- Docker support for local development and deployment
- ESLint and Prettier configuration
- Contribution guidelines and templates
- Sync with upstream documentation
- ESLint and Prettier configuration for component development
- Docker deployment documentation
- Upstream sync documentation and procedures
- Development environment standardization
- Docker configuration for production deployment
- Multi-stage build optimization
- Volume mounting for assets and source code
- GitHub Container Registry integration
- Automated Docker image builds via GitHub Actions

### Changed
- Updated development dependencies
- Improved code formatting rules
- Enhanced documentation structure
- Updated ESLint rules and ignored patterns
- Restructured development dependencies
- Enhanced Docker configuration
- Optimized Docker image size using Alpine base
- Enhanced container environment configuration
- Streamlined CI/CD pipeline configuration

### Fixed
- ESLint configuration for ESM compatibility
- Build process for Docker environments
- ESLint compatibility with ESM modules
- Development environment setup process
- Docker build process for Node.js 22
- Volume permissions for assets directory
- Container registry authentication process

## [0.1.0] - 2025-01-14

### Added
- Initial fork from Hyperfy
- Basic project structure
- Core functionality from original project

[Unreleased]: https://github.com/hyperfy-xyz/hyperfy/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/hyperfy-xyz/hyperfy/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hyperfy-xyz/hyperfy/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hyperfy-xyz/hyperfy/releases/tag/v0.1.0 
