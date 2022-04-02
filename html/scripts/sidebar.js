debug_mode = true

function debug(line) {
   if (debug_mode) {
      console.log(line);
   }
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
// Firefox feature request: bookmark tags API
// https://bugzilla.mozilla.org/show_bug.cgi?id=1225916
// have to do own tags for now
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
// https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Author_fast-loading_HTML_pages

function save_bookmark(bookmark) {
   console.log('URL: ' + bookmark.url);
   // TODO: actually save bookmarks (should do restore button too)
   // This is apparently not documented anywhere. Uhmm. Find an addon
   // which does this and learn from it.
}

function recurse_bookmarks(tree, f) {
   if (tree.url) {
      f(tree);
      ++count_bookmarks;
   }
   if (tree.children) {
      for (child of tree.children) {
         recurse_bookmarks(child, f);
      }
   }
}

count_bookmarks = 0;

const btn_backup = document.querySelector('input#backup');
btn_backup.addEventListener('click', () => {
   debug('Backup button clicked.');
   // includes synced bookmarks? seems to. :) 
   browser.bookmarks.getTree().then(function (tree) {
      recurse_bookmarks(tree[0], save_bookmark);
      debug('Count of bookmarks: ' + count_bookmarks);
   }, function (error) {
      console.log(error);
   });
});
