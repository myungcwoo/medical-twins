import os
import re

d = r'd:\Projects\Antigravity\workspace\medical-twins\src'

target_types = {'AgentState', 'Sex', 'ExerciseRoutine', 'MedicalCompliance', 'AgentRole', 'Labs', 'Vitals', 'Imaging', 'BiometricSnapshot', 'AgentEvent'}

def fix_content(content, path):
    lines = content.split('\n')
    new_lines = []
    changed = False
    
    for line in lines:
        # Match any import from somewhere ending in Agent or Simulation.types
        # e.g., import type { Agent } from '../types/Simulation.types';
        # e.g., import { AgentState } from '../simulation/Agent';
        
        m_agent = re.search(r'import\s+(?:type\s+)?{([^}]+)}\s+from\s+[\'"](.*?)Agent[\'"];', line)
        m_types = re.search(r'import\s+(?:type\s+)?{([^}]+)}\s+from\s+[\'"](.*?)Simulation\.types[\'"];', line)
        
        if m_agent:
            imports = [x.strip() for x in m_agent.group(1).split(',')]
            prefix = m_agent.group(2)
            
            agent_imports = [x for x in imports if x == 'Agent']
            type_imports = [x for x in imports if x in target_types]
            other_imports = [x for x in imports if x != 'Agent' and x not in target_types]
            
            if len(type_imports) > 0:
                changed = True
                
                # Determine how to reach types instead of simulation
                if prefix == './':
                    t_prefix = '../types/'
                else:
                    t_prefix = prefix.replace('simulation', 'types')
                
                new_lines.append(f"import type {{ {', '.join(type_imports)} }} from '{t_prefix}Simulation.types';")
                
                remains = agent_imports + other_imports
                if remains:
                    is_type = 'type ' if 'import type' in line else ''
                    new_lines.append(f"import {is_type}{{ {', '.join(remains)} }} from '{prefix}Agent';")
            else:
                new_lines.append(line)
                
        elif m_types:
            imports = [x.strip() for x in m_types.group(1).split(',')]
            prefix = m_types.group(2)
            
            if 'Agent' in imports:
                changed = True
                imports.remove('Agent')
                
                if prefix == '../types/':
                    a_prefix = '../simulation/' # Wait, if it's in simulation it's './'. Let's check path.
                    if 'simulation' in path: 
                        if prefix == '../types/': a_prefix = './'
                        elif prefix == '../../types/': a_prefix = '../'
                elif prefix == '../../types/':
                    a_prefix = '../../simulation/'
                else:
                    a_prefix = prefix.replace('types', 'simulation')
                    
                new_lines.append(f"import type {{ Agent }} from '{a_prefix}Agent';")
                if imports:
                    is_type = 'type ' if 'import type' in line else ''
                    new_lines.append(f"import {is_type}{{ {', '.join(imports)} }} from '{prefix}Simulation.types';")
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    return '\n'.join(new_lines) if changed else None


for root, _, files in os.walk(d):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as f_in:
                text = f_in.read()
            
            new_text = fix_content(text, path)
            if new_text:
                print("Fixed imports in " + path)
                with open(path, 'w', encoding='utf-8') as f_out:
                    f_out.write(new_text)
