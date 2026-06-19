# ScholarForge Commit & Release Changelog

- **2026-06-01 14:43:48**: chore: initialize repository structure and base project configuration
- **2026-06-02 17:17:42**: docs: add initial project README title and MIT license information
- **2026-06-04 17:33:35**: chore: add root .gitignore rules for logs and node_modules
- **2026-06-05 20:34:33**: chore: configure backend package.json dependencies and npm scripts
- **2026-06-07 14:40:18**: chore: configure frontend package.json dependencies and Vite build scripts
- **2026-06-08 20:25:28**: feat(backend): implement Mongoose database connection in config/db.js
- **2026-06-10 20:17:14**: feat(backend): add timeout handling and bufferCommands flag to db.js
- **2026-06-11 17:11:41**: feat(backend): define User schema with bcrypt password hashing hook
- **2026-06-13 20:47:42**: feat(backend): implement getSignedJwtToken and matchPassword methods on User model
- **2026-06-14 20:42:36**: feat(backend): create Paper schema with title, abstract, authors, and doi fields
- **2026-06-16 10:39:21**: feat(backend): add tags array and uploadedBy reference to Paper schema
- **2026-06-17 14:46:30**: feat(backend): create Comment schema for academic peer review discussions
- **2026-06-19 14:16:35**: feat(backend): implement custom ErrorResponse class in middleware/error.js
