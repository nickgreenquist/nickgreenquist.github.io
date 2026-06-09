---
title: "Recommender System with Rapid Miner"
description: "A step-by-step guide to prototyping a user-kNN collaborative filtering book recommender in RapidMiner."
date: "2018-03-02"
slug: "recommender-system-rapid-miner"
category: datascience
---

**User k-NN Collaborative Filtering for Item Recommendations - A step by step guide in Rapid Miner**

<img src="/blog/assets/RecommenderSystem/rapidminer.png" alt="RapidMiner" width="700" class="post-img-center" loading="lazy" />

As part of a class for NYU, a team of 3 of us are building a recommendation system for books. To quickly prototype a dead simple recommender system, we put together a simple Rapid Miner workflow. You can read more about this [here at Doruk Kilitcioglu's blog](https://dorukkilitcioglu.github.io/data-science/2018/03/01/adventures-rapidminer.html). Below are is the step by step guide we used to get results from Rapid Miner for item recommendations using user-user collaborative filtering. 

1. **Download `ratings.csv` from [http://fastml.com/goodbooks-10k-a-new-dataset-for-book-recommendations/](http://fastml.com/goodbooks-10k-a-new-dataset-for-book-recommendations/)**

    1. **NOTE: If you don't have an educational license with RapidMiner, you can only load in 10k rows. Open and edit the ratings file and trim it down to 10k rows.**

    2. You can get an education license from the RapidMiner website if you make an account and add an .edu email

2. **Download RapidMiner and install to your machine**

3. **Start a New Process and make it Blank**

4. **Loading the Data**

    3. Hit `Add Data` at the top left under repository

    4. Click on My Computer and find ratings.csv from your local machine

    5. Hit all the `Next` buttons and then save the file under `data`

    6. This might take up to a minute

    7. From the top left, expand Local Repository, then data, and then drag ratings.csv to the right window

5. **6million ratings is too much for RapidMiner to process so let's filter it down**

    8. Find the `Filter Examples` operator and drag to the right window

    9. Hook up the output of Retrieve ratings to the input of `Filter Examples`

    10. Click on `Filter Examples` and click on the Add Filters button to the far right

    11. Ensure user_id is selected as the left field

    12. Make the filter operator (should be `=` by default) a `<`

    13. Type in anywhere between `500` to `1000`

    14. Hit `OK`

    <img src="/blog/assets/RecommenderSystem/filter.png" alt="RapidMiner" width="700" class="post-img-center" loading="lazy" />

6. **Set the role of the columns**

    15. Add the `Set Role` operator to the window

    16. Click on the box

    17. At the far right, from the `attribute name` drop down, select `rating` and set the target role to `label`

    <img src="/blog/assets/RecommenderSystem/label.png" alt="RapidMiner" width="300" class="post-img-center" loading="lazy" />

    18. Click on the `Edit List` button

        1. Make the left field `user_id` and at the right field, **TYPE** in `user identification`

        2. At the bottom hit `Add Entry`

        3. Made the new left field `book_id` and at the right field, **TYPE** in `item identification`

    19. Hit `Apply`

    <img src="/blog/assets/RecommenderSystem/roles.png" alt="RapidMiner" width="700" class="post-img-center" loading="lazy" />

7. **Split data into `train` and `test`**

    20. Add the `Split Data` operator to the right window

    21. Hook up output of `Set Role` to `Split Data`

    22. Click on `Split Data` and hit the `Edit Enumeration` bottom in the top right

    23. Add two entries

    24. Type in the first one as .8 (this is the train set)

    25. Type in the second one as .2 (this is the test set)

    26. Hit `OK`

    <img src="/blog/assets/RecommenderSystem/split.png" alt="RapidMiner" width="700" class="post-img-center" loading="lazy" />

8. **Add Recommender System algorithm**

    27. At the very top right, hit `Extensions` and go to the Marketplace

    28. Type `Recommender` in the search bar

    29. Install `Recommender Extension` and follow the instructions to install

9. **Add User k-NN item recommender system**

    30. Find the `Collaborative Filtering Item Recommendation/ User k-NN operator` (will be in `Extensions` under `Recommenders/Item Recommendation`)

    31. Drag this to the right window

    32. Hook up the top output of the `Split Data` box to the input of the `User k-NN` box

10. **Apply the model to train and test**

    33. Add `Apply Model (Item Recommendation)` operator to the right window

    34. Hook up the `Mod` output of the User k-NN to the input `Mod` of the `Apply Model` box

    35. Hook up the second `par` output of the `Split Data` box to the `que` input of the `Apply Model` box

    36. Drag the `res` output of the `Apply Model` box to the `res` on the very far right of the window (the final output)

11. **Hit the big blue `Run` button to view the output!**

    37. The model will recommend items (books) to users based on the books other users very similar to them have read

12. **Please view the image below if you are stuck**

    <img src="/blog/assets/RecommenderSystem/ItemRecommendationsApply.png" alt="Item Recommendation Apply" width="700" class="post-img-center" loading="lazy" />

13. **View performance metrics**

    38. Delete the `Apply Model` box

    39. Add the `Performance (Item Recommendation)` operator

    40. Hook up the `Mod` output of the `User k-NN` box to the `Mod` input of the `Performance` box

    41. Hook up the `exa` output of the `User k-NN` box to the `tra` input of the `Performance` box

    42. Hook up the second `par` output of the Split Data box to the `tes` input of the Performance box

    43. Hoop up the `per` output of the Performance box to the `res` at the very far right of the window

14. **Hit the big blue `Run` button to view the output!**

    44. The output will be a slew of performance metrics for the Item Recommendations

    45. The AUC (Area Under of the Curve) can be treated as an `accuracy` metric

15. **Please view the image below if you are stuck**

<img src="/blog/assets/RecommenderSystem/ItemRecommendationsPerformance.png" alt="Item Recommendation Performance" width="700" class="post-img-center" loading="lazy" />

**Notes and further exploration:**

1. You can use this set up on any set of ratings as long as the input csv follows the following format (User_id, item_id, rating) and you make sure to set the roles to exactly `user identification`, `item identification` and `label` as explained in the steps above

2. You can predict the ratings on the test set instead of predicting good recommendations. Swap out the `Item Recommendation User k-NN` with `Rating Prediction User k-NN` if you would rather predict the ratings that users have given their books

3. Play around with Item k-NN or other operators. These operators find items that are most similar to other items in order to make recommendations. What we used above found most similar users to other users in order to recommend items

    1. Please read more on recommender systems and techniques to make them. This post is meant to be a step by step guide for RapidMiner and not an explanation on recommender systems
