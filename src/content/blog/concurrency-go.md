---
title: "Concurrency With Go"
description: "A quick guide to writing concurrent function calls in Go with goroutines and channels."
date: "2018-09-10"
slug: "concurrency-go"
category: miscl
---

## How to Write Concurrent Function Calls in Go
Go is an amazing language. I'd know, I just started using it this weekend. What are some of the cool things you can do with it? Well, how about writing concurrent function calls trivially! Let's take a look.

### Simple Sequential Function Calls
This code below is pretty simple. It just calls a function 20 times and prints i, from 0 -> 19
```go
package main

import (
	"fmt"
)

func print(i int) {
	fmt.Println(i)
}

func main() {
	for i := 0; i < 20; i++ {
		print(i)
	}
}
```
#### Output: 
0
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19

### Simple Concurrent Function Calls
This code below attempts to fire off 20 concurrent function calls. We use the `go` keyword before the function call to tell Go to run this in its own thread. Let's see what happens if we run this code. 
```go
package main

import (
	"fmt"
)

func print(i int) {
	fmt.Println(i)
}

func main() {
	for i := 0; i < 20; i++ {
		go print(i)
	}
}
```
#### Output: 

That's right: nothing was printed! Why did this happen? Well, the `for` loop fires off 20 concurrent routines. Those routines are off running on their own. `main()` then continues running. What is after the `for` loop? Well, nothing. So `main()` terminates. Those routines that split off never had a chance to even print anything! So how can we fix this? Let's take a look at one approach using `channels`. 

### Concurrent Function Calls with Channel
We can use a `channel` in Go which is pretty much a semaphore. A channel is a buffer that can hold `n` 'things'. For this case, we just want to add an int simply to signal something is inside. The type doesn't matter for what we need. 

```go
package main

import (
	"fmt"
)

func print(i int, c chan int) {
	fmt.Println(i)

	// this signals to the channel this routine is done
	c <- 1
}

func main() {
	num_calls := 20
	c := make(chan int, num_calls)

	for i := 0; i < num_calls; i++ {
		go print(i, c)
	}

	// this loop won't terminate until 20 ints have been popped out
	for i := 0; i < num_calls; i++ {
		<- c
	}
}
```
#### Output: 
2
0
1
10
5
6
7
8
9
14
11
12
13
3
16
15
19
18
17
4

Now this looks concurrent!!

So, what happened can be boiled down to this. We set up a `channel` of size 20. We loop 20 times and call 20 go routines. Next, `main()` enters a `for` loop. Each call is trying to pop out something from the channel. That `for` loop won't finish until 20 things have some out. If the buffer is empty, Go just waits around until something is added. What is adding things into the buffer? You guessed it! Our routines! So, each time a routine is done, it adds something to the channel, letting `main()` inch closer to termination. 

### Concurrent Function Calls with WaitGroup
Here is another, more 'Production Code Approved' way of waiting for all go routines to finish running. It involves the use of a `WaitGroup`. 

```go
package main

import (
	"fmt"
	"sync"
)

func print(i int, wg *sync.WaitGroup) {
	// defer means run this line right before exiting the function
	// wg.Done() signals to WaitGroup that this routine is done
	defer wg.Done()
	
	fmt.Println(i)
}

func main() {
	wg := &sync.WaitGroup{}

	for i := 0; i < 20; i++ {
		wg.Add(1)
		go print(i, wg)
	}

	wg.Wait()
}
```
#### Output:
0
19
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
