# Simulated Annealing

## Overview
We are looking at an *optimization algorithm* known as simulated annealing. To understand what this does, we need to understand what it is an *optimization algorithm* is attempting to solve. In optimization problems, there are many “states”, or possible solutions, and our job is to find the best one. This could be finding the shortest possible paper route for a paper boy if he must visit all homes. Or, in our example, the highest point on a hill. Each of these examples have two common elements, the states that make up the problem, order of homes to visit, or position on a hill, and the score, which would be the length of the paper route, or the height of the hill at a given location.

For large problems, we can’t possibly hope to check all the states, it would take far too long. So instead each state has a set of neighbors or successors, which are other states that can be reached from the current state. In our example, we will start off by defining a neighbor to be the positions directly to the left and right of the current position on the hill. 


## Basic Mechanics
While *Threads* is pretty easy to mess around with and make fun drawings, if you ever want to try to make something more precise it would be to your advantage to understand a little about how the drawing engine actually works!

### How are threads made?
When you draw on the screen your stroke is extruded into 3D space following the motion of the *spindle.* You can imagine it as if you are painting on a transparent sphere that is rotating around, when you hold your brush (mouse) still, the ball would still be spinning relative to the brush, leaving a mark across the ball.

### At what depth am I drawing?
The depth at which you are drawing may seem arbitrary, especially since when drawing on a screen it seems as if you only have x and y coordinates (which is true). However, the way <i>Threads</i> works is that the position of the spindle determines the depth. But it is not just the spindle, it also depends on the orientation of the camera. Your drawings are made on the plane parallel to the camera, at the depth of the spindle. So looking top down, you'd be drawing on the xz plane, where looking straight ahead, you are drawing on the xy plane.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

```
