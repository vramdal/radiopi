INCLUDE_DIRECTORIES(lib /home/pi/lib)

cmake_minimum_required(VERSION 2.8.4)
project(monkeyboard)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(SOURCE_FILES
    monkeyboard.cpp
    monkeyboard.hpp
)

add_executable(monkeyboard ${SOURCE_FILES})
