const { DEFAULT_ROUTE_ADMIN, DEFAULT_PROFILE_ADMIN, DIRECTUS_URL } = require('./consts');
const moment = require('moment')
const randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
moment.locale("fr");

require('dotenv').config()


class Utils {

    constructor() {

    }

    static getEnvnow(req) {
        return req.app.settings.env
    }

    static getCoreUrl() {
        return process.env.CORE_URL
    }

    static getMoment() {
        return moment
    }

    static getRouteDeBase(profile) {
        if (profile == DEFAULT_PROFILE_ADMIN) {
            return DEFAULT_ROUTE_ADMIN
        }
        return ""
    }

    static generateCode(keyword) {
        let now = moment()
        let suffix = now.format("YYYYMMDDHH_mmss").substr(2) + "_" + Utils.generateNumberCodeSpecial()
        // remove 2 first chars
        let code = keyword + suffix
        return code
    }


    static isInteger(value) {
        return typeof value === 'number' && Number.isInteger(value);
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isObject(value) {
        return value !== null && typeof value === 'object';
    }

    static isArray(value) {
        return value !== null && typeof value === 'object' && value.constructor === Array;
    }

    static isArrayOfString(value) {
        return Utils.isArray(value) && value.every(Utils.isString) && value.length > 0;
    }

    static isArrayOfObject(value) {
        return Utils.isArray(value) && value.every(Utils.isObject) && value.length > 0;
    }

    static isArrayOfInteger(value) {
        return Utils.isArray(value) && value.every(Utils.isInteger) && value.length > 0;
    }

    static isArrayOfNumber(value) {
        return Utils.isArray(value) && value.every(Utils.isNumber) && value.length > 0;
    }

    static isArrayOfBoolean(value) {
        return Utils.isArray(value) && value.every(Utils.isBoolean) && value.length > 0;
    }

    static isValidUrl(value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
    }

    static validateServiceRoute(value) {
        const regex = /^(?!_)(?!.*_$)[a-zA-Z0-9_]+$/g;
        return regex.test(value)
    }

    /**
     * 
     * @param {*} str 
     * @returns 
     */
    static removeExtraSpace(str) {
        //str = str.replace(/[\s]{1,}/g, ""); // Enlève les espaces doubles, triples, etc.
        str = str.replace(/^[\s]{1,}/, ""); // Enlève les espaces au début
        str = str.replace(/[\s]{1,}$/, ""); // Enlève les espaces à la fin
        return str;
    }

    static cleanBlank(str) {
        return String(str).split(' ').join('') || "NA"
    }

    /* static formatDate(str) {
        console.log(str);
        let ndate = new Date(str)
        return moment(ndate).format('YYYY-MM-DD')
    } */

    static formatDate(str) {
        return moment(str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    static formatFieldData(svalue, vtype) {
        switch (vtype) {
            case 'simple-text':
                return svalue.toString();
            case 'long-text':
                return svalue.toString();
            case 'select':
                return svalue.toString();
            case 'boolean':
                return 'checkbox';
            case 'date':
                return svalue.toString();
            case 'time':
                return svalue.toString();
            case 'datetime':
                return svalue.toString();
            case 'email':
                return svalue.toString();
            case 'number':
                return parseFloat(svalue) || 0;
                // return parseFloat(svalue);
            case 'uuid':
                return svalue.toString();
            case 'integer':
                return parseInt(svalue);
            case 'float':
                return parseFloat(svalue);
            default:
                return svalue.toString();
        }
    }

    static formatData(sdata, vtypes) {
        let data = {}
        for (let key in sdata) {
            let value = sdata[key]
            let vtype = vtypes[key]
            let fvalue = Utils.formatFieldData(value, vtype)

            if (Number.isNaN(fvalue)) continue
            data[key] = fvalue
        }
        return data
    }

    static decodeJwtToken(token) {
        return jwt.decode(token)
    }

    static verifyJwtToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET)
    }

}

module.exports = Utils