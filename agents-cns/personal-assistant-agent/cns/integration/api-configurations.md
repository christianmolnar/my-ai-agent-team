# Personal Assistant Bridge - API Configurations

## External API Service Configuration

### Authentication Services Configuration

#### **OAuth 2.0 / OpenID Connect Configuration**
```json
{
  "auth_providers": {
    "primary": {
      "provider": "auth0",
      "domain": "ai-agent-team.auth0.com",
      "client_id": "${AUTH0_CLIENT_ID}",
      "client_secret": "${AUTH0_CLIENT_SECRET}",
      "audience": "https://api.ai-agent-team.com",
      "scope": "openid profile email agent:access",
      "token_endpoint": "https://ai-agent-team.auth0.com/oauth/token",
      "userinfo_endpoint": "https://ai-agent-team.auth0.com/userinfo",
      "jwks_uri": "https://ai-agent-team.auth0.com/.well-known/jwks.json"
    },
    "backup": {
      "provider": "keycloak",
      "realm": "ai-agent-team",
      "server_url": "https://auth.ai-agent-team.com",
      "client_id": "${KEYCLOAK_CLIENT_ID}",
      "client_secret": "${KEYCLOAK_CLIENT_SECRET}"
    }
  },
  "token_settings": {
    "access_token_ttl": 3600,
    "refresh_token_ttl": 86400,
    "token_rotation_enabled": true,
    "require_secure_transport": true
  }
}
```

#### **Multi-Factor Authentication Configuration**
```json
{
  "mfa_settings": {
    "required_for": [
      "highly_sensitive_data_access",
      "admin_operations",
      "off_hours_access"
    ],
    "providers": {
      "totp": {
        "enabled": true,
        "issuer": "AI Agent Team Bridge",
        "algorithm": "SHA256",
        "digits": 6,
        "period": 30
      },
      "sms": {
        "enabled": true,
        "provider": "twilio",
        "api_key": "${TWILIO_API_KEY}",
        "api_secret": "${TWILIO_API_SECRET}",
        "from_number": "${TWILIO_PHONE_NUMBER}"
      },
      "webauthn": {
        "enabled": true,
        "rp_name": "AI Agent Team Bridge",
        "rp_id": "bridge.ai-agent-team.com",
        "user_verification": "required"
      }
    }
  }
}
```

### Encryption and Key Management Services

#### **HashiCorp Vault Configuration**
```json
{
  "vault_config": {
    "address": "${VAULT_ADDR}",
    "token": "${VAULT_TOKEN}",
    "namespace": "ai-agent-team",
    "mount_points": {
      "kv": "secret/",
      "pki": "pki/",
      "database": "database/",
      "transit": "transit/"
    },
    "policies": {
      "bridge_service": [
        "secret/data/bridge/*",
        "transit/encrypt/bridge",
        "transit/decrypt/bridge",
        "database/creds/bridge-readonly"
      ],
      "agent_access": [
        "secret/data/agents/{{identity.entity.metadata.agent_id}}/*",
        "transit/encrypt/agent-{{identity.entity.metadata.agent_id}}"
      ]
    },
    "auth_methods": {
      "kubernetes": {
        "role": "bridge-service",
        "service_account": "personal-assistant-bridge"
      },
      "jwt": {
        "bound_audiences": ["ai-agent-team"],
        "user_claim": "sub",
        "role_type": "jwt"
      }
    }
  }
}
```

#### **AWS KMS Integration Configuration**
```json
{
  "aws_kms": {
    "region": "us-west-2",
    "key_management": {
      "master_key": {
        "key_id": "${AWS_KMS_MASTER_KEY_ID}",
        "description": "Master encryption key for AI Agent Team Bridge",
        "usage": "ENCRYPT_DECRYPT",
        "key_spec": "SYMMETRIC_DEFAULT"
      },
      "data_encryption_keys": {
        "personal_data": "${AWS_KMS_PERSONAL_DATA_KEY_ID}",
        "business_data": "${AWS_KMS_BUSINESS_DATA_KEY_ID}",
        "system_data": "${AWS_KMS_SYSTEM_DATA_KEY_ID}"
      }
    },
    "envelope_encryption": {
      "enabled": true,
      "data_key_spec": "AES_256",
      "encryption_context": {
        "agent_id": "{{agent_id}}",
        "data_classification": "{{classification}}",
        "timestamp": "{{timestamp}}"
      }
    },
    "access_control": {
      "key_usage_policy": {
        "bridge_service": [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ],
        "audit_service": [
          "kms:DescribeKey",
          "kms:GetKeyPolicy",
          "kms:ListKeyPolicies"
        ]
      }
    }
  }
}
```

### Monitoring and Logging Services

#### **Prometheus Monitoring Configuration**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "bridge_security_rules.yml"
  - "performance_rules.yml"

scrape_configs:
  - job_name: 'personal-assistant-bridge'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s
    scrape_timeout: 5s
    
  - job_name: 'bridge-security-metrics'
    static_configs:
      - targets: ['localhost:8081']
    metrics_path: '/security/metrics'
    scrape_interval: 5s
    
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "security_alerts.yml"
  - "performance_alerts.yml"
```

#### **Elasticsearch/ELK Stack Configuration**
```json
{
  "elasticsearch": {
    "cluster_name": "ai-agent-bridge-logs",
    "hosts": [
      "elasticsearch-1:9200",
      "elasticsearch-2:9200",
      "elasticsearch-3:9200"
    ],
    "security": {
      "enabled": true,
      "username": "${ELASTIC_USERNAME}",
      "password": "${ELASTIC_PASSWORD}",
      "ssl": {
        "enabled": true,
        "certificate_authorities": [
          "/config/certificates/ca.crt"
        ],
        "verification_mode": "certificate"
      }
    },
    "indices": {
      "bridge_audit_logs": {
        "settings": {
          "number_of_shards": 3,
          "number_of_replicas": 1,
          "refresh_interval": "1s"
        },
        "mappings": {
          "properties": {
            "timestamp": { "type": "date" },
            "agent_id": { "type": "keyword" },
            "event_type": { "type": "keyword" },
            "data_classification": { "type": "keyword" },
            "result": { "type": "keyword" },
            "privacy_impact": { "type": "keyword" }
          }
        }
      }
    }
  },
  "logstash": {
    "config": {
      "input": {
        "beats": {
          "port": 5044
        },
        "file": {
          "path": "/ai-team/personal-assistant-bridge/logs/*.log",
          "start_position": "beginning"
        }
      },
      "filter": {
        "if": "[fields][log_type] == 'audit'",
        "grok": {
          "match": {
            "message": "%{TIMESTAMP_ISO8601:timestamp} %{WORD:level} %{WORD:agent_id} %{WORD:action} %{GREEDYDATA:details}"
          }
        },
        "date": {
          "match": ["timestamp", "ISO8601"]
        }
      },
      "output": {
        "elasticsearch": {
          "hosts": ["elasticsearch-1:9200"],
          "index": "bridge-audit-logs-%{+YYYY.MM.dd}"
        }
      }
    }
  }
}
```

### Privacy Compliance and Data Protection APIs

#### **OneTrust Privacy Management Integration**
```json
{
  "onetrust_config": {
    "api_base_url": "https://api.onetrust.com",
    "tenant_id": "${ONETRUST_TENANT_ID}",
    "client_id": "${ONETRUST_CLIENT_ID}",
    "client_secret": "${ONETRUST_CLIENT_SECRET}",
    "services": {
      "privacy_impact_assessment": {
        "endpoint": "/api/pia/v1/assessments",
        "auto_submit": false,
        "required_for": ["personal_data_access", "new_data_processing"]
      },
      "consent_management": {
        "endpoint": "/api/consent/v1",
        "purposes": [
          "data_processing",
          "analytics",
          "agent_collaboration",
          "performance_improvement"
        ]
      },
      "data_subject_rights": {
        "endpoint": "/api/dsr/v1",
        "supported_rights": [
          "access",
          "rectification",
          "erasure",
          "portability",
          "objection"
        ],
        "response_time_sla": 720 // hours (30 days)
      },
      "risk_assessment": {
        "endpoint": "/api/risk/v1/assessments",
        "criteria": [
          "data_sensitivity",
          "processing_purpose",
          "retention_period",
          "transfer_mechanism"
        ]
      }
    }
  }
}
```

### Database and Storage APIs

#### **PostgreSQL Configuration for Audit Data**
```json
{
  "postgresql": {
    "host": "${POSTGRES_HOST}",
    "port": 5432,
    "database": "bridge_audit_db",
    "username": "${POSTGRES_USER}",
    "password": "${POSTGRES_PASSWORD}",
    "ssl_mode": "require",
    "connection_pool": {
      "max_connections": 20,
      "idle_timeout": 300,
      "connection_timeout": 30
    },
    "schemas": {
      "audit_events": {
        "table": "audit_log",
        "retention_policy": "7 years",
        "encryption": "column_level",
        "backup_frequency": "daily"
      },
      "agent_metadata": {
        "table": "agent_registry",
        "encryption": "full_database",
        "access_control": "row_level_security"
      }
    }
  }
}
```

#### **Redis Configuration for Caching**
```json
{
  "redis": {
    "cluster": {
      "nodes": [
        "redis-1:6379",
        "redis-2:6379",
        "redis-3:6379"
      ]
    },
    "security": {
      "auth_enabled": true,
      "password": "${REDIS_PASSWORD}",
      "tls_enabled": true,
      "cert_file": "/config/certificates/redis.crt",
      "key_file": "/config/certificates/redis.key"
    },
    "cache_policies": {
      "agent_permissions": {
        "ttl": 3600,
        "max_memory_policy": "allkeys-lru"
      },
      "frequently_accessed_data": {
        "ttl": 1800,
        "eviction_policy": "volatile-ttl"
      },
      "session_data": {
        "ttl": 7200,
        "persistence": "append_only_file"
      }
    }
  }
}
```

### Communication and Notification APIs

#### **Slack Integration for Alerts**
```json
{
  "slack_integration": {
    "webhook_url": "${SLACK_WEBHOOK_URL}",
    "bot_token": "${SLACK_BOT_TOKEN}",
    "channels": {
      "security_alerts": "#security-alerts",
      "system_status": "#system-status",
      "audit_notifications": "#audit-notifications",
      "emergency_response": "#emergency-response"
    },
    "alert_templates": {
      "security_incident": {
        "color": "danger",
        "title_template": "🚨 Security Incident: {{incident_type}}",
        "message_template": "Agent: {{agent_id}}\nSeverity: {{severity}}\nDescription: {{description}}\nAction Required: {{action_required}}"
      },
      "system_performance": {
        "color": "warning", 
        "title_template": "⚠️ Performance Alert: {{metric_name}}",
        "message_template": "Current Value: {{current_value}}\nThreshold: {{threshold}}\nTrend: {{trend}}"
      }
    }
  }
}
```

#### **Email Service Configuration**
```json
{
  "email_service": {
    "provider": "sendgrid",
    "api_key": "${SENDGRID_API_KEY}",
    "from_email": "bridge@ai-agent-team.com",
    "from_name": "AI Agent Team Bridge",
    "templates": {
      "security_incident_notification": {
        "template_id": "d-1234567890abcdef",
        "subject": "Security Incident Notification - {{incident_id}}"
      },
      "compliance_report": {
        "template_id": "d-abcdef1234567890",
        "subject": "Weekly Compliance Report - {{report_date}}"
      },
      "audit_request": {
        "template_id": "d-567890abcdef1234",
        "subject": "Audit Request - {{audit_id}}"
      }
    },
    "recipient_groups": {
      "security_team": [
        "security@ai-agent-team.com",
        "ciso@ai-agent-team.com"
      ],
      "compliance_team": [
        "compliance@ai-agent-team.com",
        "dpo@ai-agent-team.com"
      ],
      "executive_team": [
        "ceo@ai-agent-team.com",
        "cto@ai-agent-team.com"
      ]
    }
  }
}
```

## API Security and Rate Limiting

### Rate Limiting Configuration
```json
{
  "rate_limiting": {
    "global_limits": {
      "requests_per_second": 100,
      "requests_per_minute": 1000,
      "requests_per_hour": 10000
    },
    "agent_specific_limits": {
      "basic_agents": {
        "requests_per_minute": 60,
        "burst_limit": 10
      },
      "elevated_agents": {
        "requests_per_minute": 300,
        "burst_limit": 50
      },
      "admin_agents": {
        "requests_per_minute": 1000,
        "burst_limit": 100
      }
    },
    "endpoint_specific_limits": {
      "/api/data-access": {
        "requests_per_minute": 30,
        "concurrent_requests": 5
      },
      "/api/audit": {
        "requests_per_minute": 10,
        "concurrent_requests": 2
      }
    }
  }
}
```

*API configurations are regularly updated to incorporate new services and enhanced security requirements*
