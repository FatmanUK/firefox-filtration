debug_mode = true
count_bookmarks = 0;
database_version = 1;

var db;

function debug(line) {
   if (debug_mode) {
      console.log(line);
   }
}

// Firefox feature request: bookmark tags API
// https://bugzilla.mozilla.org/show_bug.cgi?id=1225916
// have to do own tags for now
// https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Author_fast-loading_HTML_pages
function get_tags_from_bookmark(bookmark) {
   // This is not implemented in Firefox yet
   return [];
}

function get_tags_from_title(bookmark) {
   // replace all forbidden symbols with space
   // TODO: add more forbidden chars
   const forbidden = '	;:/.,-[]{}#@~–';
   title = bookmark.title.trim(); // remove spaces at either end
   for (ch of forbidden) {
      title = title.replace(new RegExp('[' + ch + ']', 'g'), '<>'); // replace forbiddens with <>
   }
   title = title.replace(/></g, ''); // remove ><
   title = title.replace(/<>/g, ' '); // replace <> with space
   tags = title.split(' '); // split on space
   return tags;
}

function get_tags_from_content(bookmark) {
   // TODO: content includes meta tags and actual content
   return [];
}

function remove_commons(tags) {
   // TODO: add more common words
   const commons = [
      'and',
      'com',
      'for',
      'pl',
      'a'
   ];
   for (common of commons) {
      tags = tags.filter(x => x.toString().toLowerCase() != common.toString().toLowerCase());
   }
   return tags;
}

function remove_blanks(tags) {
   return tags.filter(x => x != '');
}

// potential danger: downloading arbitrary stuff
// should be ok if not running scripts? just examining code
// abandon if binary, not text --- mark as binary?
function autotag_bookmark(bookmark) {
   bookmark_data = {
      'title': bookmark.title,
      'url': bookmark.url,
      'dateAdded': bookmark.dateAdded,
      'broken': false, // mark as broken in UI
      'suspicious': false, // mark as suspicious in ui
      'tags': []
   };
   // if not already tagged, do this one
   // TODO: get item from db, check if tags exist --- return early if so
   already_tagged = false;
   if (already_tagged) {
      return;
   }
   tags = [];
   //tags.push(get_tags_from_bookmark(bookmark)); // 1 - not implemented yet
   tags.push(get_tags_from_title(bookmark)); // 2
   // TODO: add setting to disable #3 entirely, with warning that it might take time and consume considerable bandwidth if there are many bookmarks
   tags.push(get_tags_from_content(bookmark)); // 3 - content includes meta tags and actual content
   //tags.push(get_tags_from_preview(bookmark)); // 4 - no - this is nonsense
   // TODO: get search engine SEO keywords somehow?
   tags = remove_commons(tags);
   tags = remove_blanks(tags);
   bookmark_data.tags = tags;
}

function save_bookmark(bookmark) {
   debug('URL: ' + bookmark.url);
   // TODO: actually save bookmarks (should do restore button too)
   // This is apparently not documented anywhere. Uhmm. Find an addon
   // which does this and learn from it.
}

function recurse_bookmarks(tree, f) {
// debug
   if (count_bookmarks > 10) {
      return;
   }
// debug
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

function db_open_error(event) {
   result = this.result; // this.errorCode?
   console.log('Error opening database.'); // user denied permission to create db?
   // throw?
}

function db_open_upgrade(event) {
   db = event.target.result;
   //or.onerror = db_open_error;
   debug('Database needs update.');
   const i_false = { unique: false };
   const b_keys = { keyPath: 'bmk_auto', autoIncrement: true }; // JS objects, autokey
   const t_keys = { keyPath: 'tag_auto', autoIncrement: true }; // JS objects, autokey
   // make new tables here --- we store JS objects, not rows
   os_ffb = db.createObjectStore('bookmarks', b_keys);
   // str,   str, uint     , bool  , bool      , str
   // title, url, dateAdded, broken, suspicious, tags
   // sample data:
   // const sampleData = [
   //    { title: 'Bookmark 1', url: 'https://google.com/', dateAdded: 12345, broken: false, suspicious: false, tags: 'search,engine,Google' },
   //    { title: 'Bookmark 2', url: 'https://google2.com/', dateAdded: 12345, broken: false, suspicious: false, tags: 'search,engine,Google2' }
   // ];
   debug('Store os_ffb created.');
   os_fft = db.createObjectStore('tags', t_keys);
   os_fft.createIndex('tag', 'tag', i_false);
   // str, key
   // tag, bmk_fk
   // sample data:
   // const sampleData = [
   //    { tag: 'the', bmk_fk: 1 },
   //    { tag: 'horse', bmk_fk: 2 }
   // ];
   debug('Store os_fft created.');
   os_ffb.transaction.oncomplete = event => {
//   cos_ffb = db.transaction('bookmark_pk', 'readwrite').objectStore('bookmark_pk');
//   sampleData.forEach(function(x) {
//      cos_ffb.add(x);
//   });
      debug('Bookmarks object store created.');
   }
   os_fft.transaction.oncomplete = event => {
//   cos_fft = db.transaction('tag_pk', 'readwrite').objectStore('tag_pk');
//   sampleData.forEach(function(x) {
//      cos_fft.add(x);
//   });
      debug('Tags object store created.');
   }
}

function db_open_success(event, tree) {
   db = event.target.result;
   debug('Database opened.');
   recurse_bookmarks(tree[0], autotag_bookmark);
   debug('Count of bookmarks: ' + count_bookmarks);
}

const btn_autotag = document.querySelector('input#autotag');
btn_autotag.addEventListener('click', () => {
   debug('Autotag button clicked.');
   btn_autotag.disabled = true;
   browser.bookmarks.getTree().then(function (tree) {
      const or = window.indexedDB.open('firefox-filtration', database_version); // returns IDBOpenDBRequest
      or.onerror = db_open_error;
      or.onsuccess = function (event) {
         db_open_success(event, tree);
      };
      or.onupgradeneeded = db_open_upgrade;
   }, function (error) {
      console.log(error);
   });
   btn_autotag.disabled = false;
   count_bookmarks = 0;
});

// TODO: disable backup button on click, enable afterwards
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
   count_bookmarks = 0;
});
