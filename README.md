# Nagios XI
Nagios is a long favored monitoring solution for companies across the spectrum. XI adds much functionality and commercial support. 

This integration is targeted for Nagios XI, if you are looking for Nagios Core, check [here](https://github.com/xmatters/xm-labs-nagios)

<kbd>
  <img src="https://github.com/xmatters/xMatters-Labs/raw/master/media/disclaimer.png">
</kbd>

# Pre-Requisites
* Nagios XI
* xMatters integration agent 5.1.8 - Download and documentation [here](https://support.xmatters.com/hc/en-us/articles/201463419-Integration-Agent-for-xMatters-5-x-xMatters-On-Demand)
* xMatters account - If you don't have one, [get one](https://www.xmatters.com)!

# Files
* [NagiosXI-IAFiles.zip](NagiosXI-IAFiles.zip) - Integration Agent integration service files. 
* [NagiosXICommPlan.zip](NagiosXICommPlan.zip) - The Comm Plan for uploading to xMatters On Demand.


# How it works
A contact with a notification command is notified when a host or service goes critical. The command fires to the Integration Agent and passes all the relevant information. The Integration Agent builds the payload and makes a REST call to the Integration Builder which creates the event. Responses are then sent back to the Integration Agent (through IA polling to xMoD) and Nagios is updated. 

# Installation

## xMatters set up

**Pre-steps**: Install and configure the Integration Agent on the same box as Nagios XI. See details [here](https://support.xmatters.com/hc/en-us/articles/201463419-Integration-Agent-for-xMatters-5-x-xMatters-On-Demand).

### xMatters on Demand
1. Login to xMatters as a Developer and create a new user. 
2. Create a new REST user. See details [here](https://help.xmatters.com/integrations/xmatters/configuringxmatters.htm#Create)
2. Import the [NagiosXICommPlan.zip](NagiosXICommPlan.zip) communications plan. 
3. Next to the NagiosXI comm plan, click Edit > Access Permissions and give access to the user created in step 2. 
4. Click Edit > Forms and next to the Host Notification form, click Edit > Sender Permissions and give access to the user created in step 2. Repeat for the Service Notification form.
5. Navigate to the Integration Builder tab and expand the Inbound Integrations section. Click on `Inbound Host Events` and copy the URL at the bottom. Repeat for `Inbound Service Events`. 


### Integration Agent
1. Open the `IAHOME/conf/IAConfig.xml` file and navigate to the `<service-configs>` element near the bottom. Add the following two lines inside that tag:
```
    <path>applications/nagios/nagios_host.xml</path>
    <path>applications/nagios/nagios_service.xml</path>
```
2. Unzip the [NagiosXI-IAFiles.zip](NagiosXI-IAFiles.zip) to `IAHOME/integrationservices/applications/`. 
3. Open the `IAHOME/integrationservices/applications/nagios/configuration_host.js` file in a text editor. 
4. Update the `WEB_SERVICE_URL` value with the URL for the `Inbound Host Events` inbound integration copied from above. 
5. Update the `INITATOR` value to match the user created in xMatters above. 
6. Verify the `NAGIOS_COMMAND_FILE` path variable is correct. 
7. Repeat for the `configuration_service.js` file.
8. To encrypt the password, navigate to the `IAHOME/bin` directory and run the following command:
```bash
./iadmin.sh --new MYCOMPLEXPASSWORD --file integrationservices/applications/nagios/.initiatorpasswd
```
Replacing `MYCOMPLEXPASSWORD` with the password for the xMatters user. 
9. Open the `nagios_host.js` file and scroll down to the `execute` function. Update the path to the `printf_redirect.sh` script. Repeat for `nagios_service.js`.  

## Nagios XI set up
1. Login to Nagios XI and into the Core Config Manager. 
2. Click Commands and create two new commands with the following info:

| Command Name | Command |
| ------------ | ------- |
| xM-Agent-host | `IAHOME/bin/APClient.bin --map-data "applications|nagios-host" "host" "$HOSTNAME$" "$HOSTGROUPNAME$" "$HOSTADDRESS$" "$HOSTSTATE$" "$HOSTSTATEID$" "$LASTHOSTSTATE$" "$LASTHOSTSTATEID$" "$HOSTSTATETYPE$" "" "" "$HOSTEVENTID$" "$HOSTPROBLEMID$" "$HOSTOUTPUT$" "$LONGHOSTOUTPUT$" "$HOSTDOWNTIME$"` |
| xM-Agent-service | `IAHOME/bin/APClient.bin --map-data "applications|nagios-service" "service" "$HOSTNAME$" "$SERVICEDESC$" "$HOSTGROUPNAME$" "$HOSTADDRESS$" "$HOSTSTATE$" "$HOSTSTATEID$" "$HOSTEVENTID$" "$HOSTPROBLEMID$" "$SERVICESTATE$" "$SERVICESTATEID$" "$LASTSERVICESTATE$" "$LASTSERVICESTATEID$" "$SERVICESTATETYPE$" "" "" "$SERVICEEVENTID$" "$SERVICEPROBLEMID$" "$SERVICEOUTPUT$" "$LONGSERVICEOUTPUT$" "$SERVICEDOWNTIME$"` |

Make sure to replace `IAHOME` with the full path to the Integration Agent home directory. 

3. Click Contacts and create a new xMatters contact. Populate a Contact Name. 
2. On the Alert Settings tab, click on the Manage Host Notification Commands button and select the `xM-Agent-host` command from above. 
5. Repeat for the Manage Service Notification Commands but select the `xM-Agent-service` command. 

Finally, add the contact to a Service and/or a Host that needs to use the xMatters alerting capabilities as well as a Host and Service Group. These will be the targeted recipients when an event is triggered.  

# Testing
Make a service fail or a host bring a host offline that has the xMatters contact. This will trigger the command into the Integration Agent, which will create an event in xMatters. Responding with Acknowledge will acknowledge the Service or Host in Nagios.


# Troubleshooting

If events are not making it to users:

1. Check the Integration Agent log `IAHOME/log/AlarmPoint.txt` to make sure Nagios is actually attempting to send the event to the agent. 
2. Check the activity stream for the `Inbound Service Events` (or `Inbound Host Events`) inbound integration service and check for errors. 
3. Check the event log for any errors

If responses are not effecting changes in Nagios:

1. Check the Integration Agent log `IAHOME/log/AlarmPoint.txt` for any errors.


