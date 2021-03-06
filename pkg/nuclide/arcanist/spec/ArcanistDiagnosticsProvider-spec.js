'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {BusySignalProviderBase} from '../../busy-signal-provider-base';
import {ArcanistDiagnosticsProvider} from '../lib/ArcanistDiagnosticsProvider';
import fs from 'fs';
import path from 'path';
import {track} from 'temp';
const temp = track();

describe('ArcanistDiagnosticsProvider', () => {
  let provider: any;
  let tempFile : string;

  beforeEach(() => {
    const folder = temp.mkdirSync();
    tempFile = path.join(folder, 'test');
    fs.writeFileSync(tempFile, /* data */ '');
    provider = new ArcanistDiagnosticsProvider(new BusySignalProviderBase());
  });

  it('should invalidate the messages when a file is closed', () => {
    spyOn(provider._providerBase, 'publishMessageInvalidation');
    waitsForPromise(async () => {
      const editor = await atom.workspace.open(tempFile);

      // The editor path may get changed (empiracally, prefixed with 'private/'),
      // so we 'getPath()' here.
      const filePath = editor.getPath();

      // We have to destroy panes themselves, not merely the pane items, in order
      // to trigger the callbacks that ArcanistDiagnosticsProvider registers on
      // atom.workspace.onWillDestroyPaneItem.
      const theOnlyPane = atom.workspace.getPanes()[0];
      theOnlyPane.destroy();

      expect(provider._providerBase.publishMessageInvalidation).toHaveBeenCalledWith({
        scope: 'file',
        filePaths: [filePath],
      });
    });
  });

  it('should not invalidate the messages when there are multiple buffers with the file', () => {
    spyOn(provider._providerBase, 'publishMessageInvalidation');
    waitsForPromise(async () => {
      await atom.workspace.open(tempFile);
      // Open a second pane, containing a second editor with the same file.
      const paneToSplit = atom.workspace.getPanes()[0];
      paneToSplit.splitLeft({copyActiveItem: true});

      // We have to destroy panes themselves, not merely the pane items, in order
      // to trigger the callbacks that ArcanistDiagnosticsProvider registers on
      // atom.workspace.onWillDestroyPaneItem.
      paneToSplit.destroy();
      expect(provider._providerBase.publishMessageInvalidation).not.toHaveBeenCalled();
    });
  });
});
