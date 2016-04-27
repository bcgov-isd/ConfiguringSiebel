// The two specific constants should be defined in SiebelApp.Constants in the following way
// so that the Component Type and Version could be picked up by DISA Framework
// Note: the following block only needs to execute once before the first call to send message to DISA.
var consts = SiebelJS.Dependency("SiebelApp.Constants");
consts.set("WS_COMPONENT_TYPE_SYSINFO","plugin_sysinfo");
consts.set("WS_PLUGIN_SYSINFO_VERSION", "1.0.0");

// Create message handler and implement its interface.
// The following WSHandler and related codes could be added anywhere needed,
// however, generally we recommend to add it to the pmodel of corresponding component.
var sysinfoHandler = null;

function getSysInfoHandler() {
    if (sysinfoHandler === null) {
        sysinfoHandler = SiebelApp.WebSocketManager.CreateWSHandler(consts.get("WS_COMPONENT_TYPE_SYSINFO"));

        sysinfoHandler.OnClose = onWSClose;
        sysinfoHandler.OnFail = onSendFail;
        sysinfoHandler.OnMessage = onWSMessage;
    }

    return sysinfoHandler;
}

function unregisterSysInfoHandler() {
    if (sysinfoHandler) {
        sysinfoHandler.Unregister();
        sysinfoHandler = null;
    }
}

function onWSMessage(msg) {
    var hostAddr = msg["HostAddress"];
    var hostName = msg["HostName"];
    var processor = msg["Processor"];
    var userhome = msg["UserHome"];
    var content = "***System Information***\n"
                + "Host IP Address:" + hostAddr + "\n"
                + "Host Name:" + hostName + "\n"
                + "Processor Count:" + processor + "\n"
                + "User Home:" + userhome + "\n"

    // Append the information to a textarea
    var text = $(".siebui-email-rtc-text textarea");
    text.val(text.val() + content);
}

// Normally this indicates something wrong with the communication attempt with DISA
// * maybe because Siebel OpenUI never establishes connection with DISA due to various reasons
// * maybe because the version number at two sides are not matched, operator version should be equal or newer
// Reset state or other variables if necessary
function onSendFail() {
    SiebelJS.Debug("[DISA][Warning] Send message failed.");
}

// This indicates the Siebel OpenUI with DISA connection was lost
// * maybe because Siebel OpenUI never establishes connection with DISA due to various reasons
// * maybe because DISA exited (by user) or crashed
// Reset state or other variables if necessary
function onWSClose() {
    SiebelJS.Debug("[DISA][Warning] DISA connection was closed.");
}

// Send a message to DISA, include the command string "GetSysInfo"
// "GetSysInfo" is not DISA-specific, this is the the custom command we trap in the following line of the java code
//     --- if (msg.get(COMMAND).getAsString().equals("GetSysInfo")) {
function getSystemInformationFromDISA() {
    var handler = getSysInfoHandler();
    var msgJSON = {};
    msgJSON["Command"] = "GetSysInfo";
    handler.SendMessage(msgJSON);
}