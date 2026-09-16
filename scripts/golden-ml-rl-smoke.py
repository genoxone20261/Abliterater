import hashlib,json,pathlib,platform,time
import gymnasium as gym
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

out={"schemaVersion":1,"python":platform.python_version(),"numpy":np.__version__}
X,y=load_iris(return_X_y=True)
xt,xv,yt,yv=train_test_split(X,y,test_size=.25,random_state=42,stratify=y)
m=LogisticRegression(max_iter=500,random_state=42).fit(xt,yt)
p=m.predict(xv); out["ml"]={"dataset":"sklearn:iris","seed":42,"accuracy":float(accuracy_score(yv,p)),"samples":len(yv)}
env=gym.make("CartPole-v1"); obs,_=env.reset(seed=42); total=0.0; steps=0
for steps in range(1,51):
 action=0 if obs[2]<0 else 1; obs,reward,terminated,truncated,_=env.step(action); total+=reward
 if terminated or truncated: break
env.close(); out["rl"]={"environment":"CartPole-v1","seed":42,"steps":steps,"reward":total}
payload=json.dumps(out,sort_keys=True,separators=(",",":")); out["resultSha256"]=hashlib.sha256(payload.encode()).hexdigest(); out["status"]="PASS"
path=pathlib.Path("artifacts/golden/ml-rl.json");path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(out,indent=2),encoding="utf-8");print(json.dumps(out,indent=2))
