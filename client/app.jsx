const React = require('react');
const ReactDom = require('react-dom');
const PowerGridView = require('./PowerGridView.jsx');
const PowerGrid = require('./PowerGrid.js');
const TextCell = require('./cells/TextCell/TextCell.jsx');

let appContainer = document.querySelector('#app');

let viewModel = {
  width: 600,
  height: 400,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};

const NUM_COLS = 10;
const NUM_ROWS = 1000;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;

for (let c=0; c<NUM_COLS; c++) {
  viewModel.colWidths[c] = CELL_WIDTH;
}

for (let r=0; r<NUM_ROWS; r++) {
  viewModel.rowHeights[r] = CELL_HEIGHT;
}

for (let r=0; r<NUM_ROWS; r++) {
  for (let c=0; c<NUM_COLS; c++) {
    viewModel.cells.push({
      renderer: TextCell,
      viewModel: {
        value: c + ',' + r,
        col: c,
        row: r
      }
    });
  }
}

let render = () => {
  ReactDom.render(<PowerGridView viewModel={viewModel} />, appContainer);
};

PowerGrid.init(viewModel, render);

