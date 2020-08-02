let dirty = true;
let render;

let init = (viewModel, ren) => {
  render = ren;

  document.addEventListener('scroll', (evt) => {
    let shadowGridEl = evt.target.closest('.power-grid-shadow-grid');
    if (shadowGridEl) {
      viewModel.x = shadowGridEl.scrollLeft;
      viewModel.y = shadowGridEl.scrollTop;
      dirty = true;
    }
  }, true); // scroll does not bubble, must listen on capture

  update();
}

let update = () => {
  if (dirty) {
    render();
    dirty = false;
  }
  requestAnimationFrame(() => {
    update();
  });
};

module.exports = {
  init: init
};