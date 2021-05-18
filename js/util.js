function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

window.addEventListener("storage", handle_storage, false);

function handle_storage(e) {
    //alert(e.key +": "+e.newValue);
}