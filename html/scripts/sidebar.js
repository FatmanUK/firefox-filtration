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

function save_bookmark(bookmark) {
   console.log('URL: ' + bookmark.url);
   // TODO: actually save bookmarks (should do restore button too)
   ++count_bookmarks;
}

function recurse_bookmarks(tree) {
   if (tree.url) {
      save_bookmark(tree);
   }
   if (tree.children) {
      for (child of tree.children) {
         recurse_bookmarks(child);
      }
   }
}

count_bookmarks = 0;

const btn_backup = document.querySelector('input#backup');
btn_backup.addEventListener('click', () => {
   debug('Backup button clicked.');
   // includes synced bookmarks?
   browser.bookmarks.getTree().then(function (tree) {
      recurse_bookmarks(tree[0]);
      debug('Count of bookmarks: ' + count_bookmarks);
   }, function (error) {
      console.log(error);
   });
});
