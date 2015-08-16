#include "mot.h"
#include <stdbool.h>
#include <wchar.h>

#define DWORD int
#define HANDLE int
#define LPCSTR char *
#define LPCVOID unsigned char *
#define LPDWORD DWORD *
#define LPWSTR wchar_t *
#define LPOVERLAPPED DWORD
#undef NULL
#define NULL 0
#define Sleep(x) usleep(x * 1000)

extern "C" {
long CommVersion(void);
bool OpenRadioPort(LPCSTR port, bool usehardmute);
bool HardResetRadio(void);
bool IsSysReady(void);
bool CloseRadioPort(void);
bool SetVolume(char volume);
bool PlayStream(char mode,unsigned long channel);
bool StopStream(void);
char VolumePlus(void);
char VolumeMinus(void);
void VolumeMute(void);
char GetVolume(void);
char GetPlayMode(void);
char GetPlayStatus(void);
long GetTotalProgram(void);
bool NextStream(void);
bool PrevStream(void);
long GetPlayIndex(void);
char GetSignalStrength(int *biterror);
char GetProgramType(char mode, long dabIndex);
char GetProgramText(wchar_t * programText);
bool GetProgramName(char mode, long dabIndex,char namemode, wchar_t * programName);
long GetPreset(char mode, char presetindex);
bool SetPreset(char mode, char presetindex, unsigned long channel);
bool DABAutoSearch(unsigned char startindex, unsigned char endindex);
bool DABAutoSearchNoClear(unsigned char startindex, unsigned char endindex);
bool GetEnsembleName(long dabIndex, char namemode, wchar_t * programName);
int GetDataRate(void);
bool SetStereoMode(char mode);
char GetFrequency(void);
char GetStereoMode(void);
char GetStereo(void);
bool ClearDatabase(void);
bool SetBBEEQ(char BBEOn, char EQMode, char BBELo, char BBEHi, char BBECFreq, char BBEMachFreq, char BBEMachGain, char BBEMachQ, char BBESurr, char BBEMp, char BBEHpF, char BBEHiMode );
bool GetBBEEQ(char *BBEOn, char *EQMode, char *BBELo, char *BBEHi, char *BBECFreq, char *BBEMachFreq, char *BBEMachGain, char *BBEMachQ, char *BBESurr, char *BBEMp, char *BBEHpF, char *BBEHiMode);
bool SetHeadroom(char headroom);
char GetHeadroom(void);
char GetApplicationType(long dabIndex);
bool GetProgramInfo(long dabIndex, unsigned char * ServiceComponentID, uint32 * ServiceID, uint16 * EnsembleID);
bool MotQuery(void);
void GetImage(wchar_t *ImageFileName);
void MotReset(MotMode enMode);
char GetDABSignalQuality(void);
char GetServCompType(long dabIndex);
bool SyncRTC(bool sync);
bool GetRTC(unsigned char *sec, unsigned char *min, unsigned char *hour, unsigned char *day, unsigned char *month, unsigned char* year);
int GetSamplingRate(void);
}

void HardMute(void);
void HardUnMute(void);
bool ReadSerialBytes (HANDLE serialhandle, unsigned char *buffer, DWORD noofbytestoread, DWORD *bytesreadreturn, DWORD exitFD);
bool WriteSerialBytes(HANDLE serialhandle, LPCVOID lpBuffer, DWORD nNumberOfBytesToWrite, LPDWORD lpNumberOfBytesWritten, LPOVERLAPPED lpOverlapped);
bool GoodHeader(unsigned char* input, DWORD dwBytes);