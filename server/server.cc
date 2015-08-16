#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include "KeyStoneCOMM.h"
#include <locale.h>


const char* OutputName = "name.txt";
const char* OutputText = "text.txt";
const char* OutputRate = "rate.txt";
const char* OutputStrength = "strength.txt";
const char* OutputEnsemble = "Ensemble.txt";
const char* OutputList = "list.txt";


void ClearFiles(void)
{

  FILE *name;				//Clear channelname
  name = fopen (OutputName, "w");
  fprintf(name, "\n");
  fclose(name);

  FILE *text;				//Clear radiotext
  text = fopen (OutputText, "w");
  fprintf(text, "\n");
  fclose(text);

  FILE *Ensemble;				//Clear ensemble
  Ensemble = fopen (OutputEnsemble, "w");
  fprintf(Ensemble, "\n");
  fclose(Ensemble);

  FILE *Strength;				//Clear strength
  Strength = fopen (OutputStrength, "w");
  fprintf(Strength, "\n");
  fclose(Strength);

  FILE *rate;				//Clear bitrate
  rate = fopen (OutputRate, "w");
  fprintf(rate, "\n");
  fclose(rate);

}


void Switch(unsigned long int prog)
{
  wchar_t buff[300];

  if(PlayStream(0, prog)!=true) {
    fprintf(stderr, "Error on setting program\n");
  }

  MotReset(MOT_HEADER_MODE);
  long playindex = GetPlayIndex();

  FILE *text;				//Clear radiotext
  text = fopen (OutputText, "w");
  fprintf(text, "\n");
  fclose(text);

  if(GetProgramName(0, playindex, 1, buff)!=true) {
    fprintf(stderr, "Error on getting Program name\n");
  }

  FILE *name;
  name = fopen (OutputName, "w");
  if (name == NULL) {
    fprintf(stderr, "Error on writing output file, ensure directory is writable for this user\n");
  }
  fprintf(name, "%ls\n", buff);
  fclose(name);

  GetEnsembleName(playindex, 1, buff);
  FILE *Ensemble;
  Ensemble = fopen (OutputEnsemble, "w");
  fprintf(Ensemble, "%ls\n", buff);
  fclose(Ensemble);
}

void DoScan(void)
{
	char radiostatus;
	int totalprogram, i;
	wchar_t buff[300];

	if (DABAutoSearchNoClear(0,40)==true) {
		fflush(stdout);
		radiostatus=1;
		while (radiostatus==1) {
			radiostatus = GetPlayStatus();
		}
	}

	FILE *list;				//Write channellist
	list = fopen (OutputList, "w");
	totalprogram = GetTotalProgram();
	for (i=0;i<totalprogram;i++) {

	  if (GetProgramName(0, i, 1, buff)) {
		fprintf(list, "%ls\n", buff);
		//fprintf(stderr, "%ls\n", buff);
	  }
	}
	fclose(list);
}


int main(int argc, char *argv[])
{

setlocale(LC_ALL, "");

unsigned long int program = 1, totalProgram;
unsigned int portno = 20000;
wchar_t buff[300];
int bitError, bitErrorOld = 200, bitErrorNew;
int datarate, i;


if(argc!=3) {
  wprintf(L"Commandline not korrekt, defaults loaded.\n");
  }
else {
  program = atoi(argv[1]);
  portno = atoi(argv[2]);
}

wprintf(L"channel=%u, port=%d\n", program, portno);

int create_socket, new_socket = 0;
socklen_t addrlen;
char *buffer = (char*)malloc (10);
struct sockaddr_in address;
long save_fd;
const int y = 1;
if ((create_socket=socket( AF_INET, SOCK_STREAM, 0)) > 0)
  fprintf(stderr, "TCP-socket created\n");

address.sin_family = AF_INET;
address.sin_addr.s_addr = INADDR_ANY;
address.sin_port = htons (portno);
setsockopt( create_socket, SOL_SOCKET, SO_REUSEADDR, &y, sizeof(int) );
if (bind( create_socket, (struct sockaddr *) &address, sizeof (address)) == 0 ) {
  fprintf (stderr, "Binding Socket\n");
}
listen (create_socket, 5);
addrlen = sizeof (struct sockaddr_in);
save_fd = fcntl( create_socket, F_GETFL );
save_fd |= O_NONBLOCK;
fcntl( create_socket, F_SETFL, save_fd );

ClearFiles();

if(OpenRadioPort((char*) "/dev/ttyACM0", true)!=true) {
  fprintf(stderr, "Error on opening radio port /dev/ttyACM0\n");
}

totalProgram = GetTotalProgram();
SetVolume(10);
SetStereoMode(1);
if(SetBBEEQ(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)==false) {
  fprintf(stderr, "Can't set BBEEQ\n");
}

if (totalProgram<0) {
  fprintf(stderr, "No programs on the module, starting scan.\n");
  DoScan();
}

//DoScan();

if (program > 0) {
  if (program <= totalProgram) {
    Switch(--program);
    datarate = 0;
  }
  else {
    fprintf (stderr, "Channelnumber out of range.\n");
  }
}
else {
  fprintf (stderr, "Channelnumber out of range.\n");
}

while(1) {
	GetPlayStatus();

	bitErrorNew = GetSignalStrength(&bitError);
	if(bitErrorNew!=bitErrorOld) {
	    bitErrorOld = bitErrorNew;

	    FILE *strength;				//Write strength
	    strength = fopen (OutputStrength, "w");
	    fprintf(strength, "%d\n", bitErrorNew);
	    fclose(strength);

	    if(datarate<1) {
	      datarate = GetDataRate();
	      if(datarate>1) {
		FILE *rate;				//Write bitrate
		rate = fopen (OutputRate, "w");
		fprintf(rate, "%d kbit/s\n", datarate);
		fclose(rate);
	      }
	    }
	}

	if(GetProgramText(buff)==0) {
		FILE *text;				//Write radiotext
		text = fopen (OutputText, "w");
		fprintf(text, "%ls\n", buff);
		fclose(text);
	}

	if (MotQuery()) {
	  GetImage(buff);
	}


	if (new_socket <= 0) {

	  new_socket = accept ( create_socket,
			    (struct sockaddr *) &address,
			    &addrlen );
	  if (new_socket > 0) {
	    fprintf (stderr, "Client %s is connected...\n", inet_ntoa (address.sin_addr));
	    bzero(buffer, 10);
	  }
	  else {
	    continue; // back to begin of the loop
	  }
	}
	else {

	  // Socket to NON-Blocking
	  save_fd = fcntl( new_socket, F_GETFL );
	  save_fd |= O_NONBLOCK;
	  fcntl( new_socket, F_SETFL, save_fd );

	  read(new_socket, buffer, 10);
	  if (strncmp (buffer, "", 3) != false) {
	    fprintf(stderr, "%s", buffer);

	    switch(buffer[0]) {
	      case '1'...'9':
		program = atoi(buffer);
		if (program-- > 0) {
		  if (program < totalProgram) {
		    Switch(program);
		    datarate = 0;
		  }
		  else {
		    write(new_socket, "Channelnumber too high.\n", 23);
		  }
		}
	      break;

	      case 'v':
		VolumeMinus();
		write(new_socket, "turn up sound\n", 7);
	      break;

	      case 'V':
		VolumePlus();
		write(new_socket, "turn down sound\n", 7);
	      break;

	      case 'm':
		VolumeMute();
		write(new_socket, "mute\n", 5);
	      break;

	      case 'S':
		program = GetPlayIndex();
		ClearFiles();
		FILE *name;
		name = fopen (OutputName, "w");
		fprintf(name, "Ergänzender Suchlauf...\n");
		fclose(name);
		write(new_socket, "Supplemental search...\n", 25);
		DoScan();
		totalProgram = GetTotalProgram();
		if (totalProgram==0) {
		  name = fopen (OutputName, "w");
		  fprintf(name, "Keine Sender gefunden!\n");
		  fclose(name);
		  write(new_socket, "No channels found.\n", 25);
		}
		else {
		  Switch(program);
		  datarate = 0;
		}
	      break;

	      case 'A':
		program = GetPlayIndex();
		i = GetVolume();
		ClearFiles();
		name = fopen (OutputName, "w");
		fprintf(name, "Neuer Suchlauf...\n");
		fclose(name);
		write(new_socket, "New search...\n", 19);
		ClearDatabase();
		DoScan();
		totalProgram = GetTotalProgram();
		if (totalProgram==0) {
		  name = fopen (OutputName, "w");
		  fprintf(name, "Keine Sender gefunden!\n");
		  fclose(name);
		  write(new_socket, "No channels found.\n", 25);
		}
		else {
		  Switch(program);
		  SetStereoMode(1);
		  SetVolume(i);
		  datarate = 0;
		}
	      break;

	      case 'Q':
		ClearFiles();
		write(new_socket, "Quit.\n", 9);
		fcloseall();
		CloseRadioPort();
		close (create_socket);
		return 0;
	      break;

	    }

	    bzero(buffer, 10);
	    //close (new_socket);	//uncomment for control with single command like "echo "8" | netcat localhost 20000"
	    //new_socket = 0;		//uncomment for control with single command like "echo "8" | netcat localhost 20000"
	  }
	}
}


}