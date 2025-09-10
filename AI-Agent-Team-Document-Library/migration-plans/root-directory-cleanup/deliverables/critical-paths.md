# Critical Paths Analysis - Root Directory Cleanup
*Files that require code changes when moved*

## ⚠️ **HIGH RISK - Immediate Code Changes Required**

### **1. learning-history.jsonl**

#### **Current Code Dependency:**
**File:** `/lib/learning-tracker.ts`  
**Line:** 21  
**Current Code:**
```typescript
this.logFilePath = path.join(process.cwd(), 'learning-history.jsonl');
```

#### **Required Changes:**
**New Location:** `data/learning/history.jsonl`  
**Updated Code:**
```typescript
this.logFilePath = path.join(process.cwd(), 'data', 'learning', 'history.jsonl');
```

#### **Migration Steps:**
1. Create `data/learning/` directory structure
2. Update `lib/learning-tracker.ts` with new path
3. Move `learning-history.jsonl` to `data/learning/history.jsonl`
4. Test learning system functionality
5. Verify no data loss during migration

#### **Testing Required:**
- Learning system initialization
- Data persistence functionality  
- Historical data access
- New entry creation

#### **Rollback Plan:**
- Keep copy of original file until verification complete
- Revert code changes if issues detected
- Restore original file location if necessary

---

## 🔧 **MEDIUM RISK - Script Updates Required**

### **2. ecosystem.config.js**

#### **Current Script Dependency:**
**File:** `/start-permanent-dev.sh`  
**Line:** 16  
**Current Code:**
```bash
pm2 start ecosystem.config.js
```

#### **Required Changes:**
**New Location:** `config/ecosystem.config.js`  
**Updated Code:**
```bash
pm2 start config/ecosystem.config.js
```

#### **Migration Steps:**
1. Create `config/` directory
2. Move `ecosystem.config.js` to `config/ecosystem.config.js`
3. Update `start-permanent-dev.sh` with new path
4. Test PM2 startup process
5. Verify all PM2 functionality works

#### **Additional Script References:**
Need to check for other potential references in:
- `stop-permanent-dev.sh`
- Any deployment scripts
- Any monitoring scripts

#### **Testing Required:**
- PM2 process startup
- Process monitoring
- Process shutdown
- Configuration loading

#### **Alternative Solution:**
- Keep `ecosystem.config.js` in root if it's standard PM2 practice
- Many projects keep PM2 config in root directory
- **Recommendation:** Research PM2 best practices before moving

---

## 📝 **LOW RISK - Documentation Updates Required**

### **3. Documentation Cross-References**

#### **Files with References to Root Documentation:**
- `AI-Agent-Team-Document-Library/README.md` - References to setup docs
- `AI-Agent-Team-Document-Library/FEATURE-OVERVIEW.md` - Setup guide references
- Various implementation docs - Architecture references

#### **Required Updates:**
Update all relative path references when moving:
- `SYSTEM-ARCHITECTURE.md` → `AI-Agent-Team-Document-Library/system-architecture/`
- Implementation status docs → `AI-Agent-Team-Document-Library/status-updates/`

---

## 🔍 **INVESTIGATION REQUIRED**

### **4. Potential Hidden Dependencies**

#### **Files Requiring Investigation:**

**Development Scripts:**
- `dev-manager.sh` - May reference files by relative paths
- `setup-*.sh` scripts - May assume current directory structure
- `validate-*.sh` scripts - May check specific file locations

**Configuration Files:**
- `.env.local` - May reference documentation files
- Various config files - May have path dependencies

**Agent System:**
- Agent configuration files - May reference data directories
- Private repository integration - May assume specific structure

#### **Investigation Tasks:**
1. **Search for relative path references** in all scripts
2. **Check configuration files** for hard-coded paths
3. **Verify agent system** file access patterns
4. **Test setup scripts** on clean environment

---

## 🚨 **Critical Migration Sequence**

### **Phase 2 Execution Order:**
1. **Create new directory structure** first
2. **Update code references** before moving files
3. **Move files** in dependency order
4. **Test each change** immediately
5. **Rollback** if any issues detected

### **Dependencies Chain:**
```
1. Create directories → 
2. Update learning-tracker.ts → 
3. Move learning-history.jsonl → 
4. Test learning system →
5. Update scripts → 
6. Move ecosystem.config.js → 
7. Test PM2 startup →
8. Move other files
```

---

## 🛡️ **Risk Mitigation Strategies**

### **Pre-Migration:**
1. **Full system backup** including git commit
2. **Document current state** with screenshots/tests
3. **Create rollback scripts** for quick recovery
4. **Test in development environment** first

### **During Migration:**
1. **One file type at a time** (learning system first)
2. **Immediate testing** after each change
3. **Keep original files** until verification complete
4. **Staged commits** for easy rollback points

### **Post-Migration:**
1. **Complete system validation** using test suite
2. **Performance verification** for learning system
3. **Documentation updates** for new structure
4. **Team notification** of new file locations

---

## 📊 **Success Criteria**

### **Learning System:**
- ✅ All existing learning data accessible
- ✅ New learning entries save to correct location
- ✅ No performance degradation
- ✅ Historical data integrity maintained

### **Deployment System:**
- ✅ PM2 starts successfully with new config location
- ✅ All processes launch correctly
- ✅ Monitoring and logging functional
- ✅ Stop/start scripts work properly

### **Development Workflow:**
- ✅ All scripts execute without path errors
- ✅ Setup processes work for new clones
- ✅ Development tools find all required files
- ✅ Documentation links resolve correctly

---
*Critical Paths Analysis Complete: Phase 1*  
*High Risk Items: 2*  
*Medium Risk Items: 1*  
*Investigation Required: Multiple potential dependencies*
