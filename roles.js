const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
ac.grant("admin")
 .createAny("category")
 .deleteAny("category")

return ac;
})();