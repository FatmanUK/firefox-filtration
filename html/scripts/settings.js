debug_mode = false

function debug(line) {
   if (debug_mode) {
      console.log(line);
   }
}

window.addEventListener('load', (event) => {
   debug('Settings page is fully loaded.');
   form = document.getElementById('config_form');
   for (input of form.getElementsByTagName('input')) {
      debug('Default value of ' + input.name + ' is ' + input.dataset.default);
      if (!localStorage.getItem(input.name)) {
         localStorage.setItem(input.name, input.dataset.default);
      }
      value = localStorage.getItem(input.name);
      input.setAttribute('value', value);
      form.addEventListener('input', (event) => {
         localStorage.setItem(event.target.name, event.target.value);
         debug(event.target.name + ' = ' + event.target.value);
      });
   }
});
