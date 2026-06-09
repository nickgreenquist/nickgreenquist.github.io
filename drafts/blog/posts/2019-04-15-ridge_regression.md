---
layout: post
title:  "Linear Regression with L2 Regularization: Ridge Regression"
date:   2019-04-15 09:05:14 -0500
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
Welcome back to another fun filled blog post on machine learning! Following this post on [Gradient Descent for Linear Regression](https://nickgreenquist.github.io/blog/datascience/2019/04/13/gradient_descent.html), we will now discuss how to add Regularization to our model to prevent a nasty side effect of simple machine learning models: overfitting to your training data.

### Overfitting
Image Source: [Medium](https://medium.com/greyatom/what-is-underfitting-and-overfitting-in-machine-learning-and-how-to-deal-with-it-6803a989c76)
![Overfitting]({{ "/assets/RidgeRegression/overfitting.png" | absolute_url }}){:width="800px" .center-image}

Overfitting occurs when your model optimizes *too well* on its training data, thus making it useless on new, unseen data. If we look at the image above, the rightmost image shows what happens when model simply 'memorizes' the data it's been given to train on. While the true prediction function is what is in the middle, the model on the right 'overfit' to the training data. As you could expect, if we gave a new data point to the model on the right, it would probably give us a wildly incorrect output for that point. 

### What is Regularization
Our goal is to train a model that looks like the one in the middle. How can we prevent our model from overfitting to the training data? Isn't that what Gradient Descent is all about anyways!? We created a loss function that explicitly rewards overfitting or memorizing the training data. So, how can fix this? One extremely common (and simple to apply) tool is **regularization**. 

Regularization has been explained about 50000 times already in many blog posts. Here is a great one: [Medium](https://towardsdatascience.com/l1-and-l2-regularization-methods-ce25e7fc831c). 

In about one sentence, regularization (specifially L2 regularization in this case), penalizes the model's **complexity** by adding a penalty (regularization) term to the loss function that is used for optimizing $\theta$. 

There are many ways to 'penalize complexity', but one of the most common ways is to simply add loss for how large the values in $\theta$ are. For example, by adding loss for the absolute sum of all values in $\theta$, your training algorithm will be pushed to look for $\theta$'s with small (and thus simpler) values. Using the absolute sum of values in $\theta$ is called L1 Regularization. This is a perfectly valid method for regularization but is a little harder to deal with because the absolute value function is not differentiable and thus our normal Gradient Descent approach would need serious rework. Instead, we will be using the much simpler, and arguably more common L2 regularization approach, which penalizes for the sum of squares of values in $\theta$ (and is easy to take the derivative of!).

Here is in math how this penalty ($\Omega$) would look like:

$$ \begin{eqnarray}
\Omega(\theta) = \theta^T\theta
\end{eqnarray}
$$

However, we want to be able to control HOW MUCH we penalize using the squared sum of values in $\theta$, so we add a weight term called $\lambda$ which is like a lever that controls how much we want our loss function to be dictated by the complexity of our model versus how well it's doing predicting the output values of the training data:

$$ \begin{eqnarray}
\Omega(\theta) = \lambda\theta^T\theta
\end{eqnarray}
$$

Now, that we have a formal math definition of how we define a penalty for the complexity of our model, let's add it to our loss function!

### Ridge Regression
Oh yeah, I almost to forgot to mention. **Ridge Regression** is simply good old Linear Regression with L2 Regularization. Now you know a great buzz word to throw around to impress people. 

Instead of saying:

**'Yeah all I really did was add $\lambda\theta^T\theta$ to the loss function, it was less than one line of code'**

you need to start talking like a true buzz-word slinging Machine Learning Master and say:

**'I implemented Ridge Regression in order to penalize the complexity of my optimized $\theta$ vector and thus achieve better generalization on out of sample data'**

## Regularized Objective Function
Remember our old loss function, the ```average square loss```:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{n}\sum_{i=1}^{n}\left(h_{\theta}(x_{i})-y_{i}\right)^{2},
\end{eqnarray}
$$

We are now going to add a penalty (regularization) term to add more loss the bigger the values in $\theta$ become. The Objective Function is the old Loss Function with Regularization Penalty. 

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\sum_{i=1}^{m}\left(h_{\theta}(x_{i})-y_{i}\right)^{2}+\lambda\theta^{T}\theta,
\end{eqnarray}
$$

$\lambda\theta^{T}\theta$ is the only term we have added to our original loss function

NOTE: We don't use the Objective Function to compute the loss on a validation or test set. We use the objective function only to train $\theta$ and prevent overfitting.  This is because once we start evaluating how our model is doing on new data (like once it's released to production), we don't actually care what the values of $\theta$ are. We only care about the complexity of $\theta$ **when training**.

### Gradient of the Objective Function
Let's take the gradient of this Objective Function:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m}\sum_{i=1}^{m}\left(h_{\theta}(x_{i})-y_{i}\right)^{2}+\lambda\theta^{T}\theta,
\end{eqnarray}
$$

First, let's Vectorize is so we can compute the gradient using all of the training points:

$$ \begin{eqnarray}
J(\theta)=\frac{1}{m} \|X\theta - y\|_2^2 + \lambda\theta^{T}\theta
\end{eqnarray}
$$

The expression inside the $\|X\theta - y\|_2^2$ of the Objective Function when taking the derivative becomes the same as the non-regularized case. All that is different here is the derivative of the regularizing expression which is tacked on to the end. 

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta) =\Delta_{\theta}[\frac{1}{m} \|X\theta - y\|_2^2 + \lambda\theta^{T}\theta]
\end{eqnarray}
$$

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)=\frac{2}{m}(X^{T}X\theta - X^{T}y) + 2\lambda\theta
\end{eqnarray}
$$

We can take the $X^{T}$ out to simplify

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)=\frac{2}{m}X^{T}(X\theta - y) + 2\lambda\theta
\end{eqnarray}
$$

## Math -> Code
Now that we have our Objective Function and its Gradient, all we have left to do is code up all the parts of Ridge Regression!

### Square Loss Function
Our loss function for Ridge Regression is the same as for un-regularized Linear Regression. This is because the Objective Function (which has the regularization penalty) is only used for training (optimizing $\theta$). To see how we are actually doing prediction wise, we only want to see our error on how far off we are and don't care about how large the values of $\theta$ are. 

Remember, here is our normal vectorized square loss function:
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

### Objective Function Gradient
Next, we will create a function that compuates the Gradient vector at a given time step. We are going to conver this equation:

$$ \begin{eqnarray}
\Delta_{\theta}J(\theta)=\frac{2}{m}X^{T}(X\theta - y) + 2\lambda\theta
\end{eqnarray}$$

into Python code:

```python
def regularized_square_loss_gradient(X, y, theta, lambda_reg):
    m = X.shape[0]
    
    grad = 2/m * X.T.dot(X.dot(theta) - y) + 2.0*lambda_reg*theta
    
    return grad
```

## Regularized Gradient Descent
We are now ready to create a function that takes in the training data, the training actual values, $y$, a learning rate (how much to move in the direction of a gradient each iteration of Regularized Gradient Descent), and the number of iterations to train for. 
We also will save the value of $\theta$ at each iteration and the loss (computed with $J(\theta)$ defined earlier) so we can plot them with respect to iterations. 

```python
def regularized_grad_descent(X, y, lambda_reg=10**-2, learning_rate=0.05, iterations=1000):
    num_instances, num_features = X.shape[0], X.shape[1]
    theta = np.zeros(num_features) #Initialize theta
    theta_hist = np.zeros((iterations+1, num_features)) #Initialize theta_hist
    loss_hist = np.zeros(iterations+1) #Initialize loss_hist
    
    # add init loss and theta to history
    loss_hist[0] = compute_square_loss(X, y, theta)
    theta_hist[0] = theta[:]
    
    for i in range(1, iterations+1):
        # perform update
        theta = theta - (learning_rate)*regularized_square_loss_gradient(X, y, theta, lambda_reg)
        
        theta_hist[i] = theta[:]

        # NOTE: We use the normal square loss function to compute the loss, NOT the Objective Function
        loss_hist[i] = compute_square_loss(X, y, theta)
    
    return theta_hist, loss_hist
```

We are ready to feed some data into this function and do some regularized 'machine' learning!
s
### Finding Optimal Lambda: Hyperparameter Search
Before we start training a model, we need to search for a good value for $\lambda$. As we saw in my last post, [Gradient Descent for Linear Regression](https://nickgreenquist.github.io/blog/datascience/2019/04/13/gradient_descent.html), we had another tunable parameter: the learning rate. Now, we add a second one, $\lambda$. A Hyperparameter is any parameter in a machine learning algorithm that isn't automatically updated from our optimization (like Gradient Descent), and thus both the learning rate and $\lambda$ would be hyperparameters. 

Below is some code and plots to search for a good value of $\lambda$. Note, we compute the loss on the TEST data and not the training data. This is because if we looked for a good value for $\lambda$ on the same data we are training with, the model will WANT TO OVERFIT and the optimal value of our regularization (penalty) parameter $\lambda$ will be 0. 

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
    
    # Run Regularized Gradient Descent with different lambdas
    # NOTE: We are using the best learning_rate (alpha) that we found from normal Gradient Descent
    train_losses = []
    test_losses = []
    lambdas = [5.0e-3, 8.0e-3, 1.0e-2, 1.5e-2, 2.0e-2]
    alpha = 1.5e-2 # found using search
    for lamb in lambdas:
        theta_hist, loss_hist = regularized_grad_descent(X_train, y_train, lambda_reg=lamb, alpha=alpha)
        
        # use final theta to compute losses on train and test data
        final_theta = theta_hist[-1]
        train_losses.append( compute_square_loss(X_train, y_train, final_theta) )
        test_losses.append( compute_square_loss(X_test, y_test, final_theta) )
        
    plt.xlabel('lambda')
    plt.ylabel('average square loss')
    plt.title('RidgeRegression average square loss for Train data')
    plt.plot(lambdas, train_losses)
    plt.show()
    
    plt.xlabel('lambda')
    plt.ylabel('average square loss')
    plt.title('RidgeRegression average square loss for Test data')
    plt.plot(lambdas, test_losses)
    plt.show()
```

Below is the loss on the training data as we change $\lambda$. Notice how the loss is telling us to make $\lambda$ closer and closer to 0 to get the best loss on the training data. This makes sense because the model simply wants to overfit on what data it's already seen and pretty much 'memorize' the data with no annoying penalty term telling it to not overfit!
![Plot1]({{ "/assets/RidgeRegression/3_5_7_3.png" | absolute_url }}){:width="300px" .center-image}

However, things are very different when compute the loss on the UNSEEN test data. Look how the loss actually starts to shoot up as $\lambda$ is dropped closer to 0! This is what we are looking for. Also, notice that too much regularization can actually hurt our model on predicting unseen data. So this is why searching for the best $\lambda$ is essential when adding regularization to your Objective Function.
![Plot2]({{ "/assets/RidgeRegression/3_5_7_4.png" | absolute_url }}){:width="300px" .center-image}

We can conclude that the best value for $\lambda$ is .015. 

If we were to deploy a model to production and let it try and predict on new and unseen data, we would want to train that model with $\lambda=0.015$ as it had the best performance on our test data and thus 'generalized' the best. 

## Conclusion
In this post, we learned what overfitting is, how to avoid it with Regularization, what L2 regularization is in math, and then how to add it to your Gradient Descent in Python code. 

The key takeaways is that regularization should really always be used as almost all models have a tendency to want to overfit if they are simply optimizing on training data inside the loss function. 

Another takeaway is that we can control how much we penalize our model for its complexity with a new Hyperparameter, $\lambda$. As with the learning rate for standard gradient descent, a good value for $\lambda$ also has to be searched for by hand (and always on data that has not been used to train with!!!).
