const { google } = require('googleapis');
const path = require('path');
const debug = false;

module.exports.Sheet = class {
    constructor(spreadsheetId, page, idname) {
        const idcell = idname? idname.toString() : 'id';
        this.idcell = idcell;
        this.spreadsheetId = spreadsheetId;
        this.page = page;
        this.auth;
        this.client;
        this.sheets;
    }
    async setup(keyFilePath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname + '/../', keyFilePath),
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        }).catch(err => {
            throw err;
        });
        this.client = await this.auth.getClient();
        this.sheets = await google.sheets({ version: 'v4', auth: this.client });
        return true;
    }

    async getbyid(id) {
        let res = {};
        let rowLine = null;
        let idLine = null;

        const getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: this.page
        })
        const rawDataBase = getRows.data.values;
        const rowNames = rawDataBase[0];

        if (rowNames[0].toLowerCase() == this.idcell) {
            idLine = 0;
            if (debug) console.log("id row :0")
        } else {
            for (let i = 0; i < rowNames.length; i++) {
                if (rowNames[1].toLowerCase() == 'id') {
                    if (debug) console.log("found id row :" + i)
                    idLine = i;
                }
            }
        }
        if (idLine == null) {
            throw "No row is named id";
        }
        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            if (debug) console.log("---lppong raw db line: " + i + "\n ");
            if (rawDataBase[i][idLine] == id) {
                rowLine = i;
                const dataRow = rawDataBase[i];
                for (let x = 0; x < rowNames.length; x++) {
                    if (debug) console.log("---loop row names line: " + x + " \n" + rowNames[x] + '=' + dataRow[x] + "\n----\n");
                    res[rowNames[x]] = dataRow[x];
                }
            }
        }
        if (res !== null) {
            const passToSave = this;
            res['save'] = async function () {
                if (debug) console.log(res);
                //replace a range of values (3x3 grid, starting at H8)
                const saveRes = [];
                for (let i = 0; i < rowNames.length; i++) {
                    if (debug) console.log(`${rowNames[i]}`);
                    saveRes.push(res[rowNames[i]]);
                }
                const l = await passToSave.sheets.spreadsheets.values.update({
                    auth: passToSave.auth,
                    spreadsheetId: passToSave.spreadsheetId,
                    range: passToSave.page + '!A' + (rowLine + 1).toString(),
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [saveRes]
                    }
                }).catch(error => {
                    throw error
                });
                return l;
            }
        }
        return res;
    }

    async create(data) {
        const res = [];
        let getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: this.page
        })
        const rowNames = getRows.data.values[0];
        getRows = null;
        for (let i = 0; i < rowNames.length; i++) {
            if (debug) console.log(`${rowNames[i]}`);
            res.push(data[rowNames[i]]);
        }
        if (debug) console.log(res)
        await this.sheets.spreadsheets.values.append({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: this.page,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [res]
            }
        }).catch(e => {
            throw e;
        })
        return true;
    }

    async getall() {
        let returnData = [];
        const getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: this.page
        })
        const rawDataBase = getRows.data.values;
        const rowNames = rawDataBase[0];
        console.log(rawDataBase)

        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            const dataRow = rawDataBase[i];
            if (debug) console.log("---lppong raw db line: " + i + "\n ");
            let line = {};
            for (let x = 0; x < rowNames.length; x++) {
                if (debug) console.log("---loop row names line: " + x + " \n" + rowNames[x] + '=' + dataRow[x] + "\n----\n");
                line[rowNames[x]] = dataRow[x];
            }
            returnData.push(line);
        }
        return returnData;
    }
}

module.exports.Sheets = class {
    constructor(idname) {
        this.auth;
        this.client;
        this.sheets;
        this.idname = idname;
    }
    async setup(keyFilePath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: keyFile,
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        });
        this.client = await this.auth.getClient();
        this.sheets = google.sheets({ version: 'v4', auth: this.client });
    }

    async getbyid(id, sheetid, page) {
        let res = {};
        let rowLine = null;
        let idLine = null;

        const getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: sheetid,
            range: page
        })
        const rawDataBase = getRows.data.values;
        const rowNames = rawDataBase[0];
        if (debug) console.log(rawDataBase);

        if (rowNames[0].toLowerCase() == 'id') {
            idLine = 0;
            if (debug) console.log("id row :0")
        } else {
            for (let i = 0; i < rowNames.length; i++) {
                if (rowNames[1].toLowerCase() == 'id') {
                    if (debug) console.log("found id row :" + i)
                    idLine = i;
                }
            }
        }
        if (idLine == null) {
            throw "No row is named " + this.idname;
        }
        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            if (debug) console.log("---\nlppong raw db line: " + i + "\n ");
            if (rawDataBase[i][idLine] == id) {
                rowLine = i;
                const dataRow = rawDataBase[i];
                if (debug) console.log("rowNames.length = " + rowNames.length)
                for (let x = 0; x < rowNames.length; x++) {
                    if (debug) console.log(" loop x = " + x)
                    if (debug) console.log("----\nloop row names line: " + x + " \n" + rowNames[x] + ' = ' + dataRow[x] + "\n----\n");
                    res[rowNames[x]] = dataRow[x];
                }
            }
        }
            const passToSave = this;
            res['save'] = async function () {
                if (debug) console.log(res);
                //replace a range of values (3x3 grid, starting at H8)
                const saveRes = [];
                for (let i = 0; i < rowNames.length; i++) {
                    if (debug) console.log(`${rowNames[i]}`);
                    saveRes.push(res[rowNames[i]]);
                }
                const l = await passToSave.sheets.spreadsheets.values.update({
                    auth: passToSave.auth,
                    spreadsheetId: sheetid,
                    range: page + '!A' + (rowLine + 1).toString(),
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [saveRes]
                    }
                });
                return l;
            }
        return res;
    }

    async create(data,sheetid, page) {
        const res = [];
        let getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: sheetid,
            range: page
        })
        const rowNames = getRows.data.values[0];
        getRows = null;
        for (let i = 0; i < rowNames.length; i++) {
            if (debug) console.log(`${rowNames[i]}`);
            res.push(data[rowNames[i]]);
        }
        if (debug) console.log(res)
        await this.sheets.spreadsheets.values.append({
            auth: this.auth,
            spreadsheetId: ssheetid,
            range: page,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [res]
            }
        }).catch(e => {
            throw e;
        })
        return true;
    }

    async getall(sheetid, page) {
        let returnData = [];
        const getRows = await this.sheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: sheetid,
            range: page
        })
        const rawDataBase = getRows.data.values;
        const rowNames = rawDataBase[0];
        console.log(rawDataBase)

        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            const dataRow = rawDataBase[i];
            if (debug) console.log("---lppong raw db line: " + i + "\n ");
            let line = {};
            for (let x = 0; x < rowNames.length; x++) {
                if (debug) console.log("---loop row names line: " + x + " \n" + rowNames[x] + '=' + dataRow[x] + "\n----\n");
                line[rowNames[x]] = dataRow[x];
            }
            returnData.push(line);
        }
        return returnData;
    }
}