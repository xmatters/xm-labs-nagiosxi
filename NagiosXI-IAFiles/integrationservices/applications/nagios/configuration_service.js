// ----------------------------------------------------------------------------------------------------
// Configuration settings for an xMatters Relevance Engine Integration
// ----------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------
// The url that will be used to inject events into xMatters.
// ----------------------------------------------------------------------------------------------------
WEB_SERVICE_URL = "https://acme.xmatters.com/api/integration/1/functions/UUID/";

// ----------------------------------------------------------------------------------------------------
// The location of the Nagios Command file for processing responses back to Nagios.
//  Example:  NAGIOS_COMMAND_FILE = "/usr/local/nagios/var/rw/nagios.cmd";
// ----------------------------------------------------------------------------------------------------
NAGIOS_COMMAND_FILE = "/usr/local/nagios/var/rw/nagios.cmd";

// ----------------------------------------------------------------------------------------------------
// Callbacks requested for this integration service.
// ----------------------------------------------------------------------------------------------------
CALLBACKS = ["status", "deliveryStatus", "response"];

// ----------------------------------------------------------------------------------------------------
// The username used to authenticate the request to xMatters.
// The user's password should be encrypted using the iapassword.sh utility.
// Please see the integration agent documentation for instructions.
// ----------------------------------------------------------------------------------------------------
INITIATOR = "nmonxi";
PASSWORD = "integrationservices/applications/nagios/.initiatorpasswd";

// ----------------------------------------------------------------------------------------------------
// Filter to use in <IAHOME>/conf/deduplicator-filter.xml
// ----------------------------------------------------------------------------------------------------
DEDUPLICATION_FILTER_NAME = "nagiosxi-service";
