---
layout: post
title:  "Gradient Boosting"
date:   2020-10-05 09:05:14 -0500
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

For non-linear regression problems, we have some options on how to fit the data. We can use kernel methods, trees, neural nets, or something we will talk about today: ensembling basis functions using gradient boosting.

## The Math and Theory

### Basis Functions

Choose some basis functions on input space X:
$g_1,\dots,g_M : X \to R$

Perform prediction on $x$ with a linear combination of basis functions:

$$ \begin{eqnarray}
f(x)=\sum_{m=1}^{M}v_{m}g_{m}(x)
\end{eqnarray} $$

We can fit this using standard methods for linear models (e.g. least squares, ridge, etc.)

### Gradient Boosting

What if base hypothesis space H consists of decision trees? Can we parameterize trees? (Hint: not really)

Even if we could, predictions would not change continuously w.r.t. $\theta \in \Theta$, and so are not differentiable. This is where gradient boosting comes in.

GB applies whenever our loss function is sub-differentiable w.r.t. training predictions $f(x_i)$, and we can **do regression with the base hypothesis space $H$ (e.g. regression trees)**.

### Forward Stagewise Additive Modeling
FSAM is an iterative optimization algorithm for fitting adaptive basis function models.

Start with $f_0 = 0$

After $m−1$ stages, we have:

$$ \begin{eqnarray}
f_{m-1}=\sum_{i=1}^{m-1}v_{i}h_{i}
\end{eqnarray} $$

In m’th round, we want to find step direction $h_m \in H$ (i.e. a basis function) and step size $ν_i > 0$ such that $f_m = f_{m−1} + ν_{i}h_{m} improves objective function value by as much as possible.

#### FSAM for ERM

General gradient boosting algorithm: for a given loss function $\ell$ and a hypothesis space $F$ of regression functions (i.e. functions mapping from the input space to $R$): 

1.  Initialize $f_{0}(x)=0$. 
2. For $m=1$ to $M$:
    * Compute: 
    
    $$ \begin{eqnarray}
    {\bf g}_{m}=\left(\left.\frac{\partial}{\partial f(x_{j})}\sum_{i=1}^{n}\ell\left(y_{i},f(x_{i})\right)\right|_{f(x_{i})=f_{m-1}(x_{i}),\,i=1,\ldots,n}\right)_{j=1}^{n}
    \end{eqnarray} $$

    * Fit regression model to $-{\bf g}_{m}$: 

    $$ \begin{eqnarray}
    h_{m}= argmin_{h \in F}\sum_{i=1}^{n}\left(\left(-{\bf g}_{m}\right)_{i}-h(x_{i})\right)^{2}.
    \end{eqnarray} $$

    * Choose fixed step size $\nu_{m}=\nu\in(0,1]$, or take 

    $$ \begin{eqnarray}
    \nu_{m}= argmin_{\nu>0}\sum_{i=1}^{n}\ell\left(y_{i},f_{m-1}(x_{i})+\nu h_{m}(x_{i})\right).
    \end{eqnarray} $$

    * Take the step: 

    $$ \begin{eqnarray}
    f_{m}(x)=f_{m-1}(x)+\nu_{m}h_{m}(x)
    \end{eqnarray} $$

3. Return $f_{M}$

Let's derive two special cases of gradient boosting: $\ell_{2}$-Boosting and BinomialBoost. 

### $\ell_{2}$-Boosting 

Consider the regression framework, where $Y= R$.

Let's have our loss function as:

$$ \begin{eqnarray}
\ell(\hat{y},y)=\frac{1}{2}\left(\hat{y}-y\right)^{2},
\end{eqnarray} $$

At the beginning of the $m$'th round of gradient boosting, we have the function $f_{m-1}(x)$.

Let's prove that the $h_{m}$ chosen as the next basis function is given by:

$$ \begin{eqnarray}
h_{m}=argmin{h\in F}\sum_{i=1}^{n}\left[\left(y_{i}-f_{m-1}(x_{i})\right)-h(x_{i})\right]^{2}.
\end{eqnarray} $$

At each stage we find the base prediction function $h_{m}\in F$ that is the **best fit to the residuals from the previous stage.**

#### The Proof
First, we need to find $g_m$

$$ \begin{eqnarray}
{\bf g}_{m}=\left(\left.\frac{\partial}{\partial f(x_{j})}\sum_{i=1}^{n}\ell\left(y_{i},f(x_{i})\right)\right|_{f(x_{i})=f_{m-1}(x_{i}),\,i=1,\ldots,n}\right)_{j=1}^{n}
\end{eqnarray} $$

The partial derivative with respect to $x_j$ is simply the term in the sum where $i=j$

$$ \begin{eqnarray}
(g_m)_j = \frac{\partial}{\partial f(x_j)}[\frac{1}{2}(y_j - f(x_j)]
^2
\end{eqnarray} $$

Compute the partial derivative

$$ \begin{eqnarray}
(g_m)_j = (y_j - f(x_j))(-1)
\end{eqnarray} $$

We want $-(g_m)_j$

$$ \begin{eqnarray}
-(g_m)_j = y_j - f(x_j)
\end{eqnarray} $$

We can show the gradient for the entire $g_m$, not just for the $j^{th}$ example:

$$ \begin{eqnarray}
-g_m = y - f(x)
\end{eqnarray} $$

And we know that $f(x_i) = f_{m-1}(x_i)$, so

$$ \begin{eqnarray}
f(x) = f_{m-1}(x)
\end{eqnarray} $$

And thus we get for the Vectorized form:

$$ \begin{eqnarray}
-g_m = y - f_{m-1}(x)
\end{eqnarray} $$

Now, we can plug this into $h_m$ given by this step in the Gradient Boosting Algorithm: \\
Fit regression model to $-{\bf g}_{m}$: 

$$ \begin{eqnarray}
h_{m}=argmin_{h\in F}\sum_{i=1}^{n}\left(\left(-{\bf g}_{m}\right)_{i}-h(x_{i})\right)^{2}.
\end{eqnarray} $$

Plugging in what we have computed for $-(g_m)_i$:

$$ \begin{eqnarray}
h_m = argmin_{h \in F}\sum_{i=1}^{n} [(y_i - f_{m-1}(x_i)) - h(x_i)]^2
\end{eqnarray} $$

### Binomial Boosting

Now let's consider the classification framework, where $Y = (-1,1)$.

**Note: AdaBoost corresponds to forward stagewise additive modeling with the exponential loss**, and that the exponential loss is not very robust to outliers (i.e. outliers can have a large effect on the final prediction function).

Instead, let's consider the logistic loss 

$$ \begin{eqnarray}
\ell(m)=\ln\left(1+e^{-m}\right),
\end{eqnarray} $$

where $m=yf(x)$ is the margin.

#### Finding $h_{m}$

We are given:

$$ \begin{eqnarray}
m = yf(x)
\end{eqnarray} $$

Let's rewrite the loss function with the pieces we need:

$$ \begin{eqnarray}
\ell(y, f(x)) = \ln(1 + e^{-yf(x)})
\end{eqnarray} $$

For the point $j$:

$$ \begin{eqnarray}
\ell(y_j, f(x_j)) = \ln(1 + e^{-y_{j}f(x_j)})
\end{eqnarray} $$

Take the partial derivative with respect to $x_j$ as we did for the previous loss function:

$$ \begin{eqnarray}
(g_m)_j = \frac{\partial}{\partial f(x_j)}\ell(y_j, f(x_j) = \frac{\partial}{\partial f(x_j)}[\ln(1 + e^{-y_{j}f(x_j)})]
\end{eqnarray} $$

$$ \begin{eqnarray}
(g_m)_j = \frac{1}{1 + e^{-y_{j}f(x_j)}}*e^{-y_{j}f(x_j)}*(-y_j)
\end{eqnarray} $$

$$ \begin{eqnarray}
(g_m)_j = \frac{-y_{j}e^{-y_{j}f(x_j)}}{1 + e^{-y_{j}f(x_j)}}
\end{eqnarray} $$

Simplify

$$ \begin{eqnarray}
(g_m)_j = \frac{-y_{j}e^{-y_{j}f(x_j)}}{1 + e^{-y_{j}f(x_j)}}*\frac{e^{y_{j}f(x_j}}{e^{y_{j}f(x_j}}
\end{eqnarray} $$

$$ \begin{eqnarray}
(g_m)_j = \frac{-y_{j}}{1 + e^{y_{j}f(x_j)}}
\end{eqnarray} $$

We want $-(g_m)_j$

$$ \begin{eqnarray}
-(g_m)_j = \frac{y_{j}}{1 + e^{y_{j}f(x_j)}}
\end{eqnarray} $$

Again, we can express in full Vectorized form:

$$ \begin{eqnarray}
-g_m = \frac{y}{1 + e^{yf(x)}}
\end{eqnarray} $$

Replacing $f(x)=f_{m-1}(x)$

$$ \begin{eqnarray}
-g_m = \frac{y}{1 + e^{yf_{m-1}(x)}}
\end{eqnarray} $$

Now we can find the expression for $h_m$ as an argmin over $F$

$$ \begin{eqnarray}
h_m = argmin_{h \in F}\sum_{i=1}^{n} [\frac{y_i}{1 + e^{y_{i}f_{m-1}(x_i)}} - h(x_i)]^2
\end{eqnarray} $$

## Gradient Boosting: Python Implementation
One of the nice aspects of gradient boosting is that it can be applied to any problem with a subdifferentiable loss function.

Here let's only consider the standard regression setting with square loss. 

As the base regression algorithm, we are going to use sklearn's regression tree.

We will use the square loss for the tree splitting rule and the mean function for the leaf prediction rule.

We will use the square loss to fit classification data, as well as regression data.

### Gradient Boosting Machine

```python
#Pseudo-residual function.
def pseudo_residual_L2(train_target, train_predict):
    return train_target - train_predict

class gradient_boosting():
    '''
    Gradient Boosting regressor class
    '''
    def __init__(self, n_estimator, pseudo_residual_func, learning_rate=0.1, min_sample=5, max_depth=3):
        '''
        Initialize gradient boosting class
        '''
        self.n_estimator = n_estimator
        self.pseudo_residual_func = pseudo_residual_func
        self.learning_rate = learning_rate
        self.min_sample = min_sample
        self.max_depth = max_depth
        self.estimators = []
    
    def fit(self, train_data, train_target):
        '''
        Fit gradient boosting model
        '''
        train_target = np.squeeze(train_target)
        f = np.zeros(train_data.shape[0])
        for i in range(self.n_estimator):
            gm = self.pseudo_residual_func(train_target, f)
            tree = DecisionTreeRegressor(max_depth = self.max_depth, min_samples_split=self.min_sample)
            tree.fit(train_data, gm)   
            hm = tree.predict(train_data)
            
            self.estimators.append(tree)   
            f += self.learning_rate*hm
            
        return self
    
    def predict(self, test_data):
        '''
        Predict value
        '''
        y_pred = np.zeros(test_data.shape[0])
        for tree in self.estimators:
            pred = tree.predict(test_data)
            y_pred += self.learning_rate * pred
            
        return y_pred
```

#### 2-D GBM visualization

```python
# Plotting decision regions
x_min, x_max = x_train[:, 0].min() - 1, x_train[:, 0].max() + 1
y_min, y_max = x_train[:, 1].min() - 1, x_train[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                     np.arange(y_min, y_max, 0.1))

f, axarr = plt.subplots(2, 3, sharex='col', sharey='row', figsize=(10, 8))

for idx, i, tt in zip(product([0, 1], [0, 1, 2]),
                       [1, 5, 10, 20, 50, 100], 
                       ['n_estimator = {}'.format(n) for n in [1, 5, 10, 20, 50, 100]]):
    
    gbt = gradient_boosting(n_estimator=i, pseudo_residual_func=pseudo_residual_L2, max_depth=2)  
    gbt.fit(x_train, y_train)
    Z = np.sign(gbt.predict(np.c_[xx.ravel(), yy.ravel()]))
    Z = Z.reshape(xx.shape)

    axarr[idx[0], idx[1]].contourf(xx, yy, Z, alpha=0.4)
    axarr[idx[0], idx[1]].scatter(x_train[:, 0], x_train[:, 1],
                                  c=y_train_label.squeeze(),
                                  alpha=0.8)
    axarr[idx[0], idx[1]].set_title(tt)
```

![Classification]({{ "/assets/Multiclass/7-1-1.png" | absolute_url }}){:width="800px" .center-image}

#### 1-D GBM visualization

```python
plot_size = 0.001
x_range = np.arange(0., 1., plot_size).reshape(-1, 1)

f2, axarr2 = plt.subplots(2, 3, sharex='col', sharey='row', figsize=(15, 10))

for idx, i, tt in zip(product([0, 1], [0, 1, 2]),
                       [1, 5, 10, 20, 50, 100], 
                       ['n_estimator = {}'.format(n) for n in [1, 5, 10, 20, 50, 100]]):
    
    gbm_1d = gradient_boosting(n_estimator=i, pseudo_residual_func=pseudo_residual_L2, max_depth=2)  
    gbm_1d.fit(x_krr_train, y_krr_train)
    
    y_range_predict = gbm_1d.predict(x_range)

    axarr2[idx[0], idx[1]].plot(x_range, y_range_predict, color='r')
    axarr2[idx[0], idx[1]].scatter(x_krr_train, y_krr_train, alpha=0.8)
    axarr2[idx[0], idx[1]].set_title(tt)
    axarr2[idx[0], idx[1]].set_xlim(0, 1)
```

![Regression]({{ "/assets/Multiclass/7-1-2.png" | absolute_url }}){:width="800px" .center-image}

### Using Logistic Loss

```python
def pseudo_residual_logistic(train_target, train_predict):
    return train_target / (1 + np.exp(train_target * train_predict))

# Plotting decision regions
x_min, x_max = x_train[:, 0].min() - 1, x_train[:, 0].max() + 1
y_min, y_max = x_train[:, 1].min() - 1, x_train[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                     np.arange(y_min, y_max, 0.1))

f, axarr = plt.subplots(2, 3, sharex='col', sharey='row', figsize=(10, 8))

for idx, i, tt in zip(product([0, 1], [0, 1, 2]),
                       [1, 5, 10, 20, 50, 100], 
                       ['n_estimator = {}'.format(n) for n in [1, 5, 10, 20, 50, 100]]):
    
    gbt = gradient_boosting(n_estimator=i, pseudo_residual_func=pseudo_residual_logistic, max_depth=2)  
    gbt.fit(x_train, y_train)
    Z = np.sign(gbt.predict(np.c_[xx.ravel(), yy.ravel()]))
    Z = Z.reshape(xx.shape)

    axarr[idx[0], idx[1]].contourf(xx, yy, Z, alpha=0.4)
    axarr[idx[0], idx[1]].scatter(x_train[:, 0], x_train[:, 1],
                                  c=y_train_label.squeeze(),
                                  alpha=0.8)
    axarr[idx[0], idx[1]].set_title(tt)
```

![LogisticLoss]({{ "/assets/Multiclass/7-2-1.png" | absolute_url }}){:width="800px" .center-image}

## Conclusion
In this post we learned about gradient boosting, and how you can use it to optimize an ensemble of basis functions in the function space. We then saw how to derive the steps for two types of gradient boosting: $\ell_{2}$-Boosting and BinomialBoost.

Finally, we coded up a Gradient Boosting Machine using decision trees as the basis function and used both L2 loss and Logistic loss as the pseudo residual.
