#!/usr/bin/env python3
import re

# Read the configmap file
with open('personal/InterviewPrep/UiPath/technical-implementation/monitoring/all-dashboards-configmap.yaml', 'r') as f:
    content = f.read()

# Find and fix the broken query in Panel 2
# The pattern looks for the Total Fleet panel query that's currently broken
broken_pattern = r'(sum\(robot_fleet_healthy\) \+ sum\(robot_fleet_degraded\) \+ sum\(robot_fleet_critical\))'
fixed_query = 'sum(robot_fleet_total)'

if re.search(broken_pattern, content):
    content = re.sub(broken_pattern, fixed_query, content)
    print("✅ Fixed broken Total Fleet query")
else:
    print("❌ Broken query pattern not found, looking for alternative patterns...")
    # Try alternative patterns
    alt_patterns = [
        r'sum\(robot_fleet_healthy\).*sum\(robot_fleet_degraded\).*sum\(robot_fleet_critical\)',
        r'robot_fleet_healthy.*robot_fleet_degraded.*robot_fleet_critical',
    ]
    
    for pattern in alt_patterns:
        if re.search(pattern, content):
            print(f"Found alternative pattern: {pattern}")
            break
    else:
        print("No matching patterns found. Let's see what queries are in Panel 2...")
        # Extract just the area around Panel 2
        panel_2_match = re.search(r'"id": 2.*?"targets".*?"expr": "([^"]+)"', content, re.DOTALL)
        if panel_2_match:
            print(f"Current Panel 2 query: {panel_2_match.group(1)}")

# Write the updated content
with open('personal/InterviewPrep/UiPath/technical-implementation/monitoring/all-dashboards-configmap.yaml', 'w') as f:
    f.write(content)

print("Configmap updated")
