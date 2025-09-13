# Personal Assistant Agent Bridge Protocol

## Purpose
Defines the secure communication protocol between the Personal Assistant Agent (public) and the private repository, enabling access to sensitive data, CNS (nervous system) updates, and private operations while maintaining strict security and privacy controls.

---

## Scope
- Applies to all data exchanges between the public Personal Assistant Agent and private data/services.
- Covers authentication, authorization, data flow, CNS (agent nervous system) updates, and audit logging.

---

## Security & Privacy Principles
- **Zero Trust**: Every request is authenticated and authorized.
- **Least Privilege**: Only necessary data and actions are exposed.
- **Auditability**: All bridge operations are logged for traceability.
- **Data Minimization**: Only required data is transferred; sensitive data is masked or anonymized when possible.
- **CNS Isolation**: Each agent’s CNS is updated only by that agent’s bridge protocol.

---

## Data Flow Overview
1. **Request Initiation**: Public agent sends a request to the bridge API (e.g., `/api/bridge/personal-assistant`).
2. **Authentication**: Request includes a signed token (JWT or similar) for identity verification.
3. **Authorization**: Bridge checks permissions for requested data/action.
4. **CNS Update/Read**: If the request involves CNS (nervous system) data, the bridge reads or updates only the agent’s own CNS files.
5. **Data Access**: Bridge retrieves or modifies private data as needed.
6. **Response**: Bridge returns data or status, with sensitive fields masked if required.
7. **Audit Logging**: All actions are logged with timestamp, agent ID, action, and result.

---

## Example Request/Response Patterns

### CNS Data Read
**Request:**
```json
{
  "agent": "personal-assistant",
  "action": "read-cns",
  "section": "memories",
  "authToken": "..."
}
```
**Response:**
```json
{
  "success": true,
  "data": { "memories": [ ... ] }
}
```

### CNS Data Update
**Request:**
```json
{
  "agent": "personal-assistant",
  "action": "update-cns",
  "section": "reflexes",
  "payload": { ... },
  "authToken": "..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "CNS reflexes updated"
}
```

### Private Data Access
**Request:**
```json
{
  "agent": "personal-assistant",
  "action": "get-private-data",
  "resource": "calendar",
  "authToken": "..."
}
```
**Response:**
```json
{
  "success": true,
  "data": { "events": [ ... ] }
}
```

---

## CNS (Nervous System) Interaction
- All CNS reads/updates are routed through the bridge and scoped to the requesting agent.
- CNS files are never exposed directly; all access is mediated and logged.
- CNS updates may include learning, memory, reflex, or personality changes.

---

## Audit Logging
- Every bridge operation is logged with:
  - Timestamp
  - Agent ID
  - Action
  - Resource/section
  - Success/failure
  - Requesting user (if applicable)

---

## Change Management
- All protocol changes require review and approval.
- Security incidents or audit findings trigger immediate protocol review.

---

*Last updated: September 4, 2025*
