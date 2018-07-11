'use strict';

import * as cp from 'child_process';
import log from './logger';
import * as path from "path";

// mapPaths takes an array of paths/strings with env vars, and expands each one

export const mapPaths = (searchRoots: Array<string>, cb: Function) => {

  const mappedRoots = searchRoots.map(function (v) {
    return `echo "${v}"`;
  });

  const k = cp.spawn('bash');

  k.stdin.end(mappedRoots.join(';'));
  const results: Array<string> = [];
  k.stderr.pipe(process.stderr);

  k.stdout.on('data', (d: string) => {
    String(d || '').split('\n')
    .map(v => String(v || '').trim())
    .filter(Boolean).forEach(v => {
      results.push(v);
    });
  });

  k.once('error', (e) => {
    log.error(e.stack || e);
    cb(e);
  });

  k.once('exit', code => {

    if (code > 0) {
      log.error('Could not map paths.');
      return cb(code);
    }

    const pths: Array<string> = [];

    results.map(d => String(d || '').trim())
    .filter(Boolean)
    .sort((a, b) => (a.length - b.length))
    .forEach(v => {

      const s = !pths.some(p => {
        return v.startsWith(p + '/');
      });

      if (s) {
        pths.push(v);
      }

    });

    console.log('the paths:', pths);
    cb(code, pths);

  });
};
