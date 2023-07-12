const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
ac.grant("admin")
 .createAny("category")
 .deleteAny("category")

ac.grant("admin")
 .createAny("permission")
 .readAny("permission")
 .updateAny("permission")
 .deleteAny("permission") 

 ac.grant("user")
 .createAny("category") 

return ac;
})();