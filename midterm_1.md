# Problem
* Download the cleaned dataset with readme from the group chat. It is based on the [3DSC database ](https://github.com/aimat-lab/3DSC) if you want more details
* Perform clustering with several methods from scikit-learn. Try at least three different methods. Examples of clustering tasks can be:
    - superconductor / non-superconductor
    - type of superconductor
    - critical temperature T_c higher or lower than 10 K
    - any other interesting ideas you come up with. Feel free to consult with us
* Try getting the best results with each of the methods. You can use [Optuna](https://optuna.org/) for hyperparameter search
* Try feature engineering with help of TDA methods such as LLE, t-SNE, etc. You should use at least three different methods
* Calculate appropriate metrics (including the ones which don't rely on knowing the real labels) for each of the methods. Show how much information is preserved with dimensionality reduction
* Try vizualization of the results when possible
* Try clustering on top of the dataset with reduced dimensionality and compare the results and metrics. Improvize
* Draw conclusions. Which method is the best? Why? What other out-of-scope methods can you think of? Don't be sad if the final results aren't as good as you expected

# Grading criteria:
* Confident usage of TDA methods.
* Succinct, cohesive, and coherent expression of your thoughts, i.e. clear statement (in a few sentences) about the problem you are solving, what approaches do you propose, their comparison, and what conclusions can be drawn regarding these approaches in the context of the problem.