---
layout: post
title:  "Kernelized Ridge Regression Part II: The Code"
date:   2020-09-07 09:05:14 -0500
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
In my [previous post](https://nickgreenquist.github.io/blog/datascience/2020/09/05/kernel_ridge_regression_math.html), we derived and proved all the math that is foundational to Kernels and Kernelizing Ridge Regression. In this post, I will show you how to implement Kernelized Ridge Regression in Python **using no ML libraries**. 

## Kernel Ridge Regression: Code
There are many different families of kernels (linear kernels, RBF/Gaussian kernels, and polynomial kernels).
We will assume that our input space is $x \in R^{d}$. This allows
us to represent a collection of $n$ inputs in a matrix $X\in R^{n\times d}$.

### Kernel Types
Let's compute the RBF kernel

$$ \begin{eqnarray}
k_{\text{RBF}(\sigma)}(x,x')=\exp\left(-\|x-x'\|^{2}/\left(2\sigma^{2}\right)\right)
\end{eqnarray}
$$

the polynomial kernel

$$ \begin{eqnarray}
k_{\text{poly}(a,d)}(x,x')=\left(a+\left\langle x,x'\right\rangle \right)^{d}
\end{eqnarray}
$$

and the simple linear kernel

$$ \begin{eqnarray}
k_{\text{linear}}(x,x')=\left\langle x,x'\right\rangle
\end{eqnarray}
$$

Let's create functions that take as input two matrices $W\in R^{n_{1}\times d}$ and $X\in R^{n_{2}\times d}$ and should return a matrix $M\in R^{n_{1}\times n_{2}}$ where $M_{ij}=k(W_{i\cdot},X_{j\cdot})$.

This means the $(i,j)$'th entry of $M$ should be kernel evaluation between $w_{i}$ (the $i$th row of $W$) and $x_{j}$ (the $j$th row of $X$). The matrix $M$ could be called the **cross-kernel** matrix.

```python
def linear_kernel(X1, X2):
    """
    Computes the linear kernel between two sets of vectors.
    """
    return np.dot(X1,np.transpose(X2))
 
def RBF_kernel(X1,X2,sigma):
    """
    Computes the RBF kernel between two sets of vectors   
    """
    pairwise_dists = cdist(X1, X2, 'sqeuclidean')
    return scipy.exp(-pairwise_dists / (2 * sigma**2))

def polynomial_kernel(X1, X2, offset, degree):
    """
    Computes the inhomogeneous polynomial kernel between two sets of vectors
    """
    return (offset + np.dot(X1,np.transpose(X2)))**degree
```

### Kernel on Example Input
Let's use the linear kernel function we wrote to compute the kernel matrix on the set of example points $x_{0}\in D_{X} = (-4,-1,0,2)$.

```python
x = np.array([-4,-1,0,2]).reshape(-1,1)
y = linear_kernel(x, x)
y

array([[16,  4,  0, -8],
       [ 4,  1,  0, -2],
       [ 0,  0,  0,  0],
       [-8, -2,  0,  4]])
```
#### Plots of Different Kernels
Plot the set of functions $x\mapsto k_{\text{linear}}(x_{0},x)$ for $x_{0}\in D_{X}$ and for $x\in[-6,6]$. \\

```python
plot_step = .01

x0 = np.array([-4,-1,0,2]).reshape(-1,1)
y0 = np.array([ 2, 0,3,5]).reshape(-1,1)
x = np.arange(-6.0, 6, plot_step).reshape(-1,1)
y = linear_kernel(x0, x)
for i in range(len(x0)):
    label = "Linear@"+str(x0[i,:])
    plt.plot(x, y[i,:], label=label)
plt.legend(loc = 'best')
plt.show() 
```

![Plot]({{ "/assets/Kernels/6_2_3_a.png" | absolute_url }}){:width="900px" .center-image}

Plot the set of functions $x\mapsto k_{\text{poly(1,3)}}(x_{0},x)$
for $x_{0}\in D_{X}$ and for $x\in[-6,6]$. \\

```python
plot_step = .01
xpts = np.arange(-6.0, 6, plot_step).reshape(-1,1)
prototypes = np.array([-4,-1,0,2]).reshape(-1,1)

# Polynomial kernel
y = polynomial_kernel(prototypes, xpts, 1, 3) 
for i in range(len(prototypes)):
    label = "Polynomial@"+str(prototypes[i,:])
    plt.plot(xpts, y[i,:], label=label)
plt.legend(loc = 'best')
plt.show() 
```

![Plot]({{ "/assets/Kernels/6_2_3_b.png" | absolute_url }}){:width="900px" .center-image}

Plot the set of functions $x\mapsto k_{\text{RBF(1)}}(x_{0},x)$ for
$x_{0}\in D_{X}$ and for $x\in[-6,6]$. \\

```python
plot_step = .01
xpts = np.arange(-6.0, 6, plot_step).reshape(-1,1)
prototypes = np.array([-4,-1,0,2]).reshape(-1,1)

# RBF kernel
y = RBF_kernel(prototypes, xpts, 1) 
for i in range(len(prototypes)):
    label = "RBF@"+str(prototypes[i,:])
    plt.plot(xpts, y[i,:], label=label)
plt.legend(loc = 'best')
plt.show() 
```

![Plot]({{ "/assets/Kernels/6_2_3_c.png" | absolute_url }}){:width="900px" .center-image}

### Kernel Machines
Kernel Machine: a function of the form $f(x)=\sum_{i=1}^{r}\alpha_{i}k(\mu_{i},x)$, where $\mu_{1},\ldots,\mu_{r}\in X$ are called **centroids**.

In the special case that the kernel is an RBF kernel, we get what's called an **RBF Network**.

The prediction functions we get from our kernel methods will be kernel machines in which each input in the training set $x_{1},\ldots,x_{n}$ serves as a centroid point.

Let's create a **Kernel Machine Function** in Python, with the RBF kernel (sigma=1), with
prototype points at $-1,0,1$ and corresponding weights $1,-1,1$.

```python
class Kernel_Machine(object):
    def __init__(self, kernel, prototype_points, weights):
        """
        Args:
            kernel(X1,X2) - a function return the cross-kernel matrix between rows of X1 and rows of X2 for kernel k
            prototype_points - an Rxd matrix with rows mu_1,...,mu_R
            weights - a vector of length R with entries w_1,...,w_R
        """

        self.kernel = kernel
        self.prototype_points = prototype_points
        self.weights = weights
        
    def predict(self, X):
        """
        Evaluates the kernel machine on the points given by the rows of X
        Args:
            X - an nxd matrix with inputs x_1,...,x_n in the rows
        Returns:
            Vector of kernel machine evaluations on the n points in X.  Specifically, jth entry of return vector is
                Sum_{i=1}^R w_i k(x_j, mu_i)
        """
        return self.kernel(X1=X, X2=self.prototype_points).dot(self.weights)


plot_step = .01
xpts = np.arange(-6.0, 6, plot_step).reshape(-1,1)
prototypes = np.array([-1, 0, 1]).reshape(-1,1)
weights = np.array([1, -1, 1]).reshape(-1,1)

k = functools.partial(RBF_kernel, sigma=1)
f = Kernel_Machine(k, prototypes, weights)

# RBF kernel
y = RBF_kernel(prototypes, xpts, 1) 
plt.plot(xpts, f.predict(xpts), label=label)
plt.xlabel("xpts")
plt.ylabel("Prediction")
plt.show() 
```

![Plot]({{ "/assets/Kernels/6_2_3_d.png" | absolute_url }}){:width="900px" .center-image}

### Kernel Ridge Regression
Now let's create and run Kernel Ridge Regression on some toy data. We're considering a one-dimensional regression problem, in which $x = y= a = R$.

We'll fit this data using kernelized ridge regression, and we'll compare the results
using several different kernel functions. 

#### Visualize the Training Data
First let's training data. You should note that while there is a clear
relationship between $x$ and $y$, the relationship is not linear.

```python
# Plot the training data
plot_step = .001
xpts = np.arange(0 , 1, plot_step).reshape(-1,1)
plt.plot(x_train,y_train,'o')
plt.ylim(-1,1.5)
plt.show()
```

![Plot]({{ "/assets/Kernels/6_3_1.png" | absolute_url }}){:width="900px" .center-image}

#### Kernel Ridge Regression: Training Function
In the previous sections, we showed the math for kernelized ridge regression. The final prediction function is $f(x)=\sum_{i=1}^{n}\alpha_{i}k(x_{i},x)$, where $\alpha=(\lambda I+K)^{-1}y$.

$K\in R^{n\times n}$ is the kernel matrix of the training data: $K_{ij}=k(x_{i},x_{j})$, for $x_{1},\ldots,x_{n}$.

In terms of kernel machines, $\alpha_{i}$ is the weight on the kernel function evaluated at the centroid point $x_{i}$.

Let's create a function that performs kernel ridge regression and returns a **Kernel Machine** object that can be used for predicting new points.

```python
def train_kernel_ridge_regression(X, y, kernel, l2reg):
    K = kernel(X1=X, X2=X)
    alpha = np.linalg.inv(l2reg * np.identity(K.shape[0]) + K) @ y
    return Kernel_Machine(kernel, X, alpha)
```

#### Trying Different Sigma values
\item Use the code provided to plot your fits to the training data for the
RBF kernel with a fixed regularization parameter of $0.0001$ for
3 different values of sigma: $0.01$, $0.1$, and $1.0$.

```python
plot_step = .001
xpts = np.arange(0 , 1, plot_step).reshape(-1,1)
plt.plot(x_train,y_train,'o')
l2reg = 0.0001
for sigma in [.01,.1,1]:
    k = functools.partial(RBF_kernel, sigma=sigma)
    f = train_kernel_ridge_regression(x_train, y_train, k, l2reg=l2reg)
    label = "Sigma="+str(sigma)+",L2Reg="+str(l2reg)
    plt.plot(xpts, f.predict(xpts), label=label)
plt.legend(loc = 'best')
plt.ylim(-1,1.5)
plt.show()
```

![Plot]({{ "/assets/Kernels/6_3_3.png" | absolute_url }}){:width="900px" .center-image}

**MORE LIKELY TO OVERFIT**: small values of sigma

**LESS LIKELY**: larger values

#### Trying Different $\lambda$ values
\item Use the code provided to plot your fits to the training data for the
RBF kernel with a fixed sigma of $0.02$ and 4 different values of
the regularization parameter $\lambda$: $0.0001$, $0.01$, $0.1$,
and $2.0$. What happens to the prediction function as $\lambda\to\infty$? \\

```python
plot_step = .001
xpts = np.arange(0 , 1, plot_step).reshape(-1,1)
plt.plot(x_train,y_train,'o')
sigma= .02
for l2reg in [.0001,.01,.1,2.]:
    k = functools.partial(RBF_kernel, sigma=sigma)
    f = train_kernel_ridge_regression(x_train, y_train, k, l2reg=l2reg)
    label = "Sigma="+str(sigma)+",L2Reg="+str(l2reg)
    plt.plot(xpts, f.predict(xpts), label=label)
plt.legend(loc = 'best')
plt.ylim(-1,1.5)
plt.show()
```

![Plot]({{ "/assets/Kernels/6_3_4.png" | absolute_url }}){:width="900px" .center-image}

#### Hyperparameter Search
Let's find the best hyperparameter settings (including kernel parameters and the regularization parameter) for each of the kernel types. 

We will use average square loss on the test set to rank the parameter settings.

```python
param_grid = [{'kernel': ['RBF'],'sigma':[.1,1,10], 'l2reg': np.exp2(-np.arange(-5,5,1))},
              {'kernel':['polynomial'],'offset':[-1,0,1], 'degree':[2,3,4],'l2reg':[10, .1, .01] },
              {'kernel':['linear'],'l2reg': [10,1,.01]}]
kernel_ridge_regression_estimator = KernelRidgeRegression()
grid = GridSearchCV(kernel_ridge_regression_estimator, 
                    param_grid,
                    cv = predefined_split,
                    scoring = make_scorer(mean_squared_error,greater_is_better = False)
                   )
grid.fit(np.vstack((x_train,x_test)),np.vstack((y_train,y_test))) 

pd.set_option('display.max_rows', 60)
df = pd.DataFrame(grid.cv_results_)
# Flip sign of score back, because GridSearchCV likes to maximize,
# so it flips the sign of the score if "greater_is_better=FALSE"
df['mean_test_score'] = -df['mean_test_score']
df['mean_train_score'] = -df['mean_train_score']
cols_to_keep = ["param_degree", "param_kernel","param_l2reg" ,"param_offset","param_sigma",
        "mean_test_score","mean_train_score"]
df_toshow = df[cols_to_keep].fillna('-')
df_toshow.sort_values(by=["mean_test_score"])
```

![Plot]({{ "/assets/Kernels/6_3_5.PNG" | absolute_url }}){:width="900px" .center-image}

#### Best Fitting Prediction Functions: RBF and Polynomial
We will use the domain $x\in\left(-0.5,1.5\right)$

```python
## Plot the best polynomial and RBF fits you found
plot_step = .01
xpts = np.arange(-.5 , 1.5, plot_step).reshape(-1,1)
plt.plot(x_train,y_train,'o')

#Plot best polynomial fit
offset= -1
degree = 4
l2reg = 0.01
k = functools.partial(polynomial_kernel, offset=offset, degree=degree)
f = train_kernel_ridge_regression(x_train, y_train, k, l2reg=l2reg)
label = "Offset="+str(offset)+",Degree="+str(degree)+",L2Reg="+str(l2reg)
plt.plot(xpts, f.predict(xpts), label=label)

#Plot best RBF fit
sigma = 0.1
l2reg= 0.0625
k = functools.partial(RBF_kernel, sigma=sigma)
f = train_kernel_ridge_regression(x_train, y_train, k, l2reg=l2reg)
label = "Sigma="+str(sigma)+",L2Reg="+str(l2reg)
plt.plot(xpts, f.predict(xpts), label=label)
plt.legend(loc = 'best')
plt.ylim(-1,1.75)
plt.show()
```

![Plot]({{ "/assets/Kernels/6_3_6.png" | absolute_url }}){:width="900px" .center-image}

RBF Fits the data a bit better. However, the most interesting observation is after there is no training data, the RBF Kernel does not attempt to predict any statistical patterns. It's just a straight line in the ranges where there is no data. The Polynomial kernel attempts to learn a function that persists for all ranges of points, not just what was in the input data. 

#### Trying Different Kernel Functions

Let's implement two other kernels:

```python
def laplace_kernel(X1,X2,sigma):
    pairwise_dists = cdist(X1, X2, 'euclidean')
    return scipy.exp(-pairwise_dists / sigma)

def exponential_kernel(X1,X2,sigma):
    pairwise_dists = cdist(X1, X2, 'euclidean')
    return scipy.exp(-pairwise_dists / (2 * sigma**2))
```

Grid search for hyperparameters:

```python
param_grid = [{'kernel': ['RBF'],'sigma':[.1,1,10], 'l2reg': np.exp2(-np.arange(-5,5,1))},
              {'kernel': ['exponential'],'sigma':[.1,1,10], 'l2reg': np.exp2(-np.arange(-5,5,1))},
              {'kernel': ['laplace'],'sigma':[.1,1,10], 'l2reg': np.exp2(-np.arange(-5,5,1))},
              {'kernel':['polynomial'],'offset':[-1,0,1], 'degree':[2,3,4],'l2reg':[10, .1, .01] },
              {'kernel':['linear'],'l2reg': [10,1,.01]}]
```

![Plot]({{ "/assets/Kernels/6_3_8.PNG" | absolute_url }}){:width="900px" .center-image}

#### Compare to best Scikit-Learn model
Let's see if we can use scikit-learn to beat our 'from scratch' results.

```python
from sklearn.ensemble import RandomForestRegressor

for e in [5, 6, 7, 8, 9, 10, 20, 30, 40, 50]:
    model = RandomForestRegressor(n_estimators=e, max_features=1)
    model.fit(x_train, y_train.reshape(y_train.shape[0],))

    predictions = model.predict(x_test)
    total = 0.0
    for i in range(len(predictions)):
        total += (predictions[i] - y_test[i])**2
    mte = total / len(y_test)
    print("n_estimators={}, mean_test_error={}".format(e, mte))

n_estimators=5, mean_test_error=[0.01533148]
n_estimators=6, mean_test_error=[0.01790808]
n_estimators=7, mean_test_error=[0.01482915]
n_estimators=8, mean_test_error=[0.02381478]
n_estimators=9, mean_test_error=[0.01634443]
n_estimators=10, mean_test_error=[0.01703256]
n_estimators=20, mean_test_error=[0.01712378]
n_estimators=30, mean_test_error=[0.0159803]
n_estimators=40, mean_test_error=[0.01628942]
n_estimators=50, mean_test_error=[0.01544227]
```

**BEST**: The RandomForestRegresso with 7 estimators and 1 feature achieved a mean test error of 0.01482915. This is best model on this dataset using any model.

## Kernelization: Pros and Cons
As with all ML methods, there are tradeoffs. Kernelizing well understood models (like Ridge Regression) is not going to solve all your problems. Here are a few Pros and Cons of Kernel Methods. 

### Pros
1. You can use well understood algorithms for more complicated feature spaces
2. Good performance

### Cons
1. You have to add selecting a kernel to hyperparameter tuning
2. Performance scales exponentially with the amount of data you have (since you are computing the similarities between data points). Once you have > 100k training points, you're much better off using **Deep Learning**. 

## Conclusion
That was quite a journey! In the past two posts, we've seen how to take a super simple linear model, and using some powerful mathematical facts and theorems, tweak it to be used on non-linear data. 
