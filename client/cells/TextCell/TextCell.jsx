const React = require('react');

module.exports = (viewModel) => {
  return (
    <div className={'power-grid-text-cell ' + viewModel.rating}>
      {viewModel.value}
    </div>
  )
}