/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';

// Only missing path components are optional. In particular, existsSync would
// turn dangling links, access errors and non-directory parents into false skips.
export function optionalDirectory(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try { fs.lstatSync(current); }
    catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
    if (!fs.statSync(current).isDirectory()) throw new Error(`Dependency path is not a directory: ${current}`);
  }
  return true;
}

export function optionalPackageEntry(root, relative, entry) {
  if (!optionalDirectory(root, relative)) return null;
  const file = path.join(root, relative, entry);
  // A present package must supply its entry point. Import/runtime errors are
  // handled by the caller and must not be reclassified as absence.
  if (!fs.statSync(file).isFile()) throw new Error(`Dependency entry is not a file: ${file}`);
  return file;
}
