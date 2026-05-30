const { google } = require('googleapis');
const path = require('path');


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

        if (rowNames[0].toLowerCase() == 'id') {
            idLine = 0;
        } else {
            for (let i = 0; i < rowNames.length; i++) {
                if (rowNames[1].toLowerCase() == 'id') {
                    idLine = i;
                }
            }
        }
        if (idLine == null) {
            throw "No row is named " + this.idname;
        }
        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            if (rawDataBase[i][idLine] == id) {
                rowLine = i;
                const dataRow = rawDataBase[i];
                for (let x = 0; x < rowNames.length; x++) {
                    res[rowNames[x]] = dataRow[x];
                }
            }
        }
            const passToSave = this;
            res['save'] = async function () {
                //replace a range of values (3x3 grid, starting at H8)
                const saveRes = [];
                for (let i = 0; i < rowNames.length; i++) {
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
            res.push(data[rowNames[i]]);
        }
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

        for (let i = 0; i < rawDataBase.length; i++) {
            if (i <= 0) continue;
            const dataRow = rawDataBase[i];
            let line = {};
            for (let x = 0; x < rowNames.length; x++) {
                line[rowNames[x]] = dataRow[x];
            }
            returnData.push(line);
        }
        return returnData;
    }
}
