# Selenium Browser Extensiom
The Selenium browser extension is a plugin that enables Selenium IDE developers to record and replay Infrastructure (API, DB calls). It records these calls automatically while test-cases are being captured. 

## Contents
1. [Prerequisite](#prerequisite)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Supported Clients](#supported-clients)

## Prerequisite
1. Latest Google Chrome installed with a Google account and sync enabled.  
3. [Selenium IDE](https://www.selenium.dev/selenium-ide/) browser extenstion installed in the browser. 
4. Avoid having other extensions installed. Extensions such as `hoppscotch` can interfere with the keploy extension.

## Installation
### Load in Dev mode
1. Download the latest extension zip from here - `https://github.com/keploy/browser-extension/releases`
2. Unzip/Extract the file. You can use the UI or use the commandline, eg: `unzip ~/Downloads/keploy-browser-extension-v0.1.3.zip` 
3. Go to the extensions manager and enable Dev mode as shown in the image below.  
4. Click on the `Load unpacked` button and select the folder and your extension should be loaded.
<img width="757" alt="Screenshot 2022-08-23 at 11 29 19 AM" src="https://user-images.githubusercontent.com/12831254/186081488-c60e6a61-8527-47cc-9039-ac2266290b7a.png">

### Load from Chrome Web Store
Coming Soon!



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
1. Fetch is not supported yet. 
2. Since the outputs of dependency calls are stored in session storage, the recorded tests should not redirect to different origin.
3. Maybe other web-extensions can interfare. Please remove them during testing.
4. Sync should be enabled on google account because projectName is stored in chrome.storage.sync API.
5. Currently, it cannot be installed in firefox because firefox browser do not supports manifest version v3.
