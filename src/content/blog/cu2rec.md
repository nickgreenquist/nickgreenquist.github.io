---
title: "GPU Accelerated Matrix Factorization for Recommender Systems"
description: "cu2rec: a CUDA matrix-factorization library for recommender systems that runs parallel SGD up to 10x faster than state-of-the-art sequential implementations."
date: "2019-01-02"
slug: "cu2rec"
category: projects
image: "/blog/assets/cu2rec/need_gpu.png"
---

By: [Nick Greenquist](https://nickgreenquist.github.io/) and [Doruk Kilitcioglu](https://dorukkilitcioglu.github.io/) 

## Introduction
Matrix Factorization (MF) is a popular algorithm used to power many recommender systems. Efficient and scalable MF algorithms are essential in order to train on the massive datasets that large scale recommender systems utilize. Graphics Processing Unit (GPU) technology has become very popular in recent years and has become widely used in machine learning. The massive parallelism GPUs offer creates an opportunity to develop an accelerated MF algorithm. 
This blog post presents cu2rec, a matrix factorization algorithm written in CUDA. cu2rec implements a parallel version of Stochastic Gradient Descent (SGD) to solve large scale MF problems. cu2rec utilizes multiple advanced techniques to harness better performance from a GPU. These include aggressive use of constant memory for hyper parameters and registers for heavily reused values, a sparse matrix data structure, a reduction sum total loss kernel, parallel lock-free updating of feature weights with minimized global memory writes, and fairness across weight updates using user index striding. With a single NVIDIA GPU, cu2rec can be 10x times faster than state of the art sequential algorithms while reaching similar error metrics.

The code and the instructions on how to run it can be found on the [GitHub page](https://github.com/nickgreenquist/cu2rec).

## How It Works
<img src="/blog/assets/cu2rec/need_gpu.png" alt="GPU" width="500" class="post-img-center" loading="lazy" />

In this section of this post, we will explain how what GPUs are, how they work, and how they can be used to accelerate a powerful algorithm commonly used for recommender systems: matrix factorization. 

### How do GPUs Work
Today, GPUs are being used more to more to parallelize algorithms that need to run on big data. GPUs have much more compute power than CPUs and work well performing the same instruction on multiple pieces of data (SIMD)[^book]. GPUs originally were used for heavy graphical work but have become a staple of large machine learning models[^hpc]. Because of the explosion of GPU usage across much of machine learning, we wanted to see if they could be useful in the sub-field of recommender systems.  

GPUs are most useful when the task is computationally intensive, there are many independent computations, and the computations are similar. The architectural paradigm that most benefits from this is Single Instruction Multiple Data (SIMD), where a single instruction is executed for multiple data points.

<img src="/blog/assets/cu2rec/simd.png" alt="SIMD" width="300" class="post-img-center" loading="lazy" />

GPUs implement this SIMD architecture, but they do not devote the whole GPU to that instruction. Rather, only 32 execution units (out of 5000 in recent GPUs) have to execute the same instruction. The best practice is to structure your code to be as much SIMD as possible.

#### CUDA
CUDA is the programming language built by NVIDIA as a general purpose way of interacting with NVIDIA GPUs. It can be used with both C and C++, and gives the user API calls to important GPU functions such as copying data from and to GPU memory, and launching GPU functions called kernels.

Each kernel defines a function that is called per execution unit, called a thread. These threads are bundled into 32 units, called a warp. Each thread in a kernel executes the same _function_, but only these warps need to be simultaneously executing the same _instruction_. Furthermore, not all threads need to run concurrently, but they all need to finish before a kernel is done.

For more information about CUDA, you can check Kirk et al[^book].

### Matrix Factorization for Recommender Systems
Matrix Factorization decomposes a rating matrix $R$ of shape $m\times n$ into two feature matrices, $P$ and $Q$. $P$ ($m\times f$) and $Q$ ($n\times f$), where $f$ is the number of factors, are the learned feature matrices. The goal of MF is to train the best $P$ and $Q$ matrices such that $R=P\times Q$, as shown in the figure below. In state of the art models, it also involves learning $U$ ($m\times 1$ matrix of user biases) and $I$ ($n\times 1$ matrix of item biases), with an additional global bias $\mu$ which is set to the mean of all ratings.

<a name="fig_mf"></a>

<img src="/blog/assets/cu2rec/mf.jpg" alt="MF" width="900" class="post-img-center" loading="lazy" />

MF is incredibly popular and has been used for serving recommendations by companies such as Amazon and Netflix[^dummies]. In the era of big data, the datasets that MF is being asked to tackle are getting orders of magnitude larger than even the Netflix Dataset[^netflixwinner]. In order to keep up, MF algorithms need to be fast, scalable, and able to handle massive amounts of data. 

For more information, please look at these blog posts for [a technical explanation of Matrix Factorization](https://dorukkilitcioglu.github.io/2018/09/10/representation-learning-matrix-factorization.html) and [an application of Matrix Factorization for book recommendation](https://dorukkilitcioglu.github.io/2018/05/14/introducing-books2rec.html).

### SGD for Matrix Factorization

<img src="/blog/assets/cu2rec/math.png" alt="Math" width="900" class="post-img-center" loading="lazy" />

For the task of rating prediction, we use the biased SVD popularized by Koren et al.[^biasedsvd]. For each user $u$ and item $i$ pair, the estimated rating $\hat r_{ui}$ and the error for that rating $e_{ui}$ are defined by:

$$
\begin{aligned}
\hat{r}_{ui} &= \mu + b_u + b_i + q^T_ip_u\\
e_{ui} &= r_{ui} - \hat{r}_{ui}
\end{aligned}
$$

where $b_u$ is the user bias (which is a single float), $b_i$ is the item bias (also a single float), $\mu$ is the global mean, and $p_u$ and $q_i$ are the user and item vectors in $P$ and $Q$ respectively.

Our total loss function is the mean squared error of ratings, plus the regularization terms for the 4 matrices, which are the Frobenius norms of the matrices:

$$
    L = \Sigma_{i=1}^{n}{(r_i - \hat{r_i})^2} + \lambda_p {\lVert}P{\rVert}_2^2 + \lambda_q {\lVert}Q{\rVert}_2^2 + \lambda_{u} {\lVert}U{\rVert}_2^2 + \lambda_{i} {\lVert}I{\rVert}_2^2
$$

For SGD, we use the loss per item:

$$
    L_{ui} = e_{ui}^2 + \lambda_pp_u + \lambda_qq_i + \lambda_uU_u + \lambda_iI_i
$$

As with regular gradient descent, the update equation of any parameter $x$ with learning rate $\eta$ is defined by

$$
    x \leftarrow x - \eta\frac{\partial L}{\partial x}
$$

In our case, the parameters are each and every element of of the $P$, $Q$, $U$, and $I$ matrices. Below are the respective partial derivatives that are used with the update equation above:

$$
\begin{aligned}
    \frac{\partial L_{ui}}{\partial p_u} &= -(e_{ui}q_i - \lambda_pp_u)\\
    \frac{\partial L_{ui}}{\partial q_i} &= -(e_{ui}p_u - \lambda_qq_i)\\
    \frac{\partial L_{ui}}{\partial b_u} &= -(e_{ui} - \lambda_ub_u)\\
    \frac{\partial L_{ui}}{\partial b_i} &= -(e_{ui} - \lambda_ii_i)
\end{aligned}
$$

#### Parallel SGD Challenges

<img src="/blog/assets/cu2rec/sgd.png" alt="SGD" width="500" class="post-img-center" loading="lazy" />

Parallel SGD is a hotly debated topic, but it is definitely being used all around the globe. Tan et al.[^cumfals] claim that each iteration of SGD is inherently sequential, whereas Recht et al.[^hogwild] and Yun et al.[^nomad] argue that in the context of sparse matrix factorization in recommender systems, multiple SGD updates can be carried out simultaneously in parallel.

In our implementation, we utilized SGD similar to the ideas outlined in Recht et al[^hogwild], but modified it to be used with GPUs. Because the matrices we are dealing with are very sparse, we were able to parallelize SGD updates across multiple users and items. We chose to parallelize over users, which in reasonable-sized datasets such as ML-20M, is much higher than the number of CUDA cores in modern GPUs. As a result, we can utilize our GPUs by choosing a random item per user to update on.

We faced a few issues with this approach specific to GPUs, which warranted us to create our own flavor of the parallel SGD algorithm (see algorithm [1](#1-sgd-kernel)). The first issue we had was with multiple updates to the same item. We were running atomic operations for the updates to the item matrix, which meant that our code was slow, and worse, there were too many updates on the most popular items. This led to an overly drastic change for the item vectors, making it very hard to balance.

That is when we decided to get rid of the atomicity and have a race condition on the SGD updates, making it so that only one update per item would stick, and the previous update attempts would be void. We called this version of the algorithm Early Bird Loses the Gradient.

After analyzing our kernel, we noticed that the users with higher user ids had lower error than users with lower user ids. This was the result of how blocks are scheduled in CUDA: blocks with lower block ids (which have the lower user ids) get scheduled earlier than higher block ids. As a result, a lot of the item updates that were done by earlier users were being overwritten, and the algorithm was overfitting to the later users.

To combat this issue, we introduced user id striding with each iteration. Each thread handles user $tid + (stride * iters)\ mod\ N$, where $tid$ is the thread id and $N$ is the total number of users. This results in fair item updates with respect to the users.

Another improvement came from not allowing multiple updates to the same item, because that results in more global memory accesses. For that, we added a binary array of all items, and whenever an item is updated, we set its updated value to true. Note that this is done with regular checks, not any costly $atomicCAS$, because it is not a problem if there is a race condition in a warp and it gets overwritten a couple of times. It still is empirically faster, and we call this version of the algorithm Early Bird Gets the Gradient (EBGTG).

Also worth mentioning is that we don't need to compute the total loss every iteration. It is an expensive operation, and we only do it every couple of iterations to modify the learning rate if the SGD has stopped learning. Each thread in the SGD kernel just calculates the error for the selected user-item pair, resulting in a heavy speedup compared to calculating the error on the whole training set.
## Implementation: cu2rec
In this section of the post, we will explain how we built cu2rec. We explain how to load in ratings data to train on, the important code that performs the matrix factorization and optimization, and also some advanced programming techniques we used to make it cu2rec fast and accurate. 
### Data Preparation
#### Sparse Matrix Representation
For even decently large datasets, the full ratings matrix $R$ is too big to fit in memory. This is doubly true when we are dealing with GPU memory, as we cannot physically add more memory to a GPU.

In order to represent the matrix, we use the Compressed Sparse Row (CSR) format. CSR matrices are defined by three arrays: $indptr$, $indices$, and $data$. The item indices for user $u$ are stored in $indices[indptr[u]:indptr[u+1]]$ and their corresponding ratings are stored in $data[indptr[u]:indptr[u+1]]$. This allows for efficient indexing into the matrix given a user, which plays into how we construct our kernel.

<img src="/blog/assets/cu2rec/csr.png" alt="CSR" width="500" class="post-img-center" loading="lazy" />

When representing users with no ratings, we repeat the same value in the $indptr$ array, and handle that as a special case in our kernel.
#### Input Data
Our program accepts CSV files that are formatted as $user\\_id,item\\_id,ratings$ tuples, wherein both $user\\_id$ and $item\\_id$ are sequential numerical ids starting from 1, and are sorted based on $user\\_id$. For convenience, we provide a script that convert non-sequential ids to sequential ids, and a script that sorts the tuples based on $user\\_id$.

The program also needs two different files, one as a training set with which the MF model is trained, and a test set with which the model is evaluated. We use a completely random split across all tuples for generating these files, and split the data into 80% training and 20% test set. We also provide a script to split the data.
### Overview
The cu2rec code is organized into 3 main parts: reading in data into sparse matrix form and moving it to the GPU, using SGD and Loss kernels to train the MF model, and moving data back to the host in order to write the trained components to files. 

When a user runs cu2rec, they need to supply the train and test CSV files. cu2rec starts by reading both files into a vector of Rating structs that live in the host memory. It then converts each vector of Ratings into a CSR representation. Next, it moves these matrices into the GPU's memory. Once the memory allocation is complete, cu2rec then loads in the hyperparameters from a config file into constant memory. 

Next, cu2rec calls a $train$ function that is responsible for using the sparse rating matrices to train a MF model. $train$ starts by initializing all of the components randomly using a normal distribution with mean of 0 and standard deviation of 1. For the $P$ and $Q$ matrices, these values are normalized by the number of factors the model will use. Next, all of these components are moved to the GPU's global memory using standard CUDA API functions. Each is wrapped in a helper function to check for CUDA errors. In addition to moving needed memory to the GPU, cu2rec also initializes a CUDA Random object and other needed variables to handle an adaptive learning rate. Finally, the iterative training of the model can begin. 

The main training loop in cu2rec does $totalIterations$ loops over two main steps: update components using SGD and computer total losses. cu2rec parallelizes over the number of users in the matrix for both steps. At the beginning of each iteration, the SGD Kernel is called (algorithm [1](#1-sgd-kernel)). The code for the SGD Kernel is below. 
#### 1) SGD Kernel

`sgd.cu`

```cpp
/** Kernel for calculating the gradient descent updates. Each thread does one random item per user,
 * and multiple updates to the same item does not stack up, but rather, overwrite each other
 * as mentioned in Hogwild.
 */
__global__ void sgd_update(int *indptr, int *indices, const float *data, float *P, float *Q, float *Q_target, 
                           int n_rows, float *user_bias, float *item_bias,
                           float *item_bias_target, curandState *my_curandstate,
                           float global_bias, int start_user, bool *item_is_updated) {
    // One thread per user
    int x = (blockDim.x * blockIdx.x + threadIdx.x + start_user) % n_rows;
    if(x < n_rows) {

        // pick a random item y_i
        int low = indptr[x];
        int high = indptr[x+1];

        // Only do SGD if the user has at least one item
        if(low != high) {
            float myrandf = curand_uniform(&my_curandstate[x]); // random between (0, 1]
            int y_i = (int) ceil(myrandf * (high - low)) - 1 + low; // random integer between [low, high)

            // move some reused values to registers
            int y = indices[y_i];
            float ub = user_bias[x];
            float ib = item_bias[y];

            // get the error random item y_i
            float error_y_i = data[y_i] - get_prediction(config::n_factors, &P[x * config::n_factors], &Q[y * config::n_factors], ub, ib, global_bias);

            // check if someone already updated this item's feature weights
            bool early_bird = !item_is_updated[y];
            item_is_updated[y] = true;

            // update components
            for(int f = 0; f < config::n_factors; ++f) {
                float P_old = P[index(x, f, config::n_factors)];
                float Q_old = Q[index(y, f, config::n_factors)];

                // update components
                P[index(x, f, config::n_factors)] = P_old + config::learning_rate * (error_y_i * Q_old - config::P_reg * P_old);

                // Only update Q if train flag is true and thread is the early bird
                if(config::is_train && early_bird) {
                    Q_target[index(y, f, config::n_factors)] = Q_old+ config::learning_rate * (error_y_i * P_old - config::Q_reg * Q_old);
                }
            }

            // update user bias
            user_bias[x] += config::learning_rate * (error_y_i - config::user_bias_reg * ub);

            // Only update item_bias if train flag is true and thread is the early bird
            if(config::is_train && early_bird) {
                item_bias_target[y] = ib + config::learning_rate * (error_y_i - config::item_bias_reg * ib);
            }
        }
    }
}
```

In order for SGD to compute updates to the feature matrices, we needed to create a function that kernels can use to compute a predicted rating using the current components. The code for the Prediction Kernel is below. 
#### 2) Prediction Kernel

`prediction.cu`

```cpp
/** Convenience device function for calculating predictions.
 */
__device__ float get_prediction(int factors, const float *p, const float *q, float user_bias, float item_bias, float global_bias) {
        float pred = global_bias + user_bias + item_bias;
        for (int f = 0; f < factors; f++)
            pred += q[f]*p[f];
        return pred;
}
```

After running SGD for one item for every user, the algorithm checks if it is time to test the updated model on the test ratings (algorithm [3](#3-loss-kernel)). This is only done periodically, as computing the total losses is expensive because it needs to compute the error on all ratings, not just one rating per user such as in SGD. To do this, cu2rec first uses the Loss Kernel to compute the loss on every rating. 
#### 3) Loss Kernel

`loss.cu`

```cpp
/** Calculates the losses per item.
 * Each thread does all the items for a single user.
 * Puts the losses in the error array.
 */
__global__ void loss_kernel(int factors, int user_count, int item_count, const float * P, const float * Q, const int * indptr, 
                            const int * indices, const float * data, float * error, float * user_bias, float * item_bias, float global_bias) {
    
    // One thread per user
    int u = blockDim.x * blockIdx.x + threadIdx.x;
    if(u < user_count) {
        // Get this user's factors and bias
        const float * p = &P[u * factors];
        const float ub = user_bias[u];

        // Loop over all items of user
        for (int i = indptr[u]; i < indptr[u + 1]; ++i) {
            int item_id = indices[i];
            error[i] = data[i] - get_prediction(factors, p, &Q[item_id * factors], ub, item_bias[item_id], global_bias);
        }
    }
}
```

Next, cu2rec uses the Total Loss Kernel to reduce all the individual losses so RMSE and MAE can be computed. 
#### 4) Total Loss Kernel

`total_loss.cu`

```cpp
/** Function template for adding up the total loss.
 * Uses reduction to collect all losses into out_errors, which is small
 * (number of blocks) and can be transferred to the host memory and summed in CPU.
 * Inspired by https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf
 * and https://devblogs.nvidia.com/using-shared-memory-cuda-cc/
 * Fixes the problems related to data sizes, so it can be used with any length data.
 */
template <unsigned int block_size>
__global__ void total_loss_kernel(float *in_errors, double *out_errors, int n_errors, ErrorType error_type) {
    extern __shared__ double sdata[];
    unsigned int tid = threadIdx.x;
    unsigned int i = blockIdx.x * block_size + tid;
    unsigned int grid_size = block_size * gridDim.x;
    sdata[tid] = 0;
    // Each thread does n_errors / grid_size work to start, before reduction
    while (i < n_errors) {
        // Each error is actual_rating - predicted_rating.
        // We want its square for RMSE and its absolute value for MAE
        sdata[tid] += error_type == RMSE ? pow(in_errors[i], 2) : abs(in_errors[i]);
        i += grid_size;
    }
    __syncthreads();

    // Start reduction. This is an unrolled loop from 512 to 1.
    // Note that any if statements related to the block size are
    // completely skipped because of templating
    if (block_size >= 512) {
        if (tid < 256) {
            sdata[tid] += sdata[tid + 256];
        }
        __syncthreads();
    }
    if (block_size >= 256) {
        if (tid < 128) {
            sdata[tid] += sdata[tid + 128];
        }
        __syncthreads();
    }
    if (block_size >= 128) {
        if (tid < 64) {
            sdata[tid] += sdata[tid + 64];
        }
        __syncthreads();
    }
    if (block_size >= 64) {
        if (tid < 32) {
            sdata[tid] += sdata[tid + 32];
        }
        __syncthreads();
    }
    // if block_size is 1, compiler will complain about unneeded unsigned
    // int comparison (tid) to a value of 0
    if (!(block_size == 1) && tid < block_size / 2) {
        if (block_size >= 32) {
            sdata[tid] += sdata[tid + 16];
            __syncthreads();
        }
        if (block_size >= 16) {
            sdata[tid] += sdata[tid + 8];
            __syncthreads();
        }
        if (block_size >= 8) {
            sdata[tid] += sdata[tid + 4];
            __syncthreads();
        }
        if (block_size >= 4) {
            sdata[tid] += sdata[tid + 2];
            __syncthreads();
        }
        if (block_size >= 2) {
            sdata[tid] += sdata[tid + 1];
            __syncthreads();
        }
    }
    // All the errors in the block are now reduced to the first
    // index of shared data
    if (tid == 0) out_errors[blockIdx.x] = sdata[0];
}
```

After computing the new error metrics, cu2rec checks to see if the learning rate should be lowered by checking a patience counter. Finally, cu2rec swaps the pointers of the updated $Q$ and $itemBias$ components because we want to use the new values for the next round of updating. We do not need to keep copies of $P$ and $userBias$ matrices as the updates are simply done on the original matrices. We only keep a target version of $Q$ and $itemBias$ as updates will have race conditions between threads. More is discussed about this in the next section, Early Bird Gets the Gradient. 

Once $totalIterations$ of the training loop are complete, it is time to save the trained model and free all necessary memory. First, all the trained components are copied back to the host variables. Next, the CUDA variables are freed along with all host variables that are not part of the trained model. Outside of the $train$ method, the main code is responsible for writing to file all necessary components of the model that can be used to serve recommendations. The necessary components to write to file are: $P$, $Q$, $userBias$, $itemBias$, and $globalBias$. Once all have been written to a file, cu2rec's final steps are to free those variables memories on the host and terminate the program. 
### Early Bird Gets the Gradient

<img src="/blog/assets/cu2rec/early_bird.png" alt="EBGTG" width="300" class="post-img-center" loading="lazy" />

Due to the sequential nature of SGD, we had to come up with a technique to implement SGD with multiple threads potentially trying to update the features of the same item. In SGD, a single error is computed for a rating and both the user corresponding to that rating and the item have their feature matrices and bias weights updated. Because cu2rec parallelizes over users and each user picks a random item they have rated, the same item (especially popular items) is highly likely to be picked by multiple threads. The chance of this becomes near certain with non-trivial amounts of users and is guaranteed if you have more users than items due to the Pigeon Hole principle. 

In order to handle race conditions on the same memory, we created the Early Bird Gets the Gradient technique. In the SGD Kernel (algorithm [1](#1-sgd-kernel)), each thread picks a random item from the user's rated items. Then, it computes the error using the current feature matrices and takes the difference with the true rating. Next, it uses this error to update all of the features. Updating the $P$ matrix and $userBias$ values will never have write conflicts since each thread is responsible for a single user. However, updates to values in $Q$ and $itemBias$ matrices requires special care.

In EBGTG, the first thread to pick an item wins the race to write to that item. To implement this, we created a new boolean array, $itemIsUpdated$, that stores a true or false value for if an item's features have already been updated. When a thread selects a random item, they check the value in the array and set a local $earlyBird$ variable to $true$ if they 'won the race.' They then set the value for this item to $true$ so other threads will set their $earlyBird$ variables to $false$. Threads then only waste time doing $f$ global memory writes to $Q$ and one global memory write to $itemBias[y]$. 

However, it should be noted that due to warp divergence, even if a single thread in a warp is selected as the early bird, all threads in the warp are blocked until the early bird thread is finished updating $QTrgt$. Warp divergence is a dangerous occurrence in GPUs when branch conditions are introduced into kernels. In a GPU, threads are bundled into a group of threads, usually 32, that is called a warp. Every thread in a warp executes each instruction of a kernel in lockstep. When a conditional is reached, the GPU has no choice but to block all threads that fail that conditional while all the threads that pass it perform all the instructions in that block of code. Then, when the conditional ends, all the threads begin again performing the remaining instructions in the kernel. Therefore, with EBGTG, if a single thread in a warp is the 'early bird', all other threads will be blocked until that single thread does the slow global memory writes. 

We were worried at first that warp divergence would prevent any speedup from EBGTG versus Early Bird Loses the Gradient, but in empirical testing, we saw a consistent 12-15% speedup for the entire program. 

### Advanced Techniques
To optimize run-time and ensure best in class results on test sets, cu2rec utilizes multiple advanced techniques. The use of constant memory, registers, and an optimized reduction sum kernel use the GPU's architecture to greater advantage. Our parallel lock-free updates and user index striding ensure we achieve the best results possible against test set ratings. 

<img src="/blog/assets/cu2rec/pika.png" alt="Advanced Techniques" width="500" class="post-img-center" loading="lazy" />

#### Constant Memory
All of our kernels rely on many of the same static variables, such as hyper parameters and dimensions. These values include total iterations, number of factors, $\eta$, $\lambda_p$, $\lambda_q$, $\lambda_u$, and $\lambda_i$.

The constant memory is useful because from the kernel's point of view, it never changes, and can therefore be aggressively cached. Because all of the values we store in constant memory never change during the execution of cu2rec, all of these values get cached in the beginning of execution and remain in the cache for the runtime of the program. 

#### Aggressive Register Use
Registers are the fastest memory available on the GPU and accesses to this memory can be over 100x faster than global memory[^book]. As such, one of our goals was to aggressively use registers to store any values that are used more than once in a kernel. We will break down which values we decided to store in registers.

In the SGD Kernel (algorithm [1](#1-sgd-kernel)), the following variables are created to store values in registers: $x$ (the user id), $low$ (the first rated item id index pointer), $high$ (the last rated item id index pointer), $yi$ (random item index pointer), $y$ (the item id), $ub$ (user $x$'s bias), $ib$ (item $y$'s bias), $error$ (the error of the model on the rating of user x on item y), $earlyBird$ (if the user is first to update item's features), $pOld$ (old value for feature matrix $P$ at row $x$ and column $i$), and $qOld$ (old value for feature matrix $Q$ at row $y$ and column $i$).

In the Loss Kernel (algorithm [3](#3-loss-kernel)), the following variables are created to store values in registers: $x$ (the user id), $ub$ (user $x$'s bias), and $itemId$ (the item index for every item $x$ has rated).

We experimented with having less register use, thinking it might allow for more blocks to be scheduled at the same time, but that resulted in more global memory accesses (and more pressure on the caches), and was overall empirically slower.

#### Reduction Sum
The total loss kernel, which is used to calculate the global loss after a set number of updates, uses a fixed number of threads $t_g$ per grid regardless of the number of ratings. This makes it easy to scale to very high number of ratings ($N$). It uses the reduction sum technique, wherein each thread at each step calculates a partial sum of its previous partial sum and the next thread's previous partial sum. This is done for $log(N)$ steps.

Each thread initially calculates the sum of $N/t$ elements sequentially, where each element is $t_g$ apart from the previous one, allowing coalesced memory accesses. These sums are written into the shared memory.

After this step, each block (size $t_b$) reduces its own sum into the sum at $tid=0$. This is done for $log(N)$ steps, wherein in the first step, the first $t_b/2$ threads calculate their partial some with the sums in $tid$ and $tid + t_b/2$, and then $t_b/4$ threads, and so on. This approach coalesces the memory accesses and minimizes branch divergence. We also use loop unrolling to reduce the number of if statements, and also use templating with the block size to get rid of the unnecessary unrolled checks in compile-time.

At the end, each thread with $tid=0$ writes its own sum to the global memory, so we get a partial sum per block. These can be fed into another reduce sum kernel, but we found doing the final addition on the host was faster.    

#### Parallel Lock-Free Updates
As discussed in the section explaining Early Bird Gets the Gradient, cu2rec does not lock any memory address writes while updating feature matrix weights. Earlier versions of cu2rec utilized atomic operations to update the $Q$ and $itemBias$ matrices. However, after discovering that optimal results could be achieved by simply letting a single thread 'win' an update, we decided to remove any atomic operations from any kernel. 

#### User Index Striding
EBGTG favors whichever thread selects an item first and sets the $itemIdUpdated$ value to $true$. Therefore, we must ensure that every thread (and therefore every user) gets a fair shot to be the 'early bird.' At first, with naive EBGTG, we were seeing 2-3% worse results on test data than other implementations. This gap in results increased for larger datasets, including almost 8% worse results on the Netflix Dataset when compared to best in class results (Xie et al.[^cumfsgd]). We learned that EBGTG was scheduling lower index users first since they would always be in the first few blocks every iteration. While there is no guarantee which blocks begin running first, there are limited SMs on a GPU and therefore some blocks are queued while waiting to run. We found that later users would consistently be scheduled to higher block indexes, and thus run last. 

In order to combat this, we decided to offset which user each thread uses to perform SGD. In the training loop, we add an offset variable every iteration and pass that to the SGD kernel (algorithm [1](#1-sgd-kernel)). This effect can be seen in the first line where $x$ is computed. What this offset does is ensure that over time, every thread will be responsible for different sections of the user matrix. 

By implementing this striding, we immediately began to see equal results in test set error metrics compared to other well known implementations.

## Results
We benchmarked our GPU code using an NVIDIA V100 GPU, and the CPU code with an Intel i7-6650U CPU.

### Speedup

<img src="/blog/assets/cu2rec/ml100_speed.png" alt="ML100k Performance" width="900" class="post-img-center" loading="lazy" />

<img src="/blog/assets/cu2rec/ml20m_speed.png" alt="ML20M Performance" width="900" class="post-img-center" loading="lazy" />

### RMSE

<img src="/blog/assets/cu2rec/ml100_error.png" alt="ML100k RMSE" width="900" class="post-img-center" loading="lazy" />

<img src="/blog/assets/cu2rec/ml20m_error.png" alt="ML20M RMSE" width="900" class="post-img-center" loading="lazy" />

### GPU vs GPU
We tested our code both with a V100 on NYU's Prince server, and a TITAN Z in NYU's cuda2 server. We varied problem sizes, the memory bandwidth requirements, and the number of iterations to get a healthy comparison. This is visualized in the following figure:

<img src="/blog/assets/cu2rec/gpu_vs_gpu.png" alt="GPU vs GPU" width="900" class="post-img-center" loading="lazy" />

The V100 has 5,120 CUDA cores vs 5,760 of TITAN Z, 900GB/s memory bandwidth vs 672GB/s of TITAN Z, and higher clock speed.

In terms of the cost in performance, going from the ML-100k to ML-20M dataset increases the total problem size, as there are more users, items, and ratings to train for. Holding all other things equal, we would expect a scalable code to have higher speedup with larger problem size, and our speedup satisfies this.

In terms of bandwidth requirement, increasing the number of factors from 50 to 300 has a direct effect on it, because the SGD kernel needs to retrieve more data from the global memory. Holding all other things equal, we would expect a scalable code to have higher speedup with increased memory bandwidth, and our speedup satisfies this.

## Conclusion

<img src="/blog/assets/cu2rec/conclusion.jpg" alt="Conclusion" width="500" class="post-img-center" loading="lazy" />

GPU technology opens the door to massive acceleration for a wide variety of problems. Machine Learning has recently seen a massive boost in effectiveness from both powerful GPUs and the availability of big data to train complex models on. Recommender Systems are an interesting subset of machine learning as they benefit greatly from larger and larger datasets that allow models to uncover complex latent relationships between users and items. SGD is one of the most popular algorithms to optimize recommender system MF models. However, SGD provides a challenging problem for GPU implementations due to its inherent sequential definition. 

This blog post introduced cu2rec, a novel parallel implementation of SGD used to solve recommender system matrix factorization. Through the use of a parallel lock free SGD kernel and a variety of advanced CUDA programming techniques, cu2rec achieves a 10x speedup over one of the fastest sequential recommender system MF libraries while matching best in class error metrics. In addition to outperforming sequential implementations of SGD MF, cu2rec has also been shown to scale with better GPU hardware. 

## References
[^book]: D. B. Kirk and W. H. Wen-Mei, _Programming massively parallel processors: a hands-on approach._ Morgan kaufmann, 2016.

[^hpc]: A. Coates, B. Huval, T. Wang, D. Wu, B. Catanzaro, and N. Andrew, “Deep learning with cots hpc systems,” in _International Conference on Machine Learning_, 2013, pp. 1337–1345.

[^dummies]: A. Bari, M. Chaouchi, and T. Jung, _Predictive analytics for dummies_. John Wiley & Sons, 2016.

[^netflixwinner]: Y. Koren, “The bellkor solution to the netflix grand prize,” _Netflix prize documentation_, vol. 81, pp. 1–10, 2009

[^biasedsvd]: Y. Koren, R. Bell, and C. Volinsky, “Matrix factorization techniques for recommender systems,” _Computer_, no. 8, pp. 30–37, 2009.

[^cumfals]: W. Tan, L. Cao, and L. L. Fong, “Faster and cheaper: Parallelizing large-scale matrix factorization on gpus,” _CoRR_, vol. abs/1603.03820, 2016. [Online]. Available: http://arxiv.org/abs/1603.03820

[^hogwild]: B. Recht, C. Re, S. Wright, and F. Niu, “Hogwild: A lock-free approach to parallelizing stochastic gradient descent,” in _Advances in neural information processing systems_, 2011, pp. 693–701.

[^nomad]: H. Yun, H. Yu, C. Hsieh, S. V. N. Vishwanathan, and I. S. Dhillon, “NOMAD: non-locking, stochastic multi-machine algorithm for asynchronous and decentralized matrix completion,” _CoRR_, vol. abs/1312.0193, 2013. [Online]. Available: http://arxiv.org/abs/1312.0193 

[^cumfsgd]: X. Xie, W. Tan, L. L. Fong, and Y. Liang, “Cumf sgd: Fast and scalable matrix factorization,” _CoRR_, vol. abs/1610.05838, 2016. [Online]. Available: http://arxiv.org/abs/1610.05838
