cmake_minimum_required (VERSION 3.22)
project (gs1encoders)

set(version "1.0")

file(
GLOB
LIB_SOURCE_FILES
../c-lib/ai.c
../c-lib/dl.c
../c-lib/scandata.c
../c-lib/syn.c
../c-lib/gs1encoders.c
../c-lib/syntax/gs1syntaxdictionary.c
../c-lib/syntax/lint_*.c
)

add_compile_definitions(GS1_LINTER_ERR_STR_EN)

add_library(gs1encoders SHARED ${LIB_SOURCE_FILES} gs1encoders_wrap.c)
target_include_directories(gs1encoders PRIVATE gs1encoders ../c-lib)
