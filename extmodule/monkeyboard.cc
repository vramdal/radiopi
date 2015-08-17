#include <nan.h>
#include <node.h>
#include "monkeyboard.h"  // NOLINT(build/include)


using namespace v8;

// Simple synchronous access to the `Estimate()` function

void ShutDown(const FunctionCallbackInfo<Value>& args) {
  CloseRadioPort();
}

/*NAN_METHOD(DoScan) {
  // expect a number as the first argument
  //int points = info[0]->Uint32Value();

    char radiostatus;
    char freq;
    int totalprogram;

    wprintf(L"Searching for DAB stations.....\n");
    if (DABAutoSearch(0, 40) == true) {
        fflush(stdout);
        radiostatus = 1;
        while (radiostatus == 1) {
            freq = GetFrequency();
            totalprogram = GetTotalProgram();
            wprintf(L"Scanning index %d, found %d programs\n", freq, totalprogram);
            radiostatus = GetPlayStatus();
        }
    }
  info.GetReturnValue().Set(0);
}*/

void DoScan(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);
    if (!args[0]->IsFunction()) {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "First argument should be a callback function")));
        return;
    }

    Handle<Function> callback = Handle<Function>::Cast(args[0]);

    char radiostatus;
    char freq;
    int totalprogram;

    wprintf(L"Searching for DAB stations.....\n");
    if (DABAutoSearch(0, 40) == true) {
        fflush(stdout);
        radiostatus = 1;
        Local<Value> cbArgs[4];
        cbArgs[0] = Local<Value>::New(isolate, Integer::New(isolate, radiostatus));
        while (radiostatus == 1) {
            freq = GetFrequency();
            totalprogram = GetTotalProgram();
            wprintf(L"Scanning index %d, found %d programs\n", freq, totalprogram);
            radiostatus = GetPlayStatus();
            cbArgs[0] = Local<Value>::New(isolate, Null(isolate));
            cbArgs[1] = Local<Value>::New(isolate, Integer::New(isolate, radiostatus));
            cbArgs[2] = Local<Value>::New(isolate, Integer::New(isolate, totalprogram));
            cbArgs[3] = Local<Value>::New(isolate, Integer::New(isolate, freq));
            callback->Call(isolate->GetCurrentContext()->Global(), 4, cbArgs);
        }

      args.GetReturnValue().Set(0);
    } else {
      args.GetReturnValue().Set(1);
    }
}

void GetProgramText(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);
    wchar_t buff[300];
    char cbuff[600];
    GetProgramText(buff);
    wcstombs( cbuff, buff, wcslen(buff) );
    Local<String> str = String::NewFromUtf8(isolate, (const char *) cbuff, v8::String::kNormalString, wcslen(buff));
    args.GetReturnValue().Set(str);
}

void GetPrograms(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  wchar_t buff[300];
  char cbuff[600];
  int totalprogram, i;

  totalprogram = GetTotalProgram();
  Local<v8::Array> ARRAY = Array::New(isolate, totalprogram);

  for (i=0;i<totalprogram;i++) {

  char programType = GetProgramType(0, i);
  char applicationType = GetApplicationType(i);

  if (GetProgramName(0, i, 1, buff)) {
	wprintf(L"%ls\n", buff);
    wcstombs( cbuff, buff, wcslen(buff) );
    Local<String> str = String::NewFromUtf8(isolate, (const char *) cbuff, v8::String::kNormalString, wcslen(buff));
    Local<Number> programTypeNumber = Number::New(isolate, (int) programType);
    Local<Number> dabIndexNumber = Number::New(isolate, i);
    Local<Number> applicationTypeNumber = Number::New(isolate, applicationType);
    Local<Object> obj = Object::New(isolate);
    obj->Set(String::NewFromUtf8(isolate, "dabIndex"), dabIndexNumber);
    obj->Set(String::NewFromUtf8(isolate, "channel"), str);
    obj->Set(String::NewFromUtf8(isolate, "programType"), programTypeNumber);
    obj->Set(String::NewFromUtf8(isolate, "applicationType"), applicationTypeNumber);
    ARRAY->Set(i, obj);
	}
  }

  args.GetReturnValue().Set(ARRAY);
}

void GetPlayStatus(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  args.GetReturnValue().Set((int) GetPlayStatus());
}

void GetPlayIndex(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  args.GetReturnValue().Set((int) GetPlayIndex());
}

void PlayStream(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   uint8 mode = args[0]->IntegerValue();
   long channel = args[1]->Uint32Value();
   bool result = PlayStream(mode, channel);
   MotReset(MOT_HEADER_MODE);
   MotReset(MOT_DIRECTORY_MODE);
   args.GetReturnValue().Set((bool) result);
}

void PrevStream(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   bool result = PrevStream();
   MotReset(MOT_HEADER_MODE);
   MotReset(MOT_DIRECTORY_MODE);
   args.GetReturnValue().Set((bool) result);
}

void NextStream(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   bool result = NextStream();
   MotReset(MOT_HEADER_MODE);
   MotReset(MOT_DIRECTORY_MODE);
   args.GetReturnValue().Set((bool) result);
}

/** 0-16 */
void SetVolume(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   uint8 volume = args[0]->IntegerValue();
   bool result = SetVolume(volume);
   args.GetReturnValue().Set((bool) result);
}

void GetVolume(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   args.GetReturnValue().Set((int) GetVolume());
}

void VolumeMinus(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   args.GetReturnValue().Set((int) VolumeMinus());
}

void VolumePlus(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   args.GetReturnValue().Set((int) VolumePlus());
}

void asyncTest(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  if (!args[0]->IsFunction()) {
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "First argument should be a callback function")));
    return;
  }

  Handle<Function> callback = Handle<Function>::Cast(args[0]);  
  Local<Value> cbArgs[2];
  cbArgs[0] = Local<Value>::New(isolate, Null(isolate));
  cbArgs[1] = Local<Value>::New(isolate, Integer::New(isolate, 1));
  callback->Call(isolate->GetCurrentContext()->Global(), 2, cbArgs);
}

void Initialize(Handle<Object> exports) {
  if(OpenRadioPort((char*) "/dev/ttyACM0", true)!=true) {
    fprintf(stderr, "Error on opening radio port /dev/ttyACM0\n");
  }
  NODE_SET_METHOD(exports, "getPrograms", GetPrograms);
  NODE_SET_METHOD(exports, "getPlayIndex", GetPlayIndex);
  NODE_SET_METHOD(exports, "shutDown", ShutDown);
  NODE_SET_METHOD(exports, "getPlayStatus", GetPlayStatus);
  NODE_SET_METHOD(exports, "scan", DoScan);
  NODE_SET_METHOD(exports, "asyncTest", asyncTest);
  NODE_SET_METHOD(exports, "playStream", PlayStream);
  NODE_SET_METHOD(exports, "getVolume", GetVolume);
  NODE_SET_METHOD(exports, "setVolume", SetVolume);
  NODE_SET_METHOD(exports, "getProgramText", GetProgramText);
  NODE_SET_METHOD(exports, "volumeMinus", VolumeMinus);
  NODE_SET_METHOD(exports, "volumePlus", VolumePlus);
  NODE_SET_METHOD(exports, "prevStream", PrevStream);
  NODE_SET_METHOD(exports, "nextStream", NextStream);
}


NODE_MODULE(module_name, Initialize);

/*NAN_METHOD(GetPrograms) {
	wchar_t buff[300];
	char cbuff[600];
	int totalprogram, i;

	totalprogram = GetTotalProgram();
    Local<v8::Array> ARRAY = Array::New(v8::Isolate::GetCurrent(), totalprogram);
	for (i=0;i<totalprogram;i++) {

	  if (GetProgramName(0, i, 1, buff)) {
		wprintf(L"%ls\n", buff);
        wcstombs( cbuff, buff, wcslen(buff) );
        Local<T> str = New(v8::Isolate::GetCurrent(), cbuff, strlen(cbuff));
        ARRAY->Set(i, str);
	  }
	}
   //Nan::ReturnValue(ARRAY);
   //info.GetReturnValue().Set(Nan::New<v8::Array>())
   info.GetReturnValue().Set(ARRAY);
}
*/
/*NAN_METHOD(NextStream) { NextStream(); }
NAN_METHOD(PrevStream) { PrevStream(); }
NAN_METHOD(GetPlayIndex) { info.GetReturnValue().Set((int) GetPlayIndex()); }
NAN_METHOD(GetPlayMode) { info.GetReturnValue().Set((int) GetPlayMode()); }
NAN_METHOD(GetPlayStatus) { info.GetReturnValue().Set((int) GetPlayStatus()); }
NAN_METHOD(SetVolume) {
  uint8 volume = info[0]->IntegerValue();
  SetVolume(volume);
}
NAN_METHOD(PlayStream) {
  uint8 mode = info[0]->IntegerValue();
  long channel = info[1]->Uint32Value();
  PlayStream(mode, channel);
  MotReset(MOT_HEADER_MODE);
  MotReset(MOT_DIRECTORY_MODE);
}


NAN_MODULE_INIT(InitAll) {
  Set(target, New<String>("doScan").ToLocalChecked(),
    New<FunctionTemplate>(DoScan)->GetFunction());
  Set(target, New<String>("nextStream").ToLocalChecked(),
    New<FunctionTemplate>(NextStream)->GetFunction());
  Set(target, New<String>("prevStream").ToLocalChecked(),
    New<FunctionTemplate>(PrevStream)->GetFunction());
  Set(target, New<String>("init").ToLocalChecked(),
    New<FunctionTemplate>(Init)->GetFunction());
  Set(target, New<String>("shutdown").ToLocalChecked(),
    New<FunctionTemplate>(Shutdown)->GetFunction());
  Set(target, New<String>("getPlayIndex").ToLocalChecked(),
    New<FunctionTemplate>(GetPlayIndex)->GetFunction());
  Set(target, New<String>("getPlayStatus").ToLocalChecked(),
    New<FunctionTemplate>(GetPlayStatus)->GetFunction());
  Set(target, New<String>("playStream").ToLocalChecked(),
    New<FunctionTemplate>(PlayStream)->GetFunction());
  Set(target, New<String>("getPlayMode").ToLocalChecked(),
    New<FunctionTemplate>(GetPlayMode)->GetFunction());
  Set(target, New<String>("getPrograms").ToLocalChecked(),
    New<FunctionTemplate>(GetPrograms)->GetFunction());
  Set(target, New<String>("setVolume").ToLocalChecked(),
    New<FunctionTemplate>(SetVolume)->GetFunction());
}

NODE_MODULE(addon, InitAll)

*/