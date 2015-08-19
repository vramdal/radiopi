#include <node.h>
#include <cstring>
#include <climits>
#include <cstdlib>
#include <locale>
#include "monkeyboard.h"


using namespace v8;

void ShutDown(const FunctionCallbackInfo<Value>& args) {
  CloseRadioPort();
}

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

/**
* Returns a string with the program text, if available and changed since last call. If the program text
* has not changed since last time this method was called, a boolean true is returned. If program text cannot
* be retrieved, a boolean false is returned.
*/
void GetProgramText(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);
    wchar_t buff[300];
    char cbuff[600];
    uint8 result = GetProgramText(buff);
    Local<Value> returnValue;
    if (result == 0) {
        wprintf(L"GetProgramText: %lu\n", result);
        wcstombs( cbuff, buff, wcslen(buff) );
        returnValue = String::NewFromUtf8(isolate, (const char *) cbuff, v8::String::kNormalString, wcslen(buff));
    } else if (result == 1) {
       returnValue = v8::Boolean::New(isolate, true);
    } else if (result == 255) {
       returnValue = v8::Boolean::New(isolate, false);
    }
    args.GetReturnValue().Set(returnValue);
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

void VolumeToggleMute(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   VolumeMute();
}

void ClearDatabase(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   ClearDatabase();
}

void CloseRadioPort(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   CloseRadioPort();
}

/** DEPRECATED 0-100 **/
void GetDABSignalQuality(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   args.GetReturnValue().Set((int) GetDABSignalQuality());
}

void GetSignalStrength(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   int *bitError = 0; // ignored
   args.GetReturnValue().Set((int) GetSignalStrength(bitError));
}

/** In kbps **/
void GetDataRate(const FunctionCallbackInfo<Value>& args) {
   Isolate* isolate = Isolate::GetCurrent();
   HandleScope scope(isolate);
   args.GetReturnValue().Set((int) GetDataRate());
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
  char* localeSet = setlocale(LC_CTYPE, "C.UTF-8");
  if (!localeSet) {
    fprintf(stderr, "Failed to set locale C.UTF-8 for DAB module communication");
  }
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
  NODE_SET_METHOD(exports, "toggleMute", VolumeToggleMute);
  NODE_SET_METHOD(exports, "clearDatabase", ClearDatabase);
  NODE_SET_METHOD(exports, "closeRadioPort", CloseRadioPort);
  NODE_SET_METHOD(exports, "getDABSignalQuality", GetDABSignalQuality);
  NODE_SET_METHOD(exports, "getDataRate", GetDataRate);
  NODE_SET_METHOD(exports, "getSignalStrength", GetSignalStrength);
}


NODE_MODULE(module_name, Initialize);