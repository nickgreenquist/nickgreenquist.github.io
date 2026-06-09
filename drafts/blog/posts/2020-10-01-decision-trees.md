---
layout: post
title:  "Decision Tree From Scratch"
date:   2020-10-01 09:05:14 -0500
categories: Datascience
---
<style type="text/css">
    .center-image
    {
        margin: 0 auto;
        display: block;
    }
</style>

<script type="text/x-mathjax-config">
      MathJax.Hub.Config({
        tex2jax: {
          skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          inlineMath: [['$','$']]
        }
      });
</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML" async></script>
By: [Nick Greenquist](https://nickgreenquist.github.io/)

## Introduction

Decision trees are an super verstaile and widely used machine learning model. 

Decision trees can be used for solving regression and classification simply by **using a different loss function to decide when to split.**

Using simple decision rules inferred from training data, the Decision Tree can learn to predict classes/values of a target variable. 

When performing prediction, we start at the root of the tree. We compare the values of the root with the new data value. If the current node is not a leaf, we decide which sub tree to recurse into to provide the best prediction. Once we find a leaf node, we have 'found' the best prediction.

**In this problem we'll implement decision trees for both classification and regression.**

## Decision Tree Implementation

The strategy will be to implement a generic class called `Decision Tree`, which we'll supply with the loss function we want to use to make node splitting decisions, as well as the estimator we'll use to come up with the prediction associated with each leaf node.

**Depending on the loss function we use, we can use our Decision Tree to perform classification or regression!!**

### Implementation Details
Each object of type `Decision Tree` represents one node of
the tree.
The depth of that node is represented by the variable self.depth. The root node has depth 0.
The fit function's job is to decide, given the data, how to split the node or whether it should remain a leaf node.
If the node splits, then the splitting feature and splitting value are saved, and the left and right subtrees are fit on the split portions of the data.

#### Tree-building is Recursive
We should have as many `Decision Tree` objects as there are nodes in the tree.

### Decision Tree Class

Init method for the Decision Tree class.

```python
class Decision_Tree(BaseEstimator):  
    def __init__(self, split_loss_function, leaf_value_estimator,
                 depth=0, min_sample=5, max_depth=10):
        '''
        Initialize the decision tree

        split_loss_function: method for splitting node
        leaf_value_estimator: method for estimating leaf value
        depth: depth indicator, default value is 0, representing root node
        min_sample: an internal node can be splitted only if it contains points more than min_smaple
        max_depth: restriction of tree depth.
        '''
        self.split_loss_function = split_loss_function
        self.leaf_value_estimator = leaf_value_estimator
        self.depth = depth
        self.min_sample = min_sample
        self.max_depth = max_depth
```

#### Split Helper Function

Helper function to split the data by the split_value.

```python
def split(split_index, split_value, X):
    left = []
    right = []
    for i in range(X.shape[0]):
        if X[i][split_index] < split_value:
            left.append(i)
        else:
            right.append(i)
    return left, right
```

#### Fit Function

This function will fit the tree classifier by setting the values self.is_leaf, self.split_id (the index of the feature we want ot split on if we're splitting), self.split_value (the corresponding value of that feature where the split is), and self.value, which is the prediction value if the tree is a leaf node. 

If we are  splitting the node, we should also init self.left and self.right to be Decision_Tree objects corresponding to the left and right subtrees. These subtrees should be fit on the data that fall to the left and right of self.split_value.

This function is recursive.

```python
class Decision_Tree(BaseEstimator):
    def fit(self, X, y=None):
        n = X.shape[0]
        m = X.shape[1]
        
        self.is_leaf = True
        self.value = self.leaf_value_estimator(y)
        
        if self.depth >= self.max_depth or n < self.min_sample:
            return self
        
        # Try all splits
        min_loss = self.split_loss_function(y)
        for j in range(m):
            for i in range(n):
                row = X[i]
                left, right = split(j, row[j], X)
                if len(left) > 0 and len(right) > 0:
                    loss = (len(left)/n)*self.split_loss_function(y[left]) + (len(right)/n)*self.split_loss_function(y[right])
                    if loss < min_loss:
                        self.is_leaf = False # we will split
                        min_loss = loss
                        self.split_id = j
                        self.split_value = row[j]
                    
        if self.is_leaf is False:
            # Using best split, actually split points and labels to pass to children
            left, right = split(self.split_id, self.split_value, X)

            # Create children Trees
            self.left = Decision_Tree(self.split_loss_function, self.leaf_value_estimator,
                                      self.depth + 1, self.min_sample, self.max_depth)
            self.left.fit(X[left], y[left])

            self.right = Decision_Tree(self.split_loss_function, self.leaf_value_estimator,
                                      self.depth + 1, self.min_sample, self.max_depth)
            self.right.fit(X[right], y[right])

        return self
```

#### Prediction Function

Given a value, predicts a value using the Decision Tree by finding the best leaf node.

```python
    def predict_instance(self, instance):
        '''
        Predict label by decision tree
        return whatever is returned by leaf_value_estimator for leaf containing instance
        '''
        if self.is_leaf:
            return self.value
        if instance[self.split_id] <= self.split_value:
            return self.left.predict_instance(instance)
        else:
            return self.right.predict_instance(instance)
```

### Compute Entropy Function

Loss function used to compute the entropy of an array of labels.

**We can use this loss function to use our Decision Tree to perform classification.**

```python
def compute_entropy(label_array):
    '''
    Calulate the entropy of given label list
    '''
    count = label_array.shape[0]
    ones = 0
    zeros = 0
    for i in range(count):
        y = label_array[i][0]
        if y == 1:
            ones += 1
        else:
            zeros += 1
    ones = ones / count
    zeros = zeros / count
    entropy = ones*np.log2(ones) + zeros*np.log2(zeros)
    
    return -entropy
```

Results:
![Classification]({{ "/assets/Multiclass/5-2.png" | absolute_url }}){:width="800px" .center-image}

### mean_absolute_deviation_around_median Function

Loss function used to compute the mean absolute deviation around the median. 

**We can use this loss function to use our Decision Tree to perform regression.**

```python
# Regression Tree Specific Code
def mean_absolute_deviation_around_median(y):
    '''
    Calulate the mean absolute deviation around the median of a given target list
    '''
    median = np.median(y)
    mae = 0
    for i in range(y.shape[0]):
        mae += abs(y[i][0] - median)
    return mae/y.shape[0]
```

Results:
![Regression]({{ "/assets/Multiclass/5-3.png" | absolute_url }}){:width="800px" .center-image}
