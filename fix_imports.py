import os
import re

d = r'd:\Projects\Antigravity\workspace\medical-twins\src'

def fix_imports(content):
    orig = content

    def replacer1(m):
        imports_str = m.group(1)
        prefix = m.group(2)
        imports = [x.strip() for x in imports_str.split(',')]
        
        has_agent = 'Agent' in imports
        if has_agent:
            imports.remove('Agent')
        
        ag_prefix = prefix.replace('types', 'simulation')
        res = ""
        if has_agent:
            res += "import type { Agent } from '" + ag_prefix + "Agent';\n"
        if imports:
            res += "import type { " + ", ".join(imports) + " } from '" + prefix + "Simulation.types';"
        return res

    content = re.sub(r"import type {([^}]+)} from '([./]+)Simulation\.types';", replacer1, content)
    
    target_types = ['AgentState', 'Sex', 'ExerciseRoutine', 'MedicalCompliance', 'AgentRole', 'Labs', 'Vitals', 'Imaging', 'BiometricSnapshot', 'AgentEvent']
    def replacer2(m):
        imports_str = m.group(1)
        prefix = m.group(2)
        imports = [x.strip() for x in imports_str.split(',')]
        
        agent_types = [x for x in imports if x in target_types]
        other_types = [x for x in imports if x not in target_types]
        
        types_prefix = '../types/' if prefix == './' else prefix.replace('simulation', 'types')
        
        res = ""
        if other_types:
            # check if it imported Agent itself without {}
            # Wait, this regex matches import { AgentState } from './Agent';
            res += "import { " + ", ".join(other_types) + " } from '" + prefix + "Agent';\n"
        if agent_types:
            res += "import type { " + ", ".join(agent_types) + " } from '" + types_prefix + "Simulation.types';"
        return res

    content = re.sub(r"import {([^}]+)} from '([./]+)Agent';", replacer2, content)
    
    return content if content != orig else None

for root, _, files in os.walk(d):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as f_in:
                text = f_in.read()
            new_text = fix_imports(text)
            if new_text:
                print("Fixed " + path)
                with open(path, 'w', encoding='utf-8') as f_out:
                    f_out.write(new_text)
