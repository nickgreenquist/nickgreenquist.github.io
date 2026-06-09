---
layout: post
title:  "Multiclass Classification with SVM"
date:   2020-09-30 09:05:14 -0500
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

Classification is one of the most important problems Machine Learning can solve. We have already seen in previous posts how SVM can solve a binary classification problem, that is, determining if data point belongs to one of two classes. We have also seen how to Kernelize SVM to perform non-linear classification. 

However, what if we have more than two possible classes that a data point can belong to? This is an extremely common real world scenario, and one that we have not solved yet.

In this post, we will re-derive the math of SVM to see how we can create a new loss function to handle multiple classes. 

We will then implement two multiclass calssifiers in Python. The first is a 'trick' where we repeatedly use a binary classifier to find the class with the highest score when compared against the score from all the other classes. Next, we will implement a true Multiclass SVM that will allow us to classify multiple classes of points as seen below:

![MulticlassSVMPlot]({{ "/assets/Multiclass/4-2-1.png" | absolute_url }}){:width="400px" .center-image}

## What is Multiclass
Consider the multiclass output space $Y= { 1,\ldots,k } $.

Suppose we have a base hypothesis space $H = { h: X \times Y\to R } $ from which we select a compatibility score function. Then our final multiclass hypothesis space is $F = { f(x) = argmax_{y\in Y} (h(x,y)\mid h\in H) } $.

Because functions in $F$ map into $Y$, our action space $A$ and output space $Y$ are the same.

It will help us to write our class-sensitive loss function as $\Delta: Y \times A\to R$, even though $Y = A$.

We do this to indicate that the true class goes in the first spot of the function, while the prediction (action) goes in the second spot. This is important because we do not assume that $\Delta(y,y')=\Delta(y',y)$. This asymmetry is useful in real life: for example, false alarms may be much less costly than no alarm in some real life system.

Using empirical risk minimization, we want to find $f \in F$ minimizing the empirical cost-sensitive loss:

$$ \begin{eqnarray}
\min_{f\in F}\sum_{i=1}^{n}\Delta\left(y_{i},f(x_{i})\right),
\end{eqnarray}
$$

Remember, this intractable because binary classification is intractable and that's simply a case of this formula. 

In this post we will derive a **tractable** objective function: multiclass SVM based on the convex multiclass hinge loss.

## The Math
Now let's derive the math and theory that we will need to code up multiclass SVM.

### Generalized Hinge Loss

Remember, the **margin** of the compatibility score function $h$ on the $i$th example $(x_{i},y_{i})$ for class $y$ as

$$ \begin{eqnarray}
m_{i,y}(h)=h(x_{i},y_{i})-h(x_{i},y).
\end{eqnarray}
$$

#### Multiclass SVM objective function
Loss on an individual example $\left(x_{i},y_{i}\right)$ is

$$ \begin{eqnarray}
\ell_{1}(h,(x_{i},y_{i}))=\max_{y\in Y-\left\{ y_{i}\right\} }\left(\max\left[0,\Delta(y_{i},y)-m_{i,y}(h)\right]\right).
\end{eqnarray}
$$

Another way to write this loss is below:

$$ \begin{eqnarray}
\ell_{2}(h,(x_{i,}y_{i}))=\max_{y\in Y}\left[\Delta\left(y_{i},y\right)+h(x_{i},y)-h(x_{i},y_{i})\right].
\end{eqnarray}
$$

### SGD for Multiclass Linear SVM

Output space and our Action space are:
$Y = A = { 1,\ldots, k } $.

Using a non-negative class-sensitive loss function $\Delta:Y \times A\to[0,\infty)$ and a class-sensitive feature mapping $\Psi:X\times Y\to R^{d}$, our prediction function $f:X\ to Y$ is given by

$$ \begin{eqnarray}
f_{w}(x)= argmax_{y\in Y} \left\langle w,\Psi(x,y)\right\rangle 
\end{eqnarray}
$$

For training data $(x_{1},y_{1}),\ldots,(x_{n},y_{n})\in X \times Y$, let $J(w)$ be the $\ell_{2}$-regularized empirical risk function for the multiclass hinge loss. We can write this as

$$ \begin{eqnarray}
J(w)=\lambda\|w\|^{2}+\frac{1}{n}\sum_{i=1}^{n}\max_{y\in Y}\left[\Delta\left(y_{i},y\right)+\left\langle w,\Psi(x_{i},y)-\Psi(x_{i},y_{i})\right\rangle \right],
\end{eqnarray}
$$

for some $\lambda>0$.

#### Proving $J(w)$ is a convex function of $w$

Note: If $f_{1},\ldots,f_{m}: R^{n}\to R$ are convex, then their pointwise maximum $f(x) = \max { f_{1}(x),\ldots,f_{m}(x) }$ is also convex.{]}

Because the poinwise maximum of m functions is convex if each function is convex, we need to show that the below is convex:

$$ \begin{eqnarray}
\left[\Delta\left(y_{i},y\right)+\left\langle w,\Psi(x_{i},y)-\Psi(x_{i},y_{i})\right\rangle \right]
\end{eqnarray}
$$

This is just the sum of a scalar and the prediction function of $w$ dotted with the difference of each feature map. We know that the below is a simple scalar so this is convex as it will be added with a linear function (w dotted with feature map) which makes it a simple affine function:

$$ \begin{eqnarray}
\Delta(y_i, y)
\end{eqnarray}
$$

Next, we show that the below is convex:

$$ \begin{eqnarray}
\left\langle w,\Psi(x_{i},y)-\Psi(x_{i},y_{i})\right\rangle
\end{eqnarray}
$$

This is nothing more than a standard dot product of a weight vector and another vector. If we substitute $z=\Psi(x_{i},y)-\Psi(x_{i},y_{i})$, then we have

$$ \begin{eqnarray}
w^Tz
\end{eqnarray}
$$

Which is trivially convex as its a linear function. When we add the target function to it ($\Delta(y_i, y)$), it becomes an affine function which is convex.

Finally, because the inside of the summation is convex, and from the convex optimization notes, a sum of non-negative weighted sums is convex. We can assume the entire statement inside the summation is convex (and inside the point wise max), and has a weight of 1 (making it match the notes).

Also, we have already proven before many times, that the below is convex because it is quadratic and $\lambda$ is always positive:

$$ \begin{eqnarray}
\lambda \|w\|^2
\end{eqnarray}
$$

And thus the sum of the convex summation and the above regularization term makes the entire statement convex. 

### Subgradiant of $J(w)$

Because $J(w)$ is convex, it has a subgradient at every point.

Let's find the subgradient of $J(w)$

Let's remember

$$ \begin{eqnarray}
\hat{y}_{i}= argmax_{y\in Y}\left[\Delta\left(y_{i},y\right)+\left\langle w,\Psi(x_{i},y)-\Psi(x_{i},y_{i})\right\rangle \right]
\end{eqnarray}
$$

Then the max expression simply turns into:

$$ \begin{eqnarray}
J(w)=\lambda\|w\|^{2}+\frac{1}{n}\sum_{i=1}^{n} [\Delta(y_{i},\hat{y}_i)+\langle w,\Psi(x_{i},\hat{y}_i)-\Psi(x_{i},y_{i})\rangle],
\end{eqnarray}
$$
And now we can get the subgradient with respect to $w$

$$ \begin{eqnarray}
g(w) = 2\lambda w + \frac{1}{n}\sum_{i=1}^{n} \Psi(x_{i},\hat{y}_i)-\Psi(x_{i},y_{i})
\end{eqnarray}
$$

#### Subgradient at a point
Stochastic subgradient based on the point $(x_{i},y_{i})$.

This is easy since we have computed the full subgradient. The stochastic subgradient is simply:

$$ \begin{eqnarray}
g(w) = 2\lambda w + \Psi(x_{i},\hat{y}_i)-\Psi(x_{i},y_{i})
\end{eqnarray}
$$

#### Minibatch subgradient
Let's find the minibatch subgradient, based on the points $(x_{i},y_{i}),\ldots,\left(x_{i+m-1},y_{i+m-1}\right)$.

Each point is now $x_j$, since we are ranging from $i$ to $i+m-1$

$$ \begin{eqnarray}
\hat{y}_{j}= argmax_{y\in Y}\left[\Delta\left(y_{j},y\right)+\left\langle w,\Psi(x_{j},y)-\Psi(x_{j},y_{j})\right\rangle \right]
\end{eqnarray}
$$

And we get this as the subgradient:

$$ \begin{eqnarray}
g(w) = 2\lambda w + \frac{1}{m}\sum_{j=i}^{i+m-1} \Psi(x_{j},\hat{y}_j)-\Psi(x_{j},y_{j})
\end{eqnarray}
$$

### Hinge Loss is a Case of Generalized Hinge Loss

Let $ Y = { -1,1 } $.
Let $\Delta(y,\hat{y}) = 1(y\neq\hat{y}).$

If $g(x)$ is the score function in our binary classification setting, then we can define our compatibility function as 

$$ \begin{eqnarray}
h(x,1) & = & g(x)/2\\
h(x,-1) & = & -g(x)/2.
\end{eqnarray}
$$

Let's show that for this choice of $h$, the multiclass hinge loss reduces to hinge loss: 

$$ \begin{eqnarray}
\ell\left(h,\left(x,y\right)\right)=\max_{y'\in Y}\left[\Delta\left(y,y')\right)+h(x,y')-h(x,y)\right]=\max\left\{ 0,1-yg(x)\right\} 
\end{eqnarray}
$$

First, let's rewrite the $h(x,1/-1)$ as a single expression

$$ \begin{eqnarray}
h(x,y) = yg(x)/2
\end{eqnarray}
$$

We also have:

$$ \begin{eqnarray}
\Delta(y,\hat{y}) = 1(y\neq\hat{y})
\end{eqnarray}
$$

Next, we plug both into the loss function:

$$ \begin{eqnarray}
\ell(h,(x,y))=\max_{y'\in Y}[1(y\neq\hat{y}) + \frac{y'g(x)}{2} - \frac{yg(x)}{2} ]
\end{eqnarray}
$$

Next, we have two cases to consider (depending on what value $y'$ takes on).

First, if $y' = y$, then the loss function becomes:

$$ \begin{eqnarray}
\ell(h,(x,y)) = 0 + \frac{y'g(x)}{2} - \frac{y'g(x)}{2}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\ell(h,(x,y)) = 0 + 0 = 0
\end{eqnarray}
$$

The next case is if $y'\neq y$, then:

$$ \begin{eqnarray}
\frac{y'g(x)}{2} = -\frac{yg(x)}{2}
\end{eqnarray}
$$

And the loss becomes:

$$ \begin{eqnarray}
\ell(h,(x,y)) = 1 - \frac{yg(x)}{2} - \frac{yg(x)}{2}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\ell(h,(x,y)) = 1 - \frac{2yg(x)}{2}
\end{eqnarray}
$$

$$ \begin{eqnarray}
\ell(h,(x,y)) = 1 - yg(x)
\end{eqnarray}
$$

And, combining these two cases, we get the following:

$$ \begin{eqnarray}
\ell(h,(x,y)) = \max\left\{ 0,1-yg(x)\right\}
\end{eqnarray}
$$

## Code

Let's take what we've derived and turn it into Pyhon code. We will first implement a simple OneVsAll Classifier, which uses a binary classifier multiple times to find class has the highest score when scored against every other class. Next, we will implement a true multiclass classifier.

### One-vs-All

Let's implement one-vs-all multiclass classification. We will assume we have a binary base classifier that returns
a score, and we will predict the class that has the highest score. 

```python
class OneVsAllClassifier(BaseEstimator, ClassifierMixin):  
    """
    One-vs-all classifier
    Classes will be the integers 0,..,(n_classes-1).
    Estimator provided to the class, after fitting, has a "decision_function" that 
    returns the score for the positive class.
    """
    def __init__(self, estimator, n_classes):      
        """
        Constructed with the number of classes and an estimator (e.g. an
        SVM estimator from sklearn)
        """
        self.n_classes = n_classes 
        self.estimators = [clone(estimator) for _ in range(n_classes)]
        self.fitted = False

    def fit(self, X, y=None):
        """
        This should fit one classifier for each class.
        self.estimators[i] should be fit on class i vs rest
        """
        # Get unique values of y (should be n_classes of them)
        for i in range(self.n_classes):
            # make copy of y turning whatever isnt label into rest
            y_new = y.copy()
            for j in range(y.shape[0]):
                if y_new[j] == i:
                    y_new[j] = 1
                else:
                    y_new[j] = -1
            self.estimators[i].fit(X, y_new)
        
        self.fitted = True  
        return self   

    def decision_function(self, X):
        """
        Returns the score of each input for each class. Assumes
        that the given estimator also implements the decision_function method (which sklearn SVMs do), 
        and that fit has been called.
        """
        if not self.fitted:
            raise RuntimeError("You must train classifer before predicting data.")

        if not hasattr(self.estimators[0], "decision_function"):
            raise AttributeError(
                "Base estimator doesn't have a decision_function attribute.")
        
        out = []
        for e in self.estimators:
            out.append(e.decision_function(X))
        out = np.array(out)
        return out.T
        
    
    def predict(self, X):
        """
        Predict the class with the highest score.
        """
        decisions = self.decision_function(X)
        predictions = np.argmax(decisions, axis=1)
        return predictions
```

Output of Test Code:
```python
Coeffs 0
[[-1.05854029 -0.90295741]]
Coeffs 1
[[-0.35839792  0.06279782]]
Coeffs 2
[[ 0.89164467 -0.82601233]]

array([[100,   0,   0],
       [  0, 100,   0],
       [  0,   0, 100]], dtype=int64)
```

Plots:
![OneVsAll]({{ "/assets/Multiclass/4-1-1.png" | absolute_url }}){:width="400px" .center-image}

### Multiclass SVM

Let's implement stochastic subgradient descent for the linear multiclass SVM, as described in this post above.

```python
def zeroOne(y,a) :
    '''
    Computes the zero-one loss.
    '''
    return int(y != a)

def featureMap(X,y,num_classes) :
    '''
    Computes the class-sensitive features.
    '''
    #The following line handles X being a 1d-array or a 2d-array
    num_samples, num_inFeatures = (1,X.shape[0]) if len(X.shape) == 1 else (X.shape[0],X.shape[1])
    num_outFeatures = num_inFeatures * num_classes
    
    out = []
    if num_samples > 1:
        for i in range(num_samples):
            point = X[i]
            out_row = np.zeros(num_outFeatures)
            
            j = y * num_inFeatures
            for k in range(num_inFeatures):
                out_row[j + k] = point[k]
            out.append(out_row)
    else:
        j = int(y * num_inFeatures)
        out = np.zeros(num_outFeatures)
        for k in range(num_inFeatures):
            out[j+k] = X[k]
        
    out = np.array(out)
    return out

def sgd(X, y, num_outFeatures, subgd, eta = 0.1, T = 10000):
    '''
    Runs subgradient descent, and outputs resulting parameter vector.
    '''
    num_samples = X.shape[0]
    #your code goes here and replaces following return statement
    
    w_hist = np.zeros((T, num_outFeatures))
    w = np.zeros(num_outFeatures)
    for t in range(T):
        i = randint(0, num_samples-1)
        Xi = X[i]
        yi = y[i]
        
        g = subgd(Xi, yi, w)
        w = w - eta*g
        
        w_hist[t] = w
    
    # Using running average for w as found in SSBD book as cited in the HW PDF
    w_out = np.zeros(num_outFeatures)
    for t in range(T):
        w_out += w_hist[t]
    return (1/T)*w_out

class MulticlassSVM(BaseEstimator, ClassifierMixin):
    '''
    Implements a Multiclass SVM estimator.
    '''
    def __init__(self, num_outFeatures, lam=1.0, num_classes=3, Delta=zeroOne, Psi=featureMap):       
        '''
        Creates a MulticlassSVM estimator.
        '''
        self.num_outFeatures = num_outFeatures
        self.lam = lam
        self.num_classes = num_classes
        self.Delta = Delta
        self.Psi = lambda X,y : Psi(X,y,num_classes)
        self.fitted = False
    
    def subgradient(self,x,y,w):
        '''
        Computes the subgradient at a given data point x,y
        '''
        y_hat = -1
        max_cost = float('-inf')
        for y_prime in range(self.num_classes):
            target = self.Delta(y_prime, y)
            cost = target + w @ (self.Psi(x, y_prime) - self.Psi(x, y))
            if cost > max_cost:
                max_cost = cost
                y_hat = y_prime
        return (2*self.lam*w) + self.Psi(x, y_hat) - self.Psi(x, y)
        
    def fit(self,X,y,eta=0.1,T=10000):
        '''
        Fits multiclass SVM
        '''
        self.coef_ = sgd(X,y,self.num_outFeatures,self.subgradient,eta,T)
        self.fitted = True
        return self
    
    def decision_function(self, X):
        '''
        Returns the score on each input for each class. Assumes
        that fit has been called.
        '''
        if not self.fitted:
            raise RuntimeError("Train classifer first.")

        out = []
        for y_prime in range(self.num_classes):
            score = (self.Psi(X, y_prime)) @ self.coef_
            out.append(score)
        out = np.array(out)
        return out.T
            
    def predict(self, X):
        '''
        Predict the class with the highest score.
        '''

        decisions = self.decision_function(X)
        predictions = np.argmax(decisions, axis=1)
        return predictions
        
#the following code tests the MulticlassSVM and sgd
est = MulticlassSVM(6,lam=1)
est.fit(X,y)
print("w:")
print(est.coef_)
Z = est.predict(mesh_input)
Z = Z.reshape(xx.shape)
plt.contourf(xx, yy, Z, cmap=plt.cm.coolwarm, alpha=0.8)

# Plot also the training points
plt.scatter(X[:, 0], X[:, 1], c=y, cmap=plt.cm.coolwarm)


from sklearn import metrics
metrics.confusion_matrix(y, est.predict(X))
```

Output of Test Code:
```python
w:
[-0.29643906 -0.05206736  0.00246857  0.10802812  0.29397049 -0.05596075]

array([[100,   0,   0],
       [  0, 100,   0],
       [  0,   0, 100]], dtype=int64)
```

Plots:
![MulticlassSVMPlot]({{ "/assets/Multiclass/4-2-1.png" | absolute_url }}){:width="400px" .center-image}

NOTE: I used a running average of $w$ instead of simply returning the last updated $w$. Psuedocode is below:
![Pseudocode]({{ "/assets/Multiclass/4-2.PNG" | absolute_url }}){:width="800px" .center-image}

## Conclusion

In this post, we derived the math necessary to use Hinge Loss for multiple classes and then derived Multiclass SVM. We then implemented OneVsAll and Multiclass SVM in Python and saw how they split toy data with 3 classes. 

In a later post, I will show you two other multiclass classifiers that are arguably more popular in the real world: Decision Trees and Gradient Boosting Machines. 

Stay tuned!
 