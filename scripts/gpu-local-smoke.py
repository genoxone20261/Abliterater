import json, pathlib, subprocess, sys, time
import torch
out = {
  'torch': torch.__version__, 'cuda': torch.version.cuda,
  'available': torch.cuda.is_available(), 'device': torch.cuda.get_device_name(0),
  'memory_bytes': torch.cuda.get_device_properties(0).total_memory,
}
a=torch.randn((2048,2048), device='cuda'); b=a@a; torch.cuda.synchronize()
out['matmul_sample']=float(b[0,0]); out['status']='PASS'
pathlib.Path('artifacts/workflow/gpu-local.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print(json.dumps(out,indent=2))
