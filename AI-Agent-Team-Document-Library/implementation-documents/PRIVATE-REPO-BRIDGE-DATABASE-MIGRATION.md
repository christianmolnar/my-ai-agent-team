# Private Repository Bridge - Database Migration Implementation Plan

**Status**: 📋 **PLANNING**  
**Created**: December 26, 2025  
**Last Updated**: December 26, 2025  
**Priority**: MEDIUM (Local-only works for now)

---

## 🎯 **Objective**

Migrate the PersonalAssistantBridge from filesystem-based private repository access to Railway database storage, enabling:
- ✅ Vercel deployment with personalization features
- ✅ Secure data access without filesystem dependencies
- ✅ Scalable multi-user support (future)
- ✅ Consistent data access across environments

---

## 📊 **Current State**

### **What Works (Local Only)**
- ✅ PersonalAssistantBridge reads from `/Users/christian/Repos/my-personal-assistant-private`
- ✅ 15+ interaction types (identity, communications, CNS, backups)
- ✅ Audit logging to filesystem
- ✅ Agent-specific permissions and privacy levels
- ✅ All 28 agents work in local development

### **What Doesn't Work (Vercel Production)**
- ❌ Private repo path doesn't exist on Vercel
- ❌ No personalization (identity, communications style)
- ❌ No CNS learning persistence
- ❌ No project context access
- ❌ Bridge returns empty/error responses

### **Architecture Limitation**
```typescript
// PROBLEM: Hardcoded filesystem path
this.privateRepoPath = '/Users/christian/Repos/my-personal-assistant-private';

// Only works on Christian's MacBook Pro
// Vercel serverless functions have no access to this path
```

---

## 🎯 **Implementation Approach**

### **Option 1: Local-Only (CURRENT - No Changes Needed)**
- **Description**: Accept PersonalAssistantBridge only works locally
- **Pros**: No development work, already functional
- **Cons**: Vercel deployment lacks personalization
- **Use Case**: Development and testing
- **Status**: ✅ **CURRENT STATE**

### **Option 2: Railway Database Migration (RECOMMENDED)**
- **Description**: Store private repo data in Railway PostgreSQL
- **Pros**: Works on Vercel, scalable, secure, multi-user ready
- **Cons**: Requires significant refactoring, data migration
- **Use Case**: Production deployment with full features
- **Status**: 📋 **PLANNED FOR FUTURE**

---

## 🗄️ **Database Schema Design (Railway PostgreSQL)**

### **Table: user_profiles**
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  expertise TEXT[], -- Array of expertise areas
  availability VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: communication_styles**
```sql
CREATE TABLE communication_styles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  style_type VARCHAR(50) NOT NULL, -- 'email', 'document', 'meeting'
  guidelines JSONB NOT NULL, -- Flexible JSON structure
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, style_type)
);
```

### **Table: project_contexts**
```sql
CREATE TABLE project_contexts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50), -- 'active', 'completed', 'paused'
  priority INTEGER DEFAULT 0,
  timeline VARCHAR(255),
  metadata JSONB, -- Flexible for additional data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: agent_cns_data**
```sql
CREATE TABLE agent_cns_data (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  agent_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL, -- 'conversation-patterns.md', etc.
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agent_type, file_name)
);
```

### **Table: bridge_audit_log**
```sql
CREATE TABLE bridge_audit_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  event_type VARCHAR(100) NOT NULL,
  requesting_agent VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_audit_user_timestamp ON bridge_audit_log(user_id, timestamp DESC);
```

### **Table: cns_backups**
```sql
CREATE TABLE cns_backups (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  backup_id VARCHAR(255) UNIQUE NOT NULL,
  agent_type VARCHAR(100) NOT NULL,
  backup_data JSONB NOT NULL, -- Full backup as JSON
  description TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 **Migration Steps (Future Implementation)**

### **Phase 1: Database Setup (2-3 hours)**
1. ✅ Create Railway PostgreSQL database
2. ✅ Run schema migration scripts
3. ✅ Configure database connection in Railway
4. ✅ Add `DATABASE_URL` environment variable to Vercel

### **Phase 2: Data Migration (3-4 hours)**
1. ✅ Export current filesystem data to JSON
2. ✅ Write migration script to populate database
3. ✅ Migrate identity data (`identity/about-me/`)
4. ✅ Migrate communications data (`identity/communications-agent/`)
5. ✅ Migrate project contexts (`Projects_and_Materials/`)
6. ✅ Migrate CNS data (`ai-team/*/cns/`)
7. ✅ Migrate audit logs (`working/bridge-audit.json`)
8. ✅ Verify data integrity

### **Phase 3: Bridge Refactoring (6-8 hours)**
1. ✅ Create `DatabaseBridgeAdapter` class
2. ✅ Implement database queries for all 15+ operations:
   - `getIdentityData()` → Query `user_profiles`
   - `getCommunicationsStyle()` → Query `communication_styles`
   - `getProjectContext()` → Query `project_contexts`
   - `getCNSData()` → Query `agent_cns_data`
   - `updateCNSLearning()` → Insert/update `agent_cns_data`
   - `createCNSBackup()` → Insert into `cns_backups`
   - `restoreCNSBackup()` → Restore from `cns_backups`
   - `logAuditEvent()` → Insert into `bridge_audit_log`
3. ✅ Add connection pooling (pg-pool)
4. ✅ Implement error handling and retries
5. ✅ Replace filesystem operations with database queries
6. ✅ Keep filesystem fallback for local development

### **Phase 4: Environment Configuration (1-2 hours)**
1. ✅ Add Railway DATABASE_URL to `.env.local`
2. ✅ Add DATABASE_URL to Vercel environment variables
3. ✅ Configure connection settings (SSL, pooling)
4. ✅ Test local → database connection
5. ✅ Test Vercel → database connection

### **Phase 5: Testing & Validation (4-6 hours)**
1. ✅ Test all 15+ bridge operations with database
2. ✅ Verify agent permissions and privacy levels
3. ✅ Test audit logging persistence
4. ✅ Test CNS backup/restore functionality
5. ✅ Load testing (concurrent agent requests)
6. ✅ Verify Vercel deployment works
7. ✅ Test personalization features on production

### **Phase 6: Deployment & Monitoring (2-3 hours)**
1. ✅ Deploy database-enabled bridge to Vercel
2. ✅ Monitor bridge performance and errors
3. ✅ Verify audit logs are writing correctly
4. ✅ Test with real agent conversations
5. ✅ Document any issues or optimizations needed

---

## 🛠️ **Technical Implementation**

### **Database Adapter Class**
```typescript
// lib/database-bridge-adapter.ts
import { Pool } from 'pg';

export class DatabaseBridgeAdapter {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getIdentityData(userId: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async getCommunicationsStyle(userId: string, styleType: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT guidelines FROM communication_styles WHERE user_id = $1 AND style_type = $2',
      [userId, styleType]
    );
    return result.rows[0]?.guidelines || null;
  }

  async getProjectContexts(userId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM project_contexts WHERE user_id = $1 AND status = $2 ORDER BY priority DESC',
      [userId, 'active']
    );
    return result.rows;
  }

  async getCNSData(userId: string, agentType: string, fileName: string): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT content FROM agent_cns_data WHERE user_id = $1 AND agent_type = $2 AND file_name = $3',
      [userId, agentType, fileName]
    );
    return result.rows[0]?.content || null;
  }

  async updateCNSData(userId: string, agentType: string, fileName: string, content: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO agent_cns_data (user_id, agent_type, file_name, content, version, updated_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (user_id, agent_type, file_name)
       DO UPDATE SET content = $4, version = agent_cns_data.version + 1, updated_at = NOW()`,
      [userId, agentType, fileName, content]
    );
  }

  async logAuditEvent(userId: string, eventType: string, requestingAgent: string, 
                      targetResource: string, success: boolean, error?: string, metadata?: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO bridge_audit_log (user_id, event_type, requesting_agent, target_resource, 
                                      success, error_message, metadata, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId, eventType, requestingAgent, targetResource, success, error || null, metadata || null]
    );
  }

  async createBackup(userId: string, backupId: string, agentType: string, 
                     backupData: any, createdBy: string, description: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO cns_backups (user_id, backup_id, agent_type, backup_data, created_by, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, backupId, agentType, JSON.stringify(backupData), createdBy, description]
    );
  }

  async restoreBackup(userId: string, backupId: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT backup_data FROM cns_backups WHERE user_id = $1 AND backup_id = $2',
      [userId, backupId]
    );
    return result.rows[0]?.backup_data || null;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### **Updated PersonalAssistantBridge Constructor**
```typescript
// agents/personal-assistant-bridge.ts
import { DatabaseBridgeAdapter } from '../lib/database-bridge-adapter';

export class PersonalAssistantBridge implements Agent {
  private dbAdapter: DatabaseBridgeAdapter | null = null;
  private privateRepoPath: string | null = null;
  private userId: string = 'christian'; // Or from auth context

  constructor() {
    // Try database first (for Vercel/production)
    if (process.env.DATABASE_URL) {
      console.log('🔍 Bridge: Using Railway database adapter');
      this.dbAdapter = new DatabaseBridgeAdapter(process.env.DATABASE_URL);
    }
    // Fallback to filesystem (for local development)
    else if (process.env.PRIVATE_REPO_PATH || fs.existsSync('/Users/christian/Repos/my-personal-assistant-private')) {
      console.log('🔍 Bridge: Using filesystem adapter (local development)');
      this.privateRepoPath = process.env.PRIVATE_REPO_PATH || '/Users/christian/Repos/my-personal-assistant-private';
    }
    else {
      console.warn('⚠️ Bridge: No data source configured (database or filesystem)');
    }
  }

  private async getIdentityData(payload: any): Promise<AgentTaskResult> {
    try {
      // Use database if available
      if (this.dbAdapter) {
        const identity = await this.dbAdapter.getIdentityData(this.userId);
        return { success: true, result: identity };
      }
      
      // Fallback to filesystem
      if (this.privateRepoPath) {
        const identityPath = path.join(this.privateRepoPath, 'identity/about-me');
        // ... existing filesystem code ...
      }

      return { success: false, result: null, error: 'No data source available' };
    } catch (error) {
      return { success: false, result: null, error: `Failed to get identity: ${error}` };
    }
  }

  // Update all other methods similarly...
}
```

---

## 📦 **Dependencies to Add**

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "@types/pg": "^8.10.9"
  }
}
```

---

## 🔒 **Security Considerations**

1. **Connection Security**: Use SSL for database connections in production
2. **Environment Variables**: Never commit DATABASE_URL to git
3. **Access Control**: Implement user authentication before multi-user support
4. **Audit Logging**: All bridge operations logged to database
5. **Data Encryption**: Consider encrypting sensitive CNS data at rest
6. **Connection Pooling**: Limit concurrent database connections

---

## 📈 **Performance Considerations**

1. **Connection Pooling**: Reuse database connections (max: 20)
2. **Query Optimization**: Add indexes on frequently queried columns
3. **Caching Layer**: Consider Redis for frequently accessed data
4. **Lazy Loading**: Only query data when needed
5. **Batch Operations**: Group multiple updates into transactions

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Database adapter query correctness
- Error handling and retries
- Connection pool behavior

### **Integration Tests**
- Bridge operations with database
- Agent permission validation
- Audit logging persistence

### **Load Tests**
- Concurrent agent requests
- Database connection limits
- Response time under load

---

## 📝 **Migration Checklist**

### **Pre-Migration**
- [ ] Backup current private repository data
- [ ] Document all existing bridge operations
- [ ] Set up Railway PostgreSQL database
- [ ] Test database connectivity from local

### **Migration**
- [ ] Create database schema (run SQL scripts)
- [ ] Write data migration script
- [ ] Migrate identity data
- [ ] Migrate communications data
- [ ] Migrate project contexts
- [ ] Migrate CNS data
- [ ] Migrate audit logs
- [ ] Verify data integrity

### **Code Changes**
- [ ] Create DatabaseBridgeAdapter class
- [ ] Update PersonalAssistantBridge constructor
- [ ] Update all 15+ bridge methods
- [ ] Add database connection pooling
- [ ] Implement error handling
- [ ] Add logging and monitoring

### **Environment Setup**
- [ ] Add DATABASE_URL to `.env.local`
- [ ] Add DATABASE_URL to Vercel environment
- [ ] Test local → database connection
- [ ] Test Vercel → database connection

### **Testing**
- [ ] Test all bridge operations locally
- [ ] Test agent permissions
- [ ] Test audit logging
- [ ] Test CNS backups
- [ ] Deploy to Vercel staging
- [ ] Test on Vercel production
- [ ] Load test with multiple agents

### **Deployment**
- [ ] Deploy to Vercel production
- [ ] Monitor bridge performance
- [ ] Verify personalization works
- [ ] Document any issues
- [ ] Update user documentation

---

## 🎯 **Success Criteria**

### **Functional Requirements**
- ✅ All 15+ bridge operations work with database
- ✅ Agent permissions and privacy levels enforced
- ✅ Audit logging persists to database
- ✅ CNS backup/restore functionality works
- ✅ Vercel deployment has full personalization features

### **Performance Requirements**
- ✅ Bridge response time < 500ms (p95)
- ✅ Database connection pool stable under load
- ✅ No memory leaks or connection exhaustion
- ✅ Audit logs written without blocking

### **Security Requirements**
- ✅ SSL connections in production
- ✅ No sensitive data in logs
- ✅ Agent permissions validated on every request
- ✅ Audit trail for all data access

---

## 📅 **Timeline Estimate**

| Phase | Duration | Status |
|-------|----------|--------|
| Database Setup | 2-3 hours | ⏸️ Not Started |
| Data Migration | 3-4 hours | ⏸️ Not Started |
| Bridge Refactoring | 6-8 hours | ⏸️ Not Started |
| Environment Config | 1-2 hours | ⏸️ Not Started |
| Testing & Validation | 4-6 hours | ⏸️ Not Started |
| Deployment & Monitoring | 2-3 hours | ⏸️ Not Started |
| **Total** | **18-26 hours** | ⏸️ **Pending** |

---

## 🚦 **Current Decision: Local-Only**

**For now, we will use the PersonalAssistantBridge locally only.**

- ✅ Local development has full personalization
- ✅ Vercel deployment works (without personalization)
- ✅ No immediate development work required
- 📅 Database migration scheduled for future implementation

**When ready to implement database migration, follow this plan.**

---

## 📚 **References**

- **Bridge Implementation**: `/agents/personal-assistant-bridge.ts`
- **Private Repo Structure**: `/Users/christian/Repos/my-personal-assistant-private/`
- **Railway Documentation**: https://docs.railway.app/databases/postgresql
- **PostgreSQL Connection Pooling**: https://node-postgres.com/features/pooling

---

**Document Owner**: Christian Molnar  
**Last Review**: December 26, 2025  
**Next Review**: When ready to implement database migration
