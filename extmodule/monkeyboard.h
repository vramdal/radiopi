/*********************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2015 NAN contributors
 *
 * MIT License <https://github.com/nodejs/nan/blob/master/LICENSE.md>
 ********************************************************************/

#ifndef MONKEYBOARD_SYNC_H
#define MONKEYBOARD_SYNC_H

#include <nan.h>

extern "C" {
#include "KeyStoneCOMM.h"
}

NAN_METHOD(DoScan);
NAN_METHOD(NextStream);
NAN_METHOD(PrevStream);
NAN_METHOD(Init);
NAN_METHOD(Shutdown);
NAN_METHOD(GetPlayIndex);
/*
	 0: Playing, 1: Searching, 2: Tuning, 3: Top, 4: Sorting, 5: Reconfiguring
	 -1: Failed
*/
NAN_METHOD(GetPlayStatus);
NAN_METHOD(GetPlayMode);
NAN_METHOD(PlayStream);
NAN_METHOD(GetPrograms);
/** 0-16 */
NAN_METHOD(SetVolume);

#endif  // EXAMPLES_ASYNC_PI_ESTIMATE_SYNC_H_
