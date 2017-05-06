## Automatic scatter labelling

Compute the positions of labels in a scatter plot.
It implements the NOLOOKAHEAD algorithm described in:

Theophil S., Schödl A. _An Efficient Algorithm for Scatter Chart Labeling_ [AAAI](https://www.think-cell.com/en/career/talks/pdf/think-cell_article_aaai2006.pdf)

![example](https://raw.githubusercontent.com/furstenheim/automatic-scatter-labelling/master/example.gif)


### Install

`$ npm install --save automatic-scatter-labelling`

It requires of a webworker so right now it only works for the browser.

### Example

  Running `npm run gulp` will launch a full working example in the browser

### Basic usage

With browserify or webpack

```js
const algorithm = require('automatic-scatter-labelling')
const pointsToLabel = [
  {id: 1,
  position: {
    x: 10,
    y: -20
    },
  label: {
    height: 30,
    width: 20
    }
  },
  {
    id: 2,
    position: {
      x: 10,
      y: -20
    },
  label: {
    height: 30,
    width: 20
  }
]

mainAlgorithm(pointsToLabel)
  .then(function (rectangles) {
    const rectangle = rectangles[0]
    const id = rectangle.id // Corresponding to the id provided in the algorithm
    // Coordinates to place the rectangle 
    const {left, right, top, bottom} = rectangle.rectangle
  })


```

### Advanced usage

Additionally to the points we want to label we can provide extra arguments to tweak the algorithm.  `radius` is used to indicate that some space should be left around the points. `bbox` to indicate where the labels should be restricted (so that they don't go offscreen).

Example:

```js
  const result = await algorithm(pointsToLabel, {
    radius: 5,
    bbox: {
      top: margin.top,
      bottom: -margin.top + height,
      left: margin.left,
      right: margin.left + width,
      width,
      height: height
    }
  })

```