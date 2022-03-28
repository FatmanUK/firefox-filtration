#!/bin/env python3
from os import mkdir, path, rename, walk
from pathlib import Path
from glob import glob
from datetime import datetime
from zipfile import ZipFile
import json

# TODO
# Think I might be using 'finally' wrong here. Oops!

class ItsNotADirectory(BaseException):
  pass

class ItsStillThere(BaseException):
  pass

class ItsNotThere(BaseException):
  pass

pkgpath = 'pkgs'
excludes = [ '.git/', '.xpi', '.swp', 'pkgs/', 'info/' ]

ensure = 'Directory %s/ exists' % pkgpath
try:
  print('Ensure: %s' % ensure)
  mkdir(pkgpath, 0o755)
except FileExistsError:
  print('Something exists in this location.')
except OSError:
  # TODO
  print('Oh no! OS')
except:
  # TODO
  print('Oh no!')
finally:
  print('Assert: %s' % ensure)
  print('Checking it is a directory.')
  if not Path(pkgpath).is_dir():
    raise ItsNotADirectory
  print('Assertions passed.')

ensure = 'Old xpi file is backed up'
the_glob = None
try:
  print('Ensure: %s' % ensure)
  the_glob = glob('*.xpi')
  for file in the_glob:
    rename(file, '%s/%s' % (pkgpath, file))
except OSError:
  # TODO
  print('Oh no! OS')
except:
  # TODO
  print('Oh no!')
finally:
  print('Assert: %s' % ensure)
  for file in the_glob:
    if path.exists(file):
      raise ItsStillThere
    if not path.exists('%s/%s' % (pkgpath, file)):
      raise ItsNotThere
  print('Assertions passed.')

ensure = 'New xpi file exists'
try:
  print('Ensure: %s' % ensure)
  f = open('manifest.json')
  ver_date = datetime.now().strftime('%Y%m%d%H%M%S')
  version = json.load(f)['version']
  f.close()
  print('Loaded manifest. Package version: %s' % version)
  file_paths = []
  for root, directories, files in walk('.'):
    for filename in files:
      excluded = False
      # TODO: improve this a bit? Complexity O^3, that's not good.
      for ex in excludes:
        if ('%s' % ex) in path.join(root, filename):
          excluded = True
      if not excluded:
        file_paths.append(path.join(root, filename))
  with ZipFile('fff-%s.%s.xpi' % (version, ver_date), 'w') as zip:
    for file in file_paths:
      print('Zipping file: %s' % file)
      zip.write(file)
except ValueError:
  # This happens if the JSON is not parseable
  print('ValueError: %s %s' % (ver_date, version))
except TypeError:
  # TODO
  print('Oh no! T')
except JSONDecodeError:
  # TODO
  print('Oh no! J')
except:
  # TODO
  print('Oh no!')
finally:
  print('Assert: %s' % ensure)
  # TODO
  # zip -Tv fff-0.1.20220327151223.xpi
  print('Assertions passed.')
