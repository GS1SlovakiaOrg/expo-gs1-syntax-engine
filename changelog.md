# Changelog

## vxxx
- add aiDataPairs type to exported types

## v0.1.6
- breaking changes
    - updated method getEngineResultData
        - updated the value of returned "aiDataPairs" property
            - from aiDataPairs[`${aiValue}`] = dataValue
            - to aiDataPairs[`${aiValue}`] = {value: `${dataValue}`, name: `${aiName}`};
        - changes the return of method processBarcode
            - check "updated method getEngineResultData"
    - removed stringKeyValPair type
        - no longer needed
- Create NOTICE
    - NOTICE that project contains portions of the GS1 Barcode Syntax Engine developed by GS1 AISBL.
- Update Readme
    - Third-party software notice
- update package
    - remove jest
    - update dependencies

## v0.1.5
- update Readme
    - update example code
- Add getErrorReason method
    - method to extract shorter and easier to understand error message
- Update getEngineResultData method and types
    - add aimPrefix to method return
    - add errorReason to method return
        - easy to understand error message
- Add examples to example app

## v0.1.4
- root folder reorganization
- update dependencies
- add comments

## v0.1.3
- updated package.json configuration

## v0.1.2
- new npm publish
    - no changes

## v0.1.1
- initial release