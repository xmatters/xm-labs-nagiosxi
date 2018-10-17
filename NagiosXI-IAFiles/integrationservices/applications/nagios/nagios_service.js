importPackage(java.lang);
importPackage(java.sql);
importPackage(java.util);
importPackage(java.io);
importPackage(Packages.javax.xml);
importPackage(Packages.javax.xml.parsers);
importPackage(Packages.javax.xml.transform);
importPackage(Packages.javax.xml.transform.dom);
importPackage(Packages.javax.xml.transform.stream);
importPackage(Packages.org.w3c.dom);


load("lib/integrationservices/javascript/event.js");
load("integrationservices/applications/nagios/configuration_service.js");

function apia_remapped_data() {
	return {
		"priority" : "priority"
	}
}

function apia_event(form)
{
	//The comment below demonstrates how to update a property value.
	//form.properties.city = "Victoria";
	
	form.recipients = [ { "targetName": form.properties.hostgroupname } ]
	return form;	
}

function apia_callback(msg)
{
  var str = "Received message from xMatters:\n";
  str += "Incident: " + msg.incident_id;
  str += "\nEvent Id: " + msg.eventidentifier;
  str += "\nCallback Type: " + msg.xmatters_callback_type;
  str += "\nRecipient: " + msg.recipient;
  str += "\nDevice: " + msg.device;
  str += "\nResponse: " + msg.response;
  str += "\nAnnotation: " + msg.annotation;
  str += "\nEvent Properties: " + msg.eventProperties;
  str += "\nMsg: " + msg.additionalTokens;
  str += "\nHost?: " + msg.additionalTokens.host;

  IALOG.debug(str);

  // Check to see if this is a response and not
  // a deliveryStatus or status type callback.
  //**********************************************************
  // External commands that are written to the command file have the following format
  // [time] command_id;command_arguments
  // full listing of external commands can be found online at the following URL:
  // http://www.nagios.org/developerinfo/externalcommands/
  //**********************************************************

  if( msg.xmatters_callback_type == 'response' ) {
    // Append to NAGIOS_COMMAND_FILE
    var nagiosCmdStr = "";
	var nagiosCmdStrSSD = "";
    var timestamp = Math.round((new Date()).getTime()/1000);
	var timestamp_end = Math.round((new Date()).getTime()/1000);

    if ( msg.response == "Acknowledge" ) {
      var comment = "Acknowledgement from xMatters by " + msg.recipient + " - " + msg.device;
      if (msg.annotation != "null") {
        comment += " - " + msg.annotation
      }

      // Command Format:
      // ACKNOWLEDGE_SVC_PROBLEM;<host_name>;<sticky>;<notify>;<persistent>;<author>;<comment>
      nagiosCmdStr = "[" + timestamp + "] ACKNOWLEDGE_SVC_PROBLEM;" + msg.additionalTokens.host + ";" + msg.additionalTokens.service + ";2;1;1;" + msg.recipient + ";" + comment + " \\n";

      var output = execute(nagiosCmdStr);
    }
    else if ( msg.response == "Refuse" ) {
      var comment = "Refuse from xMatters by " + msg.recipient + " - " + msg.device;
      if (msg.annotation != "null") {
        comment += " - " + msg.annotation
      }

      // Command Format:
      // ADD_SVC_COMMENT;<host_name>;<service_description>;<persistent>;<author>;<comment>
      nagiosCmdStr = "[" + timestamp + "] ADD_SVC_COMMENT;" + msg.additionalTokens.host + ";" + msg.additionalTokens.service + ";1;" + msg.recipient + ";" + comment + " \\n";

      var output = execute(nagiosCmdStr);
    }
    else if ( msg.response == "SchedDown60" ) {
	  var duration = 3600;
	  timestamp_end = timestamp + duration;

      var comment = "Acknowledgement from xMatters by " + msg.recipient + " - " + msg.device;
      if (msg.annotation != "null") {
        comment += " - " + msg.annotation
      }

      // Command Format:
      // ACKNOWLEDGE_SVC_PROBLEM;<host_name>;<sticky>;<notify>;<persistent>;<author>;<comment>
      nagiosCmdStr = "[" + timestamp + "] ACKNOWLEDGE_SVC_PROBLEM;" + msg.additionalTokens.host + ";" + msg.additionalTokens.service + ";2;1;1;" + msg.recipient + ";" + comment + " \\n";

      var output = execute(nagiosCmdStr);

      // Command Format: 
	  // SCHEDULE_SVC_DOWNTIME;<host_name>;<service_desription><start_time>;<end_time>;<fixed>;<trigger_id>;<duration>;<author>;<comment>
	  nagiosCmdStrSSD = "[" + timestamp + "] SCHEDULE_SVC_DOWNTIME;" + msg.additionalTokens.host + ";" + msg.additionalTokens.service + ";" + timestamp + ";" + timestamp_end + ";1;0;3600;" + msg.recipient + ";" + comment + " \\n";

	  var output = execute(nagiosCmdStrSSD);
	  }
    else {
      // unrecognized response, do nothing
    }
  }
}

/**
 * This method returns the output produced by executing the specified command.
 *
 * @param cmd - the command to execute
 *
 * @throws SecurityException - If a security manager exists and its checkExec method doesn't allow creation of the subprocess 
 * @throws IOException - If an I/O error occurs
 * @throws NullPointerException - If command is null
 * @throws IllegalArgumentException - If command is empty
 * @throws RuntimeException - If executing command results in a non-0 exit value
 *
 * @return a non-null String
 */

function execute(cmd) 
{
  IALOG.info("function execute: " + cmd);

  // Build commands string array 
  var  commands = [
    "/usr/local/xmatters/integrationagent-5.1.7/integrationservices/applications/nagios/printf_redirect.sh",
    cmd,
    NAGIOS_COMMAND_FILE
  ];

  IALOG.debug("commands: " + commands);

  var process = Runtime.getRuntime().exec(commands);

  // Wait for the process to complete.
  process.waitFor();

  // Handle the normal and error cases.
  if (process.exitValue() == 0) 
  {
    return copyToString(process.getInputStream()); 
  } 
  else 
  {
    throw new RuntimeException("The command '" + cmd + "' failed with exit value " + process.exitValue());
    IALOG.info("The command '" + cmd + "' failed with exit value " + process.exitValue());
  }
}

/**
 * This method returns the contents of the specified input stream as a string.
 *
 * @throws IOException - If an I/O error occurs
 * @throws NullPointerException - If inputstream is null
 * 
 * @return a non-null String
 */
function copyToString(inputstream) 
{
  // Store output in a string buffer.
  var buf = new StringWriter();
  var writer = new BufferedWriter(buf);
  
  // Always close reader before returning.
  var reader = new BufferedReader(new InputStreamReader(inputstream));
  try 
  {
    // Copy one line at a time.
    var line = reader.readLine();
    while (line != null)
    {
      writer.write(line);
      writer.newLine();
      line = reader.readLine();
    } 
    
    // Return the output.
    writer.flush();
    return buf.toString();
    
  } 
  finally 
  {
    reader.close();
  }
}
