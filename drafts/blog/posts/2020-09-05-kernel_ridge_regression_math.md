---
layout: post
title:  "Kernelized Ridge Regression Part I: The Math"
date:   2020-09-05 09:05:14 -0500
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
In one of my past posts, we learned and derived [Ridge Regression](https://nickgreenquist.github.io/blog/datascience/2019/04/15/ridge_regression.html). Ridge Regression is super powerful, but has one major issue that makes not so great for real world problems: it's a linear model. 

How can we use a model like Ridge Regression to fit a model on the **non-linear data** below?

![KernelMapping]({{ "/assets/Kernels/mapping.png" | absolute_url }}){:width="500px" .center-image}

We can use something you might have heard about before: apply the **kernel trick**. 

The TLDR of the Kernel Trick is that we are taking the inputs and mapping them to a higher dimensional space. This allows us to use a simpler model (ie Ridge Regression) to fit the now mapped non-linear data. Think about this for a second... we can use simple, linear models, to perform regression or classification on non-linear data. That is **super powerful**!

A great article on the Kernel Trick can be found: [here](https://medium.com/@zxr.nju/what-is-the-kernel-trick-why-is-it-important-98a98db0961d).

scikit-learn actually has an official [implementation of Kernelized Ridge Regression](https://scikit-learn.org/stable/modules/kernel_ridge.html#:~:text=Kernel%20ridge%20regression%20(KRR)%20%5B,respective%20kernel%20and%20the%20data.). 

In this post, we are going to derive and prove a lot of the math for Kernelized Ridge Regression and then learn how to code it from scratch in Pyhon.

## Representer Theorem

In order to 'Kernelize' our objective function in Ridge Regression, we need to prove a very important theorem.

The representer theorem tells us that the solutions to some regularization functionals in high or infinite dimensional spaces lie in finite dimensional subspaces **spanned by the data**.

This basically means that we can reduce infeasbile problems in massively high dimensional space to only the space **spanned by the data**.

### The Theorem

$$ \begin{eqnarray}
J(w)=R\left(\|w\|\right)+L\left(\left\langle w,\psi(x_{1})\right\rangle ,\ldots,\left\langle w,\psi(x_{n})\right\rangle \right),
\end{eqnarray}
$$

where $R:R^{\ge0}\to R$ is nondecreasing (the **regularization** term) and $L: R^{n}\to R$ is the **loss term**.

If $J(w)$ has a minimizer, then it has a minimizer in this **special form**

$$ \begin{eqnarray}
w^{*}=\sum_{i=1}^{n}\alpha_{i}\psi(x_{i}).
\end{eqnarray} $$

If $R$ is strictly increasing, then **all minimizers have this form.**

### The Proof
Let $M$ be a closed subspace of a Hilbert space $H$. For any $x\in H$, let $m_{0}=P_{M}x$ be the projection of $x$ onto $M$.

By the **Projection Theorem**, we know that $(x-m_{0})\perp M$.

By the **Pythagorean Theorem**, we know $\|x\|^{2}=\|m_{0}\|^{2}+\|x-m_{0}\|^{2}$.

We can use that to conclude: $\|m_{0}\|\le\|x\|$.


#### Let's prove that we have $\|m_{0}\|=\|x\|$ only when $m_{0}=x$.

Note: postive-definiteness of the inner product: $\left\langle x,x\right\rangle \ge0$ and $\left\langle x,x\right\rangle =0\iff x=0$

Also, remember we are using a norm derived from such an inner product.

$$ \begin{eqnarray}
\|x\|^{2}=\|m_{0}\|^{2}+\|x-m_{0}\|^{2}
\end{eqnarray} $$

$$ \begin{eqnarray}
\|m_{0}\|^{2}=\|x\|^{2} - \|x-m_{0}\|^{2}
\end{eqnarray} $$
We know that:

$$ \begin{eqnarray}
\|m_{0}\|\le\|x\|
\end{eqnarray} $$
So

$$ \begin{eqnarray}
\|m_{0}\|^{2} \le \|x\|^{2}
\end{eqnarray} $$
This means this MUST be 0

$$ \begin{eqnarray}
\|x-m_{0}\|^{2} = 0
\end{eqnarray} $$
By using the definition of the norm

$$ \begin{eqnarray}
\left\langle x,x\right\rangle =0\iff x=0
\end{eqnarray} $$

$$ \begin{eqnarray}
\|x\|^2 =0\iff x=0
\end{eqnarray} $$

$$ \begin{eqnarray}
\|x-m_{0}\|^2 =0\iff x-m_{0} = 0
\end{eqnarray} $$

$$ \begin{eqnarray}
x-m_{0} = 0
\end{eqnarray} $$
This following expression must be true:

$$ \begin{eqnarray}
x = m_{0}
\end{eqnarray} $$

#### Prove that if $R$ is strictly increasing, then all minimizers have this form. 

1. Project w onto the subspace

$$ \begin{eqnarray}
span(\psi(x_i): i=1...n)
\end{eqnarray} $$
2. Obtain $w_s$ which is the component along the subspace

3. Obtain $w_{\perp}$ which is the component perpendicual to the subspace

4. 

$$ \begin{eqnarray}
w = w_s + w_{\perp} \implies \|w_s\|^2 + \|w_{\perp}\|^2 \ge \|w_s\|^2
\end{eqnarray} $$

5. Because R is non-decreasing:

$$ \begin{eqnarray}
R(\|w\|_H^2) \ge R(\|w_s\|_H^2)
\end{eqnarray} $$

$$ \begin{eqnarray}
R(\|w_s\|_H^2) \le R(\|w\|_H^2)
\end{eqnarray} $$
6. This implies R(...) is minimal if $w$ is in the subspace

7. Use the Kernel K reproducing property, we get:

$$ \begin{eqnarray}
\left\langle w, \phi(x_i) \right\rangle = \left\langle w_s, \phi(x_i) \right\rangle + \left\langle w_{\perp}, \phi(x_i) \right\rangle
\end{eqnarray} $$

$$ \begin{eqnarray}
\left\langle w, \phi(x_i)\right\rangle = \left\langle w_s, \phi(x_i)\right\rangle + 0
\end{eqnarray} $$

$$ \begin{eqnarray}
\left\langle w, \phi(x_i)\right\rangle = \left\langle w_s, \phi(x_i)\right\rangle
\end{eqnarray} $$

8. This implies:

$$ \begin{eqnarray}
L(\left\langle w, \phi(x_1)\right\rangle \dots \left\langle w, \phi(x_n)\right\rangle) = L\left\langle w_s, \phi(x_1)\right\rangle \dots \left\langle w_s, \phi(x_n)\right\rangle)
\end{eqnarray} $$

9. Therefore, L(...) depends ONLY on the component of $w$ lying on the supscape spanned by $\phi(x_i)$ for all i=1...n

10. If R(...) is strictly increasing, then 

$$ \begin{eqnarray}
\|w_{\perp}\| = 0
\end{eqnarray} $$

This means the minimizer lies on the span of the subspace of $\phi(x_i)$
If the minimizer is in the span of $\phi(x_i)$, it must have this form:

$$ \begin{eqnarray}
w^{*}=\sum_{i=1}^{n}\alpha_{i}\psi(x_{i})
\end{eqnarray} $$

This shows what we claimed in the theorem.

#### Proof by Contradiction
To be even more thorough, we can do a proof by contradiction:

Suppose $w^*$ is NOT in the span of the and therefore not in the form:

$$ \begin{eqnarray}
w^{*}=\sum_{i=1}^{n}\alpha_{i}\psi(x_{i})
\end{eqnarray} $$

This means:

$$ \begin{eqnarray}
\|w_{\perp}\| \not= 0
\end{eqnarray} $$

which means the value of R (being strictly increasing) must be strictly greater than the R on just the part of $w$ in the span of the data:

$$ \begin{eqnarray}
R(\|w\|_H^2) > R(\|w\|_H^2)
\end{eqnarray} $$

This contradicts that $w^*$ is optimal if $\|w_{\perp}\| \not= 0$. This means it must have the form:

$$ \begin{eqnarray}
w^{*}=\sum_{i=1}^{n}\alpha_{i}\psi(x_{i})
\end{eqnarray} $$

## Kernel Matrices
Before we can code up a Kernelized version of Ridge Regression, we need to understand the underlying math of Kernels and how they can be used in the objective functions we already know. 

Idea: in a linear model we can think about the similarity between two
training examples $x_1$ and $x_2$ as being $x_1^Tx_2$.

We can store all these similarities into a matrix which we can then use in our score functions. 

Let's see what information is encoded in the kernel matrix. 

Consider a set of vectors $S=\{x_{1},\ldots,x_{m}\}$.
Let $X$ denote the matrix whose rows are these vectors.

Let's create the **Gram matrix** $K=XX^{T}$.

Let's prove that knowing $K$ is equivalent to knowing
the set of pairwise distances among the vectors in $S$ as well as
the vector lengths.

Remember: The distance between $x$ and $y$ is given by $d(x,y)=\|x-y\|$, and the norm of a vector $x$ is defined as $\|x\|=$$\sqrt{\left\langle x,x\right\rangle }=\sqrt{x^{T}x}$.{]}

$$ \begin{eqnarray}
d(x,y)=\|x-y\|
\end{eqnarray}
$$

$$ \begin{eqnarray}
d(x_i,x_j)=\|x_i-x_j\|
\end{eqnarray}
$$

$$ \begin{eqnarray}
d(x_i,x_j)= \sqrt{(x_i - x_j)^T(x_i - x_j)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
d(x_i,x_j)= \sqrt{(x_i^T - x_j^T)(x_i - x_j)}
\end{eqnarray}
$$

$$ \begin{eqnarray}
d(x_i,x_j)= \sqrt{ x_i^Tx_i - 2x_i^Tx_j + x_j^Tx_j}
\end{eqnarray}
$$

Take the square of both sides

$$ \begin{eqnarray}
d(x_i,x_j)^2= x_i^Tx_i - 2x_i^Tx_j + x_j^Tx_j
\end{eqnarray}
$$

$$ \begin{eqnarray}
d(x_i,x_j)^2= \|x_i\|^2 - 2x_i^Tx_j + \|x_j\|^2
\end{eqnarray}
$$

Now, we want to get the element of K on one side to show that it is composed of the pairwise distance between each vector and also the vector lengths

$$ \begin{eqnarray}
2x_i^Tx_j = \|x_i\|^2 + \|x_j\|^2 - d(x_i,x_j)^2
\end{eqnarray}
$$

$$ \begin{eqnarray}
x_i^Tx_j = \frac{\|x_i\|^2  + \|x_j\|^2 - d(x_i,x_j)^2}{2}
\end{eqnarray}
$$

Now, let's write each piece as part of the Gram Matrix K

$$ \begin{eqnarray}
K_{i,j} = \frac{K_{i,i} + K_{j,j} - d(x_i,x_j)^2}{2}
\end{eqnarray}
$$

We have shown that knowing K is equivalent to knowing the pairwise distances of each vectors in S and also the vector lengths. We proved this by showing how each entry in K is made up of these distances and vector lengths. 

## Kernelized Objective Function
Remember our input space is $X \in R^{d}$ and our output space is $y \in R$. Let $D = {(x_{1},y_{1}), \ldots ,(x_{n},y_{n})}$ be a training set from $X \times y$. We'll use the **design matrix** $X \in R^{n \times d}$, which has the input vectors as rows: 

$$ \begin{eqnarray}
X=\begin{pmatrix}-x_{1}-\\
\vdots\\
-x_{n}-
\end{pmatrix}.
\end{eqnarray}
$$

Remember the ridge regression objective function:

$$ \begin{eqnarray}
J(w)=||Xw-y||^{2}+\lambda||w||^{2},
\end{eqnarray}
$$

for $\lambda>0$.

### Proving $w$ is a minimizer of $J(w)$
For $w$ to be a minimizer of $J(w)$, we must have $X^{T}Xw+\lambda Iw=X^{T}y$.

Let's prove this below. 

**FIRST**: Let's show that for $w$ to be a minimizer of $J(w)$, we must have $X^{T}Xw+\lambda Iw=X^{T}y$.

$$ \begin{eqnarray}
J(w)=||Xw-y||^{2}+\lambda||w||^{2},
\end{eqnarray}
$$

$$ \begin{eqnarray}
J(w)= (Xw - y)^T(Xw - y) + \lambda w^Tw
\end{eqnarray}
$$

$$ \begin{eqnarray}
J(w)= (w^TX^T - y^T)(Xw - y) + \lambda w^Tw
\end{eqnarray}
$$

$$ \begin{eqnarray}
J(w)= w^TX^TXw - 2w^TX^Ty + y^Ty + \lambda w^Tw
\end{eqnarray}
$$

$$ \begin{eqnarray}
\nabla J(w)= 2X^TXw - 2X^Ty + 2\lambda w
\end{eqnarray}
$$

Set gradient to 0 to optimize

$$ \begin{eqnarray}
X^TXw - X^Ty + \lambda w = 0
\end{eqnarray}
$$

$$ \begin{eqnarray}
X^TXw + \lambda w = X^Ty
\end{eqnarray}
$$

Note: we use $\lambda Iw$ to explicitly show the 'broadcast' that happens in a language like Python

$$ \begin{eqnarray}
X^TXw + \lambda Iw = X^Ty
\end{eqnarray}
$$

**SECOND**: Let's show that the minimizer of $J(w)$ is $w=(X^{T}X+\lambda I)^{-1}X^{T}y$

$$ \begin{eqnarray}
X^TXw + \lambda Iw = X^Ty
\end{eqnarray}
$$

$$ \begin{eqnarray}
(X^TX + \lambda I)w = X^Ty
\end{eqnarray}
$$

$$ \begin{eqnarray}
w = (X^TX + \lambda I)^{-1}X^Ty
\end{eqnarray}
$$

**THIRD**: Let's show that the matrix $X^{T}X+\lambda I$ is invertible, for $\lambda>0$.

We use the traditional proof of showing a matrix is spd and then use that fact that spd matrices are always invertible.

Show that whenever $v$ is non-zero:

$$ \begin{eqnarray}
v^TMv > 0
\end{eqnarray}
$$

We replace M with the matrix we want to prove is invertible

$$ \begin{eqnarray}
v^T(X^{T}X+\lambda I)v > 0
\end{eqnarray}
$$

$$ \begin{eqnarray}
v^TX^{T}X + v^T\lambda I)v > 0
\end{eqnarray}
$$

$$ \begin{eqnarray}
v^TX^{T}Xv + v^T\lambda Iv > 0
\end{eqnarray}
$$

$$ \begin{eqnarray}
\|Xv\|^2 + \lambda\|Iv\|^2 > 0
\end{eqnarray}
$$

Examine each piece of this sum by itself to prove why the entire expression > 0

$$ \begin{eqnarray}
\|Xv\|^2 \ge 0
\end{eqnarray}
$$

This expression is always greater than or equal to zero by its very definition. However, it is not stricly greater than zero so it is psd, not spd. Let's examine the next piece

$$ \begin{eqnarray}
\lambda\|Iv\|^2 > 0
\end{eqnarray}
$$

This MUST be strictly greater than zero unless $v$ is 0. Why is this? Well, we are told $\lambda$ > 0. Also, if v is non-negative, the Idently matrix will always have non-zero square norm. 

$$ \begin{eqnarray}
|I| > 0
\end{eqnarray}
$$

Therefore, if we square the norm of $I$ applied to a non-zero $v$, we MUST have something strictly greater than 0. Finally, if we scale this value by a $\lambda >0$, we MUST have something strictly greater than 0.

Finally, if you take an expression that is greater than or equal to 0 ($\|Xv\|^2 \ge 0$) and add to it something that is greater than 0 ($\lambda\|Iv\|^2 > 0$), the resulting sum is strictly greater than 0. This proves that $X^{T}X+\lambda I$ is spd.

### Showing that $w$ is in the 'Span of the Data'
In order to 'Kernelize' an objective function, we need to show that the learned weight vector always is lives in the Span of the Data $X$.

Let's rewrite $X^{T}Xw+\lambda Iw=X^{T}y$ as $w=\frac{1}{\lambda}(X^{T}y-X^{T}Xw)$.

Based on this, we can show that we can write $w=X^{T}\alpha$ for some $\alpha$. We can then give an expression for $\alpha$.

$$ \begin{eqnarray}
X^TXw + \lambda Iw = X^Ty
\end{eqnarray}
$$

$$ \begin{eqnarray}
\lambda Iw = X^Ty - X^TXw
\end{eqnarray}
$$

$$ \begin{eqnarray}
Iw = \frac{1}{\lambda}X^Ty - X^TXw
\end{eqnarray}
$$

$$ \begin{eqnarray}
w = \frac{1}{\lambda}X^Ty - X^TXw
\end{eqnarray}
$$

$$ \begin{eqnarray}
w = \frac{1}{\lambda}X^T(y - Xw)
\end{eqnarray}
$$

$$ \begin{eqnarray}
w = X^T\alpha
\end{eqnarray}
$$

Therefore, $\alpha$ must be:

$$ \begin{eqnarray}
\alpha = \frac{1}{\lambda}(y - Xw)
\end{eqnarray}
$$

Based on the fact that $w=X^{T}\alpha$, let's show what it means to be **in the span of the data.**

Because $w$ has this form:

$$ \begin{eqnarray}
w=X^{T}\alpha
\end{eqnarray}
$$

$$ \begin{eqnarray}
w = x_1\alpha_1 + x_2\alpha_2 + \dots + x_n\alpha_n
\end{eqnarray}
$$

$w$ is simply a linear combination of the training input data. Therefore, we say that $w$ lives in the 'span of the data points'.

### Solving for $\alpha$
Let's show that $\alpha=(\lambda I+XX^{T})^{-1}y$.

Remember that $XX^{T}$ is the **kernel matrix** for the standard vector dot product.

We can replace $w$ by $X^{T}\alpha$ in the expression for $\alpha$, and then solve for $\alpha$.

$$ \begin{eqnarray}
\alpha = \frac{1}{\lambda}(y - Xw)
\end{eqnarray}
$$

Replace $w$ with $w=X^T\alpha$

$$ \begin{eqnarray}
\alpha = \frac{1}{\lambda}(y - XX^T\alpha)
\end{eqnarray}
$$

$$ \begin{eqnarray}
\lambda \alpha = y - XX^T\alpha
\end{eqnarray}
$$

$$ \begin{eqnarray}
\lambda \alpha + XX^T\alpha = y
\end{eqnarray}
$$

$$ \begin{eqnarray}
(\lambda I + XX^T)\alpha = y
\end{eqnarray}
$$

$$ \begin{eqnarray}
\alpha = (\lambda I + XX^T)^{-1}y
\end{eqnarray}
$$

### Kernelized Score Function
Let's derive the kernelized expression for the $Xw$, the predicted values on the training points.

$$ \begin{eqnarray}
Xw = XX^T\alpha
\end{eqnarray}
$$

Note:

$$ \begin{eqnarray}
K = XX^T
\end{eqnarray}
$$

Substitute into:

$$ \begin{eqnarray}
Xw = K\alpha
\end{eqnarray}
$$

We can fully expand if we wanted to:

$$ \begin{eqnarray}
Xw = K(\lambda I + XX^T)^{-1}y
\end{eqnarray}
$$

$$ \begin{eqnarray}
Xw = K(\lambda I + K)^{-1}y
\end{eqnarray}
$$

### Kernelized Prediction on new training point
We also need to find the expression for the prediction $f(x)=x^{T}w^{*}$ for a new point $x$, not in the training set.

$$ \begin{eqnarray}
k_{x}=\begin{pmatrix}x^{T}x_{1}\\
\vdots\\
x^{T}x_{n}
\end{pmatrix}
\end{eqnarray}
$$

to simplify the expression.{]}

$$ \begin{eqnarray}
w^{*} = X^T\alpha^{*}
\end{eqnarray}
$$

$$ \begin{eqnarray}
f(x) = x^Tw^{*}
\end{eqnarray}
$$

$$ \begin{eqnarray}
f(x) = x^TX^T\alpha^{*}
\end{eqnarray}
$$

Note:

$$ \begin{eqnarray}
k_x = Xx
\end{eqnarray}
$$

$$ \begin{eqnarray}
k_x^T = (Xx)^T
\end{eqnarray}
$$

$$ \begin{eqnarray}
k_x^T = x^TX^T
\end{eqnarray}
$$

Inject this into:

$$ \begin{eqnarray}
f(x) = k_{x}^T\alpha^{*}
\end{eqnarray}
$$

## Conclusion
We now have all the necessary pieces of the Ridge Regression Objective Function kernelized and ready to implemented in code! Stay tuned for my next post which wil be taking this math and turning it into Python code. 