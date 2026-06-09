---
layout: post
title:  "Gradient Descent for Linear Regression: Step by Step"
date:   2019-04-13 09:05:14 -0500
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
Gradient Descent is one of the most important algorithms to deeply understand if you are interested in Machine Learning. Almost all training of machine learning models (the actual 'learning' part) is done using Gradient Descent or it's subsets (Stochastic Gradient Descent, Minibatch Gradient Descent, etc). There is a fair amount of math involved with understanding what is going, but with some Linear Algebra and Matrix Calculus basics, you can get through it. This post will explain how to implement Gradient Descent for Linear Regression from scratch, all the way from the equations to the code.

## Linear Regression
In linear regression, we use the hypothesis space of linear functions
$h(\theta):R^{d} \to R$ (function parameterized by d-dimensional vector and spits out a Real scalar value), where

$$ \begin{eqnarray}
h(\theta, x)=\theta^{T}x,
\end{eqnarray}
$$

for $\theta,x\in\ R^{d}$. What this means, in english, is that we want to find some function $h(\theta, x)$, that takes a $\theta$ vector of weights (this is what we want to optimize using Gradient Descent), and computes the dot product of itself and the input $x$ (and spits out one Real scalar value). $x$ is a training point that is a vector of that training point's 'features'. So, $\theta$ will be a vector that has one value for every feature that our inputs will have.

## Loss Function
In order to optimize $\theta$ with Gradient Descent, we need some loss function that tells us how well this $\theta$ is attempting to  predict the correct values for each input.

We will use the ```average square loss``` objective function: 

$$ \begin{eqnarray}
J(\theta)=\frac{1}{n}\sum_{i=1}^{n}\left(h_{\theta}(x_{i})-y_{i}\right)^{2},
\end{eqnarray}
$$

Our training data is: $(x_{1},y_{1}),\ldots,(x_{n},y_{n})\in R^{d}\times R$. This means we have $n$ training points, where each training point is a vector of $d$ dimensions, and each point corresponds to a 'correct' Real scalar value ($y_i$).
We will use this loss function to optimize $\theta$, or find a $\theta$ that gives the lowest value when passed into this loss funciton.

Usually in real life, it's more standard to use ```affine``` functions for our hypothesis space:

$$ \begin{eqnarray}
h(\theta, x, b)=\theta^{T}x+b,
\end{eqnarray}
$$

which allows us to have an intercept term (which really is essential for any decent linear regression model). If we don't use affine functions, we can only learn functions that pass through the origin, which is BAD. We can do a clever trick and can add an extra dimension to $x$ that is the fixed value of 1. Using this representation, we have $\theta,x\in R^{d+1}$. Now, we can use this extra feature as a 'bias' and train functions that aren't restricted to pass through the origin. 

### Vectorization
Now, we want to set up this problem in a way to use the ENTIRE training set, not just a single point and output at a time. We need to define the Design Matrix as $X\in R^{n\times\left(d+1\right)}$, where the $i$'th row of $X$ is $x_{i}$, or the $i$'th training point/example. Notice how we now have $d+1$ dimensions after the 'bias' trick. 
Let $y=\left(y_{1},\ldots,y_{n}\right)^{T}\in R^{n\times1}$
be the vector of the correct outputs of every training example.

Why are we doing this? Well, we want to write the loss funciton in 'vectorized' form, because our computers are often MUCH faster at computing matrix/vector operations in vectorized forms, as they can take advantage of SIMD (single instruction, multiple data) operations. What this means is that our CPUs are able to run the same operation on multiple pices of data (if you let it). Vectorizing your code allows the CPU to do this. 

Here is the vectorized loss function:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\|X\theta - y\|_2^2
\end{eqnarray}$$

Which is equivalent to the way we wrote it using summations (which would require loops in a programming language):
$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\sum_{i=1}^{m}\left(h_{\theta}(x_{i})-y_{i}\right)^{2},
\end{eqnarray}$$

## Gradient of the Loss Function
Next, we want to find the Gradient of this loss function. Doing so is essential to setting up a Gradient Descent procedure to 'learn' the best $\theta$. 

First, we should expand the loss function $J$ 

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\|X\theta - y\|_2^2,
\end{eqnarray}$$

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}(X\theta - y)^{T}(X\theta - y),
\end{eqnarray}$$

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}((X\theta)^{T}X\theta - y^{T}X\theta - (X\theta)^{T}y + y^{T}y),
\end{eqnarray}$$

Expanding further gives us:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m} (\theta^{T}X^{T}X\theta - y^{T}X\theta - \theta^{T}X^{T}y + y^{T}y)
\end{eqnarray}$$

We can combine the middle terms because they are both scalars

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m} (\theta^{T}X^{T}X\theta - 2\theta^{T}X^{T}y + y^{T}y)
\end{eqnarray}$$

Now take the gradient with respect to $\theta$ (if you don't know Matrix Calculus, you can _kinda_ do some of the same derivative tricks that you learn in Calc1 or Calc3, but there is some weird dimension/transpose stuff added in when dealing with vectors and matrices).

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)= \frac{1}{m} (2X^{T}X\theta - 2X^{T}y)
\end{eqnarray}$$

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)= \frac{2}{m} (X^{T}X\theta - X^{T}y)
\end{eqnarray}$$

### Gradient Step
Next, let's create the expression for updating $\theta$ in the gradient descent
algorithm. We will use $\eta$ for step size (or how much to move in the direction the gradient is telling us).

$\theta_{T}$ is the value of $\theta$ at time $T$
$\theta_{T+1}$ is the value of $\theta$ at time $T+1$, or after one update

Therefore, using the gradient we computed above, we get:

$$ \begin{eqnarray}
    \theta_{T+1} = \theta_{T} - \eta(\Delta J(\theta))
\end{eqnarray}$$

## Math -> Code
Congrats! If you made it this far, all we have left to do is code up all the parts of Gradient Descent!

### Square Loss Function
First, we need to create a function to compute how well we are doing at any given time step. Here is the code for the Vectorized Square Loss Function defined earlier:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\|X\theta - y\|_2^2
\end{eqnarray}$$

```python
def compute_square_loss(X, y, theta):
    loss = 0 #Initialize the average square loss
    
    m = len(y)
    loss = (1.0/m)*(np.linalg.norm((X.dot(theta) - y), 2) ** 2)
    return loss
```

### Square Loss Gradient
Next, we will create a function that compuates the Gradient vector at a given time step. This is another 'math->code' translation of this equation we defined to compute the Gradient:

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)= \frac{2}{m} (X^{T}X\theta - X^{T}y)
\end{eqnarray}$$

NOTE: I simplified the above expression with some simple Matrix Algebra by brining out the $X^T$ from the inside of the parantheses

```python
def compute_square_loss_gradient(X, y, theta):
    m = X.shape[0]
    
    grad = 2/m * X.T.dot(X.dot(theta) - y)
    
    return grad
```

### Gradient Checker
Something that is very common to do is verify the function you used to compute the gradient of a loss funciton is to code up something called a 'gradient checker'. If we can differentiate our loss function, then for any vector $v\in R^{d}$, the directional derivative
of $J$ at $\theta$ in the direction $v$ is:

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta) = \lim_{\epsilon \to0}\frac{J(\theta+\epsilon v)-J(\theta-\epsilon v)}{2\epsilon}.
\end{eqnarray}$$

If we choose a very small $\epsilon >0$, we can use the above statement to estimate the true gradient and compare it to what we get from our ```compute_square_loss_gradient``` function.

Here is the code for a Gradient Checker for the Square Loss Function. Notice how it checks to see if both approaches produce gradients that are basically equal (up to some threshold):

```python
def gradient_checker(X, y, theta, tolerance=1e-4, epsilon=0.01):
    true_gradient = compute_square_loss_gradient(X, y, theta) #The true gradient
    num_features = theta.shape[0]
    approx_grad = np.zeros(num_features) #Initialize the gradient we approximate
    
    I = np.identity(num_features)
    
    for i in range(num_features):
        approx_grad[i] = compute_square_loss(X, y, theta + (epsilon * I[i].T)) - compute_square_loss(X, y, theta - (epsilon * I[i].T))
        approx_grad[i] /= (2 * epsilon)
    
    dist = np.linalg.norm(approx_grad - true_gradient)
    
    print("distance of %s is below tolerance of %s? %s" % (str(dist), str(tolerance), str(dist < tolerance)))
```

## Gradient Descent: Putting it all Together
We are now ready to create a function that takes in the training data, the training actual values, $y$, a learning rate (how much to move in the direction of a gradient each iteration of Gradient Descent), and the number of iterations to train for. 
We also will save the value of $\theta$ at each iteration and the loss (computed with $J(\theta)$ defined earlier) so we can plot them with respect to iterations. 

```python
def batch_grad_descent(X, y, alpha=0.01, iterations=1000):
    num_instances, num_features = X.shape[0], X.shape[1]
    theta_hist = np.zeros((iterations+1, num_features)) #Initialize theta_hist
    loss_hist = np.zeros(iterations+1) #Initialize loss_hist
    theta = np.zeros(num_features) #Initialize theta
    
    # add init loss and theta to history
    loss_hist[0] = compute_square_loss(X, y, theta)
    theta_hist[0] = theta[:]
    
    for i in range(1, iterations+1):
        # perform update
        theta = theta - (alpha)*compute_square_loss_gradient(X, y, theta)
        
        theta_hist[i] = theta[:]
        loss_hist[i] = compute_square_loss(X, y, theta)
    
    return theta_hist, loss_hist
```

We are ready to feed some data into this function and do some 'machine' learning!

### Plots
Here we will actually run the the ```batch_grad_descent``` function on some data and see how it's doing. Here is some code to load in and prepare the data. We are not focusing on what this code is doing unfortunately, but the comments and function names should help you get an idea of some of the data preparation that is going on. 

```python
def main():
    #Loading the dataset in Pandas DataFrame
    df = pd.read_csv('data.csv', delimiter=',')
    X = df.values[:,:-1]
    y = df.values[:,-1]

    # Split into Train and Test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size =100)

    # Scaling all features to [0, 1] and adding bias term
    X_train, X_test = feature_normalization(X_train, X_test)
    X_train = np.hstack((X_train, np.ones((X_train.shape[0], 1))))  # Add bias term
    X_test = np.hstack((X_test, np.ones((X_test.shape[0], 1))))  # Add bias term
    
    # Run Gradient Descent with different learning rates
    for alpha in [5.0e-2, 1.5e-2, 1.0e-2]:
        theta_hist, loss_hist = batch_grad_descent(X_train, y_train, alpha=alpha)
        
        plt.xlabel('iterations')
        plt.ylabel('average square loss')
        plt.title('Gradient Descent with alpha=%s' % str(alpha))
        plt.plot([i for i in range(1001)], loss_hist)
        plt.show()
```

This produced the following graphs that show how 'quickly' Gradient Descent is learning the best $\theta$ with respect to the learning rate. Be careful though, if the learning rate is too high, the algorithm can fail to learn and actually diverge (see last plot). 

![Plot1]({{ "/assets/GradientDescent/3_4_2_3.png" | absolute_url }}){:width="300px" .center-image}

![Plot2]({{ "/assets/GradientDescent/3_4_2_4.png" | absolute_url }}){:width="300px" .center-image}

![Plot3]({{ "/assets/GradientDescent/3_4_2_5.png" | absolute_url }}){:width="300px" .center-image}

![Plot4]({{ "/assets/GradientDescent/3_4_2_2.png" | absolute_url }}){:width="300px" .center-image}

You can actually see from these plots that the learning rate is very important to learning. If it's too high, it can blow up the funciton and the loss can explode. If it's too low (like in the third plot), the function learns too slowly and you should probably restart with a higher learning rate. 

## Conclusion
Congrats! You just learned how Gradient Descent works from scratch, all the way from writing out what's going on in the equations using Linear Algebra and Matrix Calculus, to translating those scary equations to simple Python code. 

This post barely scratched the surface of what Machine Learning has to offer. An example of what more can be done following this post is:
1. Visualize your data and plot the final prediction function
2. Add regularization to the loss function
  * Study different types of regulariztion (L1, L2, Elastic Net, etc)
3. Use Stochastic Gradient Descent instead of Batch Gradient Descent
  * we used Batch Gradient Descent and it means using the full dataset to compute the gradient at each iteration
  * SGD only uses one training point at each iteration to compute the gradient
4. Use a different loss function
5. Find a classification problem instead of Linear Regression
6. Perform feature engineering to allow Linear models to behave non-linearly
7. Use non-linear models (Decision Trees, Neural Networks, etc)
8. And much much more!