# K-Means clustering

## Overview
We are looking at a technique to separate data into clusters known as k-means clustering. The algorithm is relatively simple, and if the correct number of clusters are used, the method can usually group these clusters. The grouping can be used as a sort of unsupervised machine learning method. By determining which cluster a new data point is closest to, that new point can share common attributes of the other points in the cluster.

## Algorithm
The algorithm is relatively simple. First, the *k* centroids are initialized to random locations throughout the feature space. Each point is assigned to the cluster of the centroid that it is closest to. The centroid of each cluster is updated to the mean of all of the points in the cluster. This is repeated until some convergence criteria has been met. For our demonstration, we set the convergence as a number of iteration limit as well as if the centroids do not move between iterations.

## Downfalls and Improvements
Although the algorithm will always terminate and is complete after each iteration, the solution will not necessarily be optimal. The solution also highly depends on the starting centroid locations, so each time the algorithm is run, a different clustering may be produced. To improve the algorithm's accuracy, the algorithm can be run with multiple restarts, and some method can be used to select the most common or best centroids.

Another downfall is that the algorithm is considered NP-hard because for each centroid you have to calculate the distance to all of the points and then find the average of the closest points to update the centroid's position. There are heuristic algorithms that converge to local optimum relatively quickly, but we will not go into depth describing those here.

Finally, often times, the number of clusters is unknown. A simple way to determine an appropriate number of clusters is to use distortion to measure how well the clusters are separated. The distortion measures the sum of all the points' distances from the centroid for their cluster. As you increase the number of centroids, the distortion will decrease, but at a certain number of clusters, there occurs an *elbow* of the distortion vs number of clusters graph. This elbow is the optimal number of clusters to use.

## Similar Algorithms
A similar technique can be used for supervised machine learning, k-nearest neighbors. K-nearest neighbors plots the training set features in the feature space and assigns a class to each point. When classifying new data, the *k* neighbors closest to the new data point determine the class. For example, if you use a 1-nearest neighbor classifier, the new data will be assigned whatever class the data it is closest to has. There is no updating of centroids or clusters in this method, so it is considered a pretty naive machine learning solution.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

```
