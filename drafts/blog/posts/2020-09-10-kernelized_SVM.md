---
layout: post
title:  "Kernelized SVM"
date:   2020-09-10 09:05:14 -0500
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
Previously, we learned about all the foundational math for SVM, what Pegasos SVM was, and how to implement it in Python. We also learned about what Kernels were, and how to 'kernelize' Ridge Regression. In this post, we will combine all of our knowledge to kernelize Pegasos SVM. This will allow us to use it to perform 'non-linear classification.'

## Kernelized Pegasos - Math

Let's remember the SVM objective function

$$ \begin{eqnarray}
\min_{w\in R^{n}}\frac{\lambda}{2}\|w\|^{2}+\frac{1}{m}\sum_{i=1}^{m}\max\left(0,1-y_{i}w^{T}x_{i}\right)
\end{eqnarray}
$$

and the Pegasos algorithm on the training set $(x_{1},y_{1}),\ldots,(x_{n},y_{n})\in R^{d}\times(-1,1)$

![Pegasos]({{ "/assets/Kernels/pegasos.png" | absolute_url }}){:width="900px" .center-image}

Note that in every step of Pegasos, we rescale $w^{(t)}$ by $\left(1-\eta^{(t)}\lambda\right)=\left(1-\frac{1}{t}\right)\in\left(0,1\right)$.

This **shrinks** the entries of $w^{(t)}$ towards $0$, and it's due to the regularization term $\frac{\lambda}{2}\|w\|_{2}^{2}$ in the SVM objective function.

Also note that if the example in a particular step, say $\left(x_{j},y_{j}\right)$, is not classified with the required margin (i.e. if we don't have margin $y_{j}w_{t}^{T}x_{j}\ge1$), then we also add a multiple of $x_{j}$ to $w^{(t)}$ to end up with $w^{(t+1)}$.
This part of the adjustment comes from the empirical risk. Since we initialize with $w^{(1)}=0$, we are guaranteed that we can always write

$$ \begin{eqnarray}
w^{(t)}=\sum_{i=1}^{n}\alpha_{i}^{(t)}x_{i}
\end{eqnarray}
$$

### Kernelized Margin
Let's kernelize the expression for the margin.

Let's show that $y_{j}\left\langle w^{(t)},x_{j}\right\rangle =y_{j}K_{j\cdot}\alpha^{(t)}$, where $k(x_{i},x_{j})=\left\langle x_{i},x_{j}\right\rangle $ and $K_{j\cdot}$ denotes the $j$th row of the kernel matrix $K$ corresponding to kernel $k$.

$$ \begin{eqnarray}
\left\langle w^{(t)},x_{j} \right\rangle = \left\langle x_{j}, w^{(t)}\right\rangle
\end{eqnarray}
$$

Margin becomes:

$$ \begin{eqnarray}
y_{j}\left\langle x_{j}, w^{(t)}\right\rangle
\end{eqnarray}
$$

$$ \begin{eqnarray}
y_{j}x_j^Tw^{(t)}
\end{eqnarray}
$$

Note:

$$ \begin{eqnarray}
w^{(t)} = X^T\alpha^{(t)}
\end{eqnarray}
$$

Inject into:

$$ \begin{eqnarray}
y_{j}x_j^TX^T\alpha^{(t)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
y_{j}K_{j.}\alpha^{(t)}
\end{eqnarray}
$$

### Updating $\alpha$
Suppose that $w^{(t)}=\sum_{i=1}^{n}\alpha_{i}^{(t)}x_{i}$ and for the next step we select a point $\left(x_{j},y_{j}\right)$ that does not have a margin violation.

Let's derive the update expression for $\alpha^{(t+1)}$ so that $w^{(t+1)}=\sum_{i=1}^{n}\alpha_{i}^{(t+1)}x_{i}$.\\

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \eta^{(t)}\lambda)w^{(t)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
X^T\alpha^{(t+1)} = (1 - \eta^{(t)}\lambda)X^T\alpha^{(t)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\alpha^{(t+1)} = (1 - \eta^{(t)}\lambda)\alpha^{(t)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\alpha^{(t+1)} = (1 - \frac{1}{t})\alpha^{(t)}
\end{eqnarray}
$$

Now let's find the update expression for the case that $\left(x_{j},y_{j}\right)$ has a margin violation.

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \eta^{(t)}\lambda)w^{(t)} + \eta y_jx_j
\end{eqnarray}
$$

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \frac{1}{t})X^T\alpha^{(t)} + \eta y_jx_j
\end{eqnarray}
$$

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \frac{1}{t})(\alpha_1x_1 + \dots + \alpha_jx_j + 
\dots \alpha_nx_n)+ \eta y_jx_j
\end{eqnarray}
$$

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \frac{1}{t})\alpha_1x_1 + \dots (1 - \frac{1}{t})\alpha_jx_j + \dots (1 - \frac{1}{t})\alpha_nx_n + \eta y_jx_j
\end{eqnarray}
$$

Group the $x_j$ together

$$ \begin{eqnarray}
w^{(t+1)} = (1 - \frac{1}{t})\alpha_1x_1 + \dots x_j((1 - \frac{1}{t})\alpha_j + \eta y_j) + \dots (1 - \frac{1}{t})\alpha_nx_n
\end{eqnarray}
$$

As we can see, this update to $\alpha$ is the same as for when we don't have a margin violation, but the $\alpha_j$ column simply is added with $\eta y_j$. Therefore, the update for this case would be:

$$ \begin{eqnarray}
\alpha^{(t+1)} = (1 - \frac{1}{t})\alpha^{(t)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\alpha_j^{(t+1)} += \eta^{(t)}y_j
\end{eqnarray}
$$

### Kernelized Pegasos Pseudocode

Using what we have derived, here is the full pseudocode for Kernelized Pegasos.

![PegasosKernelized]({{ "/assets/Kernels/kernelized_pegasos.png" | absolute_url }}){:width="900px" .center-image}

## Kernelized Pegasos - Code

Let's load the SVM data and plot the training data using the code supplied.

```python
#load the training and test sets
data_train,data_test = np.loadtxt("svm-train.txt"),np.loadtxt("svm-test.txt")
x_train, y_train = data_train[:,0:2], data_train[:,2].reshape(-1,1)
x_test, y_test = data_test[:,0:2], data_test[:,2].reshape(-1,1)

#determine predictions for the training set
yplus = np.ma.masked_where(y_train[:,0]<=0, y_train[:,0])
xplus = x_train[~np.array(yplus.mask)]
yminus = np.ma.masked_where(y_train[:,0]>0, y_train[:,0])
xminus = x_train[~np.array(yminus.mask)]

#plot the predictions for the training set
figsize = plt.figaspect(1)
f, (ax) = plt.subplots(1, 1, figsize=figsize) 

pluses = ax.scatter (xplus[:,0], xplus[:,1], marker='+', c='r', label = '+1 labels for training set')
minuses = ax.scatter (xminus[:,0], xminus[:,1], marker=r'$-$', c='b', label = '-1 labels for training set')

ax.set_ylabel(r"$x_2$", fontsize=11)
ax.set_xlabel(r"$x_1$", fontsize=11)
ax.set_title('Training set size = %s'% len(data_train), fontsize=9)  
ax.axis('tight')
ax.legend(handles=[pluses, minuses], fontsize=9)
plt.show()
```

![TrainingData]({{ "/assets/Kernels/6_4_1.png" | absolute_url }}){:width="500px" .center-image}

The data is not linearly seperable. The data is seperable if we use a feature mapping that includes all the squared terms of the features. For example, an RBF kernel would be great to seperate it just based on the shape of the data. 

Let's apply Kernels to make our SVM be able to classify this data:

![KernelMapping]({{ "/assets/Kernels/kernel.png" | absolute_url }}){:width="900px" .center-image}

### Implement Kernelized Pegasos

```python
def increment(d1, scale, d2):
    for f, v in d2.items():
        d1[f] = d1.get(f, 0) + v * scale

def scale(d, scale):
    for f, v in d.items():
        d[f] = v * scale

def dotProduct(d1, d2):
    if len(d1) < len(d2):
        return dotProduct(d2, d1)
    else:
        return sum(d1.get(f, 0) * v for f, v in d2.items())

# Implement Kernelized Pegasos
def kernelized_pegasos(X, y, K, lamb=1, epochs=1000):
    m = y.shape[0]
    t = 1.0 # to prevent t=1 inside the inner loop
    a = np.zeros(m)
    for i in range(epochs):
        for j in range(m):
            t += 1
            learning_rate = 1.0 / (t * lamb)
            x_j = X[j]
            y_j = y[j]
            pred = y_j * (K[j] @ a)
            if pred < 1:
                a = (1.0 - (learning_rate * lamb)) * a
                a[j] = a[j] + learning_rate * y_j
            else:
                a = (1.0 - (learning_rate * lamb)) * a
    return a
```

### Hyperparameter Tuning
Let's find the best hyperparameter settings (including kernel params and the regularization param) for each of the kernel
types.

```python
def calculate_accuracy(X_test, X_train, y, a, kernel):
    correct = 0
    for i in range(len(y)):
        x_j = X_test[i].reshape(-1, 1).T
        k = kernel(X1=x_j, X2=X_train)
        margin = (k @ a) * y[i]
        if margin > 0:
            correct += 1
    return correct / len(y)

def calculate_percent_error(X_test, X_train, y, a, kernel):
    return 1.0 - calculate_accuracy(X_test, X_train, y, a, kernel)
    
# Hyperparameter Grid Search for Kernelized Pegasos - Linear Kernel
print("Kernel, Degree, L2Reg, Offset, Sigma, Train_Error, Test_Error")
for l2reg in [.0001,.01,.1,2.]:
    K_train = linear_kernel(X1=x_train, X2=x_train)
    a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)

    k = functools.partial(linear_kernel)
    train_error = calculate_percent_error(x_train, x_train, y_train, a, k)
    test_error = calculate_percent_error(x_test, x_train, y_test, a, k)
    print("Linear, NA, {}, NA, NA, {}, {}".format(l2reg, train_error, test_error))

# Hyperparameter Grid Search for Kernelized Pegasos - Polynomial Kernel
print("Kernel, Degree, L2Reg, Offset, Sigma, Train_Error, Test_Error")
for offset in [1,2,3]:
    for degree in [2, 3, 4]:
        for l2reg in [.0001,.01,.1,2.]:
            K_train = polynomial_kernel(X1=x_train, X2=x_train, degree=degree, offset=offset)
            a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)

            k = functools.partial(polynomial_kernel, degree=degree, offset=offset)
            train_error = calculate_percent_error(x_train, x_train, y_train, a, k)
            test_error = calculate_percent_error(x_test, x_train, y_test, a, k)
            print("Poly, {}, {}, {}, NA, {}, {}".format(degree, l2reg, offset, train_error, test_error))

# Hyperparameter Grid Search for Kernelized Pegasos - RBF Kernel
print("Kernel, Degree, L2Reg, Offset, Sigma, Train_Error, Test_Error")
for sigma in [.01,.1,1]:
    for l2reg in [.0001,.01,.1,2.]:
        K_train = RBF_kernel(X1=x_train, X2=x_train, sigma=sigma)
        a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)

        k = functools.partial(RBF_kernel, sigma=sigma)
        train_error = calculate_percent_error(x_train, x_train, y_train, a, k)
        test_error = calculate_percent_error(x_test, x_train, y_test, a, k)
        print("RBF, NA, {}, NA, {}, {}, {}".format(l2reg, sigma, train_error, test_error))
```

### Plotting the Best Models

Let's plot the results of the best models we found using hyperparamater tuning.

The following params were used for the plots below:
```python
# Plot best Linear function
k = functools.partial(linear_kernel)
K_train = k(X1=x_train, X2=x_train)
a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)

# Plot best Polynomial function
l2reg=0.0001
k = functools.partial(polynomial_kernel, degree=2, offset=2)

K_train = k(X1=x_train, X2=x_train)
a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)

# Plot best Polynomial function
sigma=1
l2reg=0.0001
k = functools.partial(RBF_kernel, sigma=sigma)

K_train = k(X1=x_train, X2=x_train)
a = kernelized_pegasos(x_train, y_train, K_train, lamb=l2reg, epochs=10)
```

![TrainingData]({{ "/assets/Kernels/6_4_4_a.png" | absolute_url }}){:width="500px" .center-image}
![TrainingData]({{ "/assets/Kernels/6_4_4_b.png" | absolute_url }}){:width="500px" .center-image}
![TrainingData]({{ "/assets/Kernels/6_4_4_c.png" | absolute_url }}){:width="500px" .center-image}

## Conclusion
In the past few posts, we've learned a ton about Kernelizing understood machine learning algorithms, allowing them to work on non-linearly seperatable data. In this post, we built upon the foundational math of Kernels we learned before and applied it to Pegasos SVM. After deriving the pseudocode for Kernelized Pegasos, we then implemented it in Python with no ML libraries. Hopefully, you now can take what you've learned and understand what's going on when someone says they're applying the 'kernel trick' to some ML algorithm.