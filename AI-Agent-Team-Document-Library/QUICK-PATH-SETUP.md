# Quick PATH Setup Reference

## 🚀 One Command Solution
```bash
source ./activate
```
**What it does:** Adds scripts to PATH for current session  
**Result:** You can use `cns "help"` instead of `./scripts/cns "help"`  
**Undo:** Type `deactivate`

## 📖 All Available Methods

| Method | Command | Scope | Pros |
|--------|---------|-------|------|
| **Session** | `source ./activate` | Current terminal | Quick, reversible |
| **Permanent** | `npm run path-setup` | All new terminals | Set once, use forever |
| **Auto direnv** | `brew install direnv` | Project directory | Automatic activation |
| **Manual** | Edit `~/.bashrc` | All terminals | Full control |

## ✅ Quick Test
After setup, these should work:
```bash
cns "help"                    # ✅ Should show help
cns "document my preference"  # ✅ Should auto-detect
which cns                     # ✅ Should show path
```

## 🔧 Troubleshooting
- **Command not found?** → Restart terminal or `source ~/.bashrc`
- **Want to undo?** → `deactivate` (session) or edit `~/.bashrc` (permanent)
- **Check status:** → `echo $PATH | grep scripts`

---
*After setup, all CNS commands work without the `./scripts/` prefix*
