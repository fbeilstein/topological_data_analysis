# Problem


* This is the problem of a satellite data classification.
* Download the dataset with the following code
```python
import gdown
import scipy.io
import numpy as np
import os.path

downloads = [
    {'code': '1Fa4rZX0BHiQhUiCP_2xVwZOsx0Qj0t2V', 'file': 'bpsk.mat', 'class_name': 'bpsk'},
    {'code': '1cnpesRdxTPP9KtFkwF4EICB-T_rBgz_o', 'file': 'qpsk.mat', 'class_name': 'qpsk'},
    {'code': '16pdX8Zw2q3Q2DqCBIL_2PwTspacWJ9us', 'file': '8psk.mat', 'class_name': '8psk'},
    {'code': '1xg77qVSrTMATWT1o84Q7OrXgxSd1KpGm', 'file': '8QAM.mat', 'class_name': '8QAM'},
    {'code': '1ZcQOq8k2QspvO0M_dl0VeH_nQ8somMDZ', 'file': '16QAM.mat', 'class_name': '16QAM'}
]
X = []; y = []; class_code = {}
for i,d in enumerate(downloads):
  if not os.path.isfile(d['file']):
    gdown.download(f"https://drive.google.com/uc?id={d['code']}", d['file'], quiet=False)
  X.append(scipy.io.loadmat(d['file'])['y_total'][0].transpose(1, 2, 0).reshape(-1, 1024))
  y.append(np.ones(X[-1].shape[0]) * i)
  class_code[i] = d['class_name']
X = np.vstack(X)
y = np.hstack(y)
```
* The data contains 40000 chunks of 1024 signal measurements that belong to one of the classes: `bpsk`, `qpsk`, `8psk`, `8QAM`, `16QAM`, the variable `class_code` defines the correspondence between the name and its code stored in `y`, the actual data is stored in `X`.
* Transform the data into multidimensional features. At least Takens Embedding should be applicable, but you're free to choose any other method that you might think may be helpful.
* Explore persistence diagrams. Can you find parameters such that diagrams for the same class look similar, while different classes would be different?
* Use Wasserstein distance to quantify similarity/dissimilarity between diagrams.



# Grading criteria:
* Confident usage of TDA methods.
* Succinct, cohesive, and coherent expression of your thoughts, i.e. clear statement (in a few sentences) about the problem you are solving, what approaches do you propose, their comparison, and what conclusions can be drawn regarding these approaches in the context of the problem.


