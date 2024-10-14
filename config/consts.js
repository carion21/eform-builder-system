
class Consts {
    static NLIMIT = 10;

    static PORT_SYSTEM = 9555
    static APP_NAME = "eFormBuilder"
    static APP_AUTHOR = "Carion21"
    static APP_VERSION = "1.0.0"
    static APP_DESCRIPTION = "eForm Builder"

    static USERPROFILE_TYPE_UNDEFINED = 0;
    static USERPROFILE_TYPE_ADMIN = 1;
    static USERPROFILE_TYPE_SUPERVISOR = 2;
    static USERPROFILE_TYPE_SAMPLER = 3;

    static USERPROFILE_TYPES = [
        Consts.USERPROFILE_TYPE_ADMIN,
        Consts.USERPROFILE_TYPE_SUPERVISOR,
        Consts.USERPROFILE_TYPE_SAMPLER,
    ];

    static DEFAULT_PROFILE_ADMIN = "admin";
    static DEFAULT_PROFILE_SUPERVISOR = "supervisor";
    static DEFAULT_PROFILE_SAMPLER = "sampler";


    static DEFAULT_PROFILES = [
        Consts.DEFAULT_PROFILE_ADMIN,
        Consts.DEFAULT_PROFILE_SUPERVISOR,
        Consts.DEFAULT_PROFILE_SAMPLER,
    ];

    static DEFAULT_ROUTE_BUILD = "/build";
    static DEFAULT_ROUTE_VIEW = "/view";
    static DEFAULT_ROUTE_STORE = "/store";
    static DEFAULT_ROUTE_ADMIN = "/" + Consts.DEFAULT_PROFILE_ADMIN;
    static DEFAULT_ROUTE_SUPERVISOR = "/" + Consts.DEFAULT_PROFILE_SUPERVISOR;
    static DEFAULT_ROUTE_SAMPLER = "/" + Consts.DEFAULT_PROFILE_SAMPLER;

    static DEFAULT_ROUTES = {
        [Consts.USERPROFILE_TYPE_ADMIN]: Consts.DEFAULT_ROUTE_ADMIN,
        [Consts.USERPROFILE_TYPE_SUPERVISOR]: Consts.DEFAULT_ROUTE_SUPERVISOR,
        [Consts.USERPROFILE_TYPE_SAMPLER]: Consts.DEFAULT_ROUTE_SAMPLER,
    };

    static DEFAULT_TYPES = [
        "string",
        "string_not_empty",
        "string_email",
        "string_date",
        "string_integer",
        "string_boolean",
        "number",
        "integer",
        "boolean",
        "object",
        "array",
        "array_of_string",
        "array_of_number",
        "array_of_integer",
        "array_of_boolean",
        "array_of_object",
        "array_of_string_integer"
    ];


    static SERVICE_TYPES = [
        "undefined",
        "security_login",
        "admin_search_spot",
        "admin_search_top",
        "admin_set_settings",
        "admin_account_details",
        "admin_security",
    ];

    static SERVICE_TYPES_FIELDS = {
        "undefined": {},
        "security_login": {
            "fields": ["email", "password"],
            "types": ["string_email", "string"],
            "required": ["email", "password"]
        },
        "new_form": {
            "fields": ["project", "name", "description", "fields"],
            "types": ["string_integer", "string", "string", "array_of_object"],
            "required": ["project", "name", "fields"]
        },
        "edit_form": {
            "fields": ["formUuid", "name", "description", "fields"],
            "types": ["string", "string", "string", "array_of_object"],
            "required": ["formUuid", "name", "fields"]
        },
    };

}

module.exports = Consts;