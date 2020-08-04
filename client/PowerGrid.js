const SCROLL_COOLDOWN = 2000;

let dirty = true;
let render;

let init = (viewModel, ren) => {
  render = ren;

  document.addEventListener('scroll', (evt) => {
    let sceneGridEl = evt.target.closest('.power-grid-scene-grid');
    if (sceneGridEl) {
      viewModel.x = sceneGridEl.scrollLeft;
      viewModel.y = sceneGridEl.scrollTop;
      dirty = true;
    }
  }, true); // scroll does not bubble, must listen on capture

  //let scrollTimeout;

  // document.addEventListener('wheel', (evt) => {
  //   let powerGridEl = evt.target.closest('.power-grid');
    

  //   if (powerGridEl) {
  //     if (!viewModel.scrollable) {
  //       let shadowGridEl = evt.target.closest('.power-grid-shadow-grid');

  //       viewModel.scrollable = true;
        

  //       // if (scrollTimeout) {
  //       //   clearTimeout(scrollTimeout);
  //       // }
  //       // scrollTimeout = setTimeout(() => {
  //       //   viewModel.scrolling = false;
  //       //   dirty = true;
  //       // }, SCROLL_COOLDOWN);

  //       dirty = true;
  //     }

  //   }
  // }, true); // wheel does not bubble, must listen on capture


  // document.addEventListener('mousedown', (evt) => {
  //   let powerGridEl = evt.target.closest('.power-grid');
  //   if (powerGridEl) {
  //     viewModel.interacting = true;
  //     dirty = true;
  //   }
  // }, true); // capture to make events pass through shadow grid


  // document.addEventListener('mouseup', (evt) => {
  //   let powerGridEl = evt.target.closest('.power-grid');
  //   if (powerGridEl) {
  //     viewModel.interacting = false;
  //     dirty = true;
  //   }
  // }, false);

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