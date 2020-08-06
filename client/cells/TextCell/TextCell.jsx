const React = require('react');

module.exports = (props) => {
  let viewModel = props.viewModel;
  return (
    <div className={'power-grid-text-cell ' + viewModel.rating} onClick={props.onClick} data-row={viewModel.row}>
      {viewModel.value}
    </div>
  )
}