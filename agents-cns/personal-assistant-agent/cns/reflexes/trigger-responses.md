# Personal Assistant Bridge - Trigger Responses

## Security Trigger Responses

### High-Priority Security Triggers

#### **Trigger**: Unauthorized Access Attempt
**Automatic Response Pattern**:
1. **Immediate Containment**: Block access from requesting agent/IP immediately
2. **Alert Generation**: Send HIGH priority alert to Master Orchestrator and system administrators
3. **Evidence Preservation**: Capture full request details, headers, and context
4. **Audit Logging**: Create detailed audit trail entry with threat classification
5. **Monitoring Enhancement**: Increase monitoring sensitivity for related patterns

#### **Trigger**: Authentication Failure Threshold Exceeded (5 failures in 10 minutes)
**Automatic Response Pattern**:
1. **Account Lockout**: Temporarily disable agent authentication (15-minute lockout)
2. **Alert Escalation**: Notify Master Orchestrator of potential compromise attempt
3. **Pattern Analysis**: Analyze failure patterns for distributed attack indicators
4. **IP Blocking**: Implement temporary IP-based access restrictions if applicable
5. **Investigation Initiation**: Queue forensic investigation workflow automatically

#### **Trigger**: Anomalous Data Access Pattern Detected
**Automatic Response Pattern**:
1. **Access Restriction**: Reduce agent permissions to baseline minimal access
2. **Enhanced Monitoring**: Enable detailed logging for all agent activities
3. **Risk Assessment**: Trigger automated risk assessment of agent behavior
4. **Stakeholder Notification**: Alert agent's assigned coordinator of unusual behavior
5. **Manual Review Queue**: Add case to manual security review queue

#### **Trigger**: Privacy Compliance Violation Detected
**Automatic Response Pattern**:
1. **Access Suspension**: Immediately suspend access to sensitive data categories
2. **Compliance Alert**: Generate CRITICAL compliance violation alert
3. **Legal Notification**: Notify legal/compliance team of potential regulatory issue
4. **Data Access Audit**: Trigger comprehensive audit of recent data access by agent
5. **Remediation Planning**: Initiate automated remediation workflow

### Medium-Priority Security Triggers

#### **Trigger**: Unusual Access Volume (50% above normal patterns)
**Automatic Response Pattern**:
1. **Rate Limiting**: Implement temporary rate limiting for requesting agent
2. **Pattern Documentation**: Log unusual pattern details for analysis
3. **Performance Monitoring**: Monitor system performance impact
4. **Notification**: Send informational alert to system monitoring
5. **Capacity Planning**: Update capacity planning metrics

#### **Trigger**: Off-Hours Data Access Request
**Automatic Response Pattern**:
1. **Enhanced Validation**: Apply additional security validation checks
2. **Time-Based Logging**: Log with special off-hours classification
3. **Manager Notification**: Notify relevant project manager of off-hours access
4. **Access Justification**: Require explicit justification for unusual timing
5. **Follow-up Review**: Queue for next business day security review

## Data Protection Trigger Responses

### Data Classification Triggers

#### **Trigger**: Request for Highly Sensitive Data
**Automatic Response Pattern**:
1. **Multi-Factor Validation**: Require additional authentication factors
2. **Purpose Validation**: Verify explicit business justification for access
3. **Time-Limited Access**: Implement strict time limits on data access
4. **Anonymization Check**: Evaluate if anonymized data would meet needs
5. **Senior Approval**: Queue for senior security officer approval if required

#### **Trigger**: Cross-Border Data Transfer Request
**Automatic Response Pattern**:
1. **Jurisdiction Validation**: Verify transfer compliance with applicable regulations
2. **Adequacy Assessment**: Check destination country adequacy status
3. **Safeguard Implementation**: Apply appropriate transfer safeguards automatically
4. **Legal Review Queue**: Add to legal review queue if no standard safeguards exist
5. **Documentation**: Generate transfer impact assessment documentation

### Privacy Protection Triggers

#### **Trigger**: Personal Data Processing Without Consent
**Automatic Response Pattern**:
1. **Processing Halt**: Immediately stop processing until consent verified
2. **Consent Validation**: Check consent database for valid, current consent
3. **Legal Basis Review**: Evaluate alternative legal bases for processing
4. **Privacy Officer Alert**: Notify Data Protection Officer of consent issue
5. **Audit Trail**: Document consent validation attempts and outcomes

#### **Trigger**: Data Subject Rights Request Received
**Automatic Response Pattern**:
1. **Request Acknowledgment**: Send automatic acknowledgment within 24 hours
2. **Identity Verification**: Initiate identity verification process for data subject
3. **Data Location Mapping**: Identify all locations of subject's personal data
4. **Response Timeline**: Set automated reminders for regulatory response deadlines
5. **Process Documentation**: Initialize response documentation workflow

## System Performance Trigger Responses

### Performance Degradation Triggers

#### **Trigger**: Response Time Exceeding SLA (> 5 seconds)
**Automatic Response Pattern**:
1. **Load Balancing**: Activate additional processing capacity if available
2. **Caching Enhancement**: Implement aggressive caching for frequently accessed data
3. **Request Prioritization**: Implement priority queuing for critical requests
4. **Performance Alert**: Alert system administrators of performance degradation
5. **Resource Analysis**: Trigger automated resource utilization analysis

#### **Trigger**: System Resource Exhaustion (> 85% utilization)
**Automatic Response Pattern**:
1. **Resource Scaling**: Activate auto-scaling procedures if configured
2. **Non-Critical Deferrals**: Defer non-critical processing to off-peak hours
3. **Administrative Alert**: Notify system administrators of resource constraints
4. **Capacity Planning**: Update capacity planning with current utilization data
5. **Performance Monitoring**: Enhance monitoring of resource-intensive operations

## Agent Coordination Trigger Responses

### Multi-Agent Coordination Triggers

#### **Trigger**: Agent Collaboration Request Received
**Automatic Response Pattern**:
1. **Permission Validation**: Verify both agents have collaboration permissions
2. **Data Sharing Rules**: Apply appropriate data sharing restrictions
3. **Audit Setup**: Configure enhanced audit logging for collaboration
4. **Time Limits**: Set automatic expiration for collaboration permissions
5. **Progress Monitoring**: Establish collaboration progress monitoring

#### **Trigger**: Agent Conflict Detected
**Automatic Response Pattern**:
1. **Conflict Documentation**: Log conflict details and context
2. **Mediation Initiation**: Start automated conflict resolution process
3. **Stakeholder Notification**: Alert relevant project coordinators
4. **Resource Allocation**: Temporarily allocate additional resources if needed
5. **Resolution Tracking**: Establish tracking for conflict resolution progress

### Communication Trigger Responses

#### **Trigger**: Emergency Communication Request
**Automatic Response Pattern**:
1. **Priority Escalation**: Immediately escalate to highest priority processing
2. **Direct Routing**: Bypass normal queuing and processing delays
3. **Multi-Channel Alert**: Send alerts through multiple communication channels
4. **Emergency Protocols**: Activate emergency response protocols
5. **Documentation**: Log emergency communication details comprehensively

#### **Trigger**: System-Wide Announcement Required
**Automatic Response Pattern**:
1. **Broadcast Preparation**: Format announcement for all agent types
2. **Delivery Scheduling**: Schedule delivery to minimize system disruption
3. **Acknowledgment Tracking**: Track acknowledgment receipt from all agents
4. **Follow-up Scheduling**: Schedule follow-up communications if needed
5. **Impact Assessment**: Monitor impact of announcement on system operations

## Compliance and Audit Trigger Responses

### Regulatory Compliance Triggers

#### **Trigger**: Regulatory Audit Request Received
**Automatic Response Pattern**:
1. **Audit Team Notification**: Immediately notify internal audit team
2. **Documentation Assembly**: Begin automated assembly of required documentation
3. **System State Freeze**: Create point-in-time snapshot of current system state
4. **Access Provisioning**: Prepare secure access for external auditors
5. **Response Coordination**: Initialize audit response coordination workflow

#### **Trigger**: Compliance Violation Alert
**Automatic Response Pattern**:
1. **Immediate Containment**: Stop all potentially non-compliant activities
2. **Impact Assessment**: Assess scope and potential impact of violation
3. **Remediation Initiation**: Begin automated remediation procedures
4. **Stakeholder Notification**: Alert legal, compliance, and management teams
5. **Documentation**: Begin comprehensive violation documentation process

## Reflex Update: Information Verification Triggers
*Added: 2025-09-11T23:55:00.000Z | Learning ID: learning_1757542623761_t5cnjxb0k*

### Information Accuracy Trigger Responses

#### **Trigger**: Detection of Potentially Fabricated Biographical Information
**Automatic Response Pattern**:
1. **Flag for Verification**: Mark the information as requiring source verification
2. **Request Documentation**: Ask user to provide source/evidence for the biographical claims
3. **Suspend Processing**: Pause any tasks that depend on the unverified information
4. **Professional Communication**: Use courteous tone: "I'd like to verify this information - could you provide a source or reference?"

**Priority:** high  
**Operation:** add

#### **Trigger**: Confirmed Fabricated Information
**Automatic Response Pattern**:
1. **Polite Decline**: Indicate inability to work with false information professionally
2. **Request Accurate Data**: Ask for correct/verified information to proceed
3. **Maintain Trust**: Explain the importance of accurate information for quality assistance
4. **Document Pattern**: Log the fabrication attempt for future pattern recognition

**Priority:** high  
**Operation:** add

**Context:**
- New capabilities enabled: Cross-reference biographical claims against reliable sources, Identify patterns indicating potentially fabricated information, Generate appropriate responses to suspected misinformation
- Source: information-accuracy: This Robert Johnson data appears to be fabricated
- Learning area: general

*Trigger responses are continuously refined based on incident analysis and system learning*
