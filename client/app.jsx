const React = require('react');
const ReactDom = require('react-dom');
const PowerGrid = require('./PowerGrid.jsx');
const TextCell = require('./cells/TextCell/TextCell.jsx');
const NUM_COLS = 100;
const NUM_ROWS = 4000;
const CELL_WIDTH = 75;
const CELL_HEIGHT = 30;
const SCROLLBAR_SIZE = 14;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 550;
// const VIEWPORT_WIDTH = 800;
// const VIEWPORT_HEIGHT = 500;

let appContainer = document.querySelector('#app');

let getRating = () => {
  let val = Math.random();

  if (val < 0.2) {
    return 'bad'
  }
  else if (val < 0.6) {
    return 'neutral'
  }
  else {
    return 'good';
  }
};









let mainViewModel = {
  maxCellsWhileScrolling: 200,
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};

/*
cell schema
{
  renderer
  row
  col
  viewModel
}

*/
for (let c=0; c<NUM_COLS; c++) {
  mainViewModel.colWidths[c] = CELL_WIDTH;
}
for (let r=0; r<NUM_ROWS; r++) {
  mainViewModel.rowHeights[r] = CELL_HEIGHT;
}
for (let r=0; r<NUM_ROWS; r++) {
  for (let c=0; c<NUM_COLS; c++) {
    mainViewModel.cells.push({
      renderer: TextCell,
      col: c,
      row: r,
      viewModel: {
        value: c + ',' + r,
        rating: getRating()
      }
    });
  }
}

console.log(mainViewModel);



let ROW_HEADER_WIDTH = 70;
let rowHeadersViewModel = {
  hideScrollbars: true,
  width: ROW_HEADER_WIDTH,
  height: VIEWPORT_HEIGHT-SCROLLBAR_SIZE,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};
for (let c=0; c<1; c++) {
  rowHeadersViewModel.colWidths[c] = ROW_HEADER_WIDTH;
}
for (let r=0; r<NUM_ROWS; r++) {
  rowHeadersViewModel.rowHeights[r] = CELL_HEIGHT;
}
for (let r=0; r<NUM_ROWS; r++) {
  for (let c=0; c<1; c++) {
    rowHeadersViewModel.cells.push({
      renderer: TextCell,
      col: c,
      row: r,
      viewModel: {
        value:'R' + r
      }
    });
  }
}

let COL_HEADER_HEIGHT = 30;
let colHeadersViewModel = {
  hideScrollbars: true,
  width: VIEWPORT_WIDTH-SCROLLBAR_SIZE,
  height: COL_HEADER_HEIGHT,
  x: 0,
  y: 0,
  colWidths: [],
  rowHeights: [],
  cells: []
};
for (let c=0; c<NUM_COLS; c++) {
  colHeadersViewModel.colWidths[c] = CELL_WIDTH;
}
for (let r=0; r<1; r++) {
  colHeadersViewModel.rowHeights[r] = COL_HEADER_HEIGHT;
}
for (let r=0; r<1; r++) {
  for (let c=0; c<NUM_COLS; c++) {
    colHeadersViewModel.cells.push({
      renderer: TextCell,
      col: c,
      row: r,
      viewModel: {
        value:'C' + c
      }
    });
  }
}

let collapseRow = (row) => {
  mainViewModel.rowHeights[row] = 0;
  rowHeadersViewModel.rowHeights[row] = 0;
  render();
};

let onViewModelUpdate = () => {
  rowHeadersViewModel.y = mainViewModel.y;
  colHeadersViewModel.x = mainViewModel.x;
  render();
}

let onCellClick = (evt) => {
  let row = evt.target.getAttribute('data-row');
  collapseRow(row);
};



let render = () => {
  ReactDom.render(
    <div className="example-grid">
      <div className="top">
        <div className="left">
        </div>
        <div className="col-headers">
          <PowerGrid viewModel={colHeadersViewModel}/>
        </div>  
      </div>
      <div className="bottom">
        <div className="row-headers">
          <PowerGrid viewModel={rowHeadersViewModel}/>
        </div>
        <div className="main-grid">
          <PowerGrid viewModel={mainViewModel} onViewModelUpdate={onViewModelUpdate} onCellClick={onCellClick}/>
        </div>
      </div>
    </div>
    , appContainer);
};

render();



