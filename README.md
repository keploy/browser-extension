# browser-extension
Selenium extension to automatically record and mock the backend calls using Keploy for testing.
This extension is of manifest version-3.  

## Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [Supported Clients](#supported-clients)

## Installation
Just need to install the web extension and make sure that sync is enabled on your google 
account. It will automatically configure with Selenium-IDE for testing.

## Usage
### Record
All the external calls will be recorded during recording in Selenium-IDE. Steps for recording:
1. Open the Selenium-Ide and load the project.
2. Create a new test (testName should not be "Untitled").
3. Enter the URL and start doing assertions.
4. Stop the selenium recorder before closing the recoding tab.

### Playback
The external calls are mocked with the recorded outputs during playback of the selenium test. Steps to playback:
1. Run the selenium recorded tests.

## Supported Clients
### XMLHttpRequests 
Overrides the send method and records the outputs of http calls during recording. And uses mock-xmlhttprequest 
to return the mocked response.

## Limitations
1. Since the outputs of dependency calls are stored in session storage, the recorded tests should not redirect to different origin.
2. Maybe other web-extensions can interfare. Please remove them during testing.
3. Sync should be enabled on google account because projectName is stored in chrome.storage.sync API.
4. Currently, it cannot be installed in firefox because firefox browser do not supports manifest version v3.
