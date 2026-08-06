# API overview

The FastAPI application provides:

- `GET /containers/` to list containers, optionally filtered by `search`.
- `GET /containers/{container_id}`, `POST /containers/`, `PUT /containers/{container_id}`, and `DELETE /containers/{container_id}` for container records.
- `GET /detect/history` for the 50 most recent detection history entries.
- `POST /detect/` and `POST /detect/container-id` for image-based container detection.
- `POST /chat/` for container-status questions and `GET /chat/history` for persisted chat messages.
