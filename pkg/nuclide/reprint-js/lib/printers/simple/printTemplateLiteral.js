'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines, Print} from '../../types/common';
import type {TemplateLiteral} from 'ast-types-flow';

const markers = require('../../constants/markers');
const wrapExpression = require('../../wrappers/simple/wrapExpression');

function printTemplateLiteral(print: Print, node: TemplateLiteral): Lines {
  const wrap = x => wrapExpression(print, node, x);
  const {quasis, expressions} = node;
  return wrap([
    '`',
    quasis.map((q, i) => [
      i > 0
        ? [
          '${',
          markers.openScope,
          markers.scopeIndent,
          markers.scopeBreak,
          print(expressions[i - 1]),
          markers.scopeBreak,
          markers.scopeDedent,
          markers.closeScope,
          '}',
        ]
        : markers.empty,
      print(q),
    ]),
    '`',
  ]);
}

module.exports = printTemplateLiteral;
