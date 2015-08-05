#ifndef monkeyboard_hpp
#define monkeyboard_hpp

// C standard library
#include <cstdlib>
#include <ctime>
#include <errno.h>

#include <stdint.h>
#include <stdlib.h>
#include <cstring>
#include <iostream>

using namespace std;
extern "C" {
}

class MonkeyBoard {
public:
    MonkeyBoard();
    MonkeyBoard(uint8_t chip, uint8_t width, uint8_t hieght);
    ~MonkeyBoard();
private:

};

#endif