let fn = () => { console.log('a') };
fn();

window.onload = function() {
  let app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue.js!'
    }
  });
}