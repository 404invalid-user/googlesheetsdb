import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth, AuthClient } from 'google-auth-library';
import path from 'path';
import fs from 'fs';


interface SheetData {
  [key: string]: any;
  save?: () => Promise<boolean>;
}


function ConstructSave(sheets: sheets_v4.Sheets | null, page: string, spreadsheetId: string, rowLine: number, rowNames: string[], res: SheetData): () => Promise<boolean> {
  return async function Save() {
    if (!sheets) {
      throw new Error("Could not save: Sheets API not initialized. this should never happen :/");
    }
    if (!spreadsheetId || !page) {
      throw new Error("Could not save: Missing spreadsheetId or page information. this should never happen :/");
    }

    const saveRes: any[] = [];
    for (let i = 0; i < rowNames.length; i++) {
      saveRes.push(res[rowNames[i]]);
    }

    try {
      const l = await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: page + '!A' + (rowLine + 1).toString(),
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [saveRes]
        }
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

class SheetDB {
  private authManager: GoogleAuth | null = null;
  private client: AuthClient | null = null;
  private sheets: sheets_v4.Sheets | null = null;

  private spreadsheetId: string;
  private page: string;
  private idCell: string;

  constructor(spreadsheetId: string, page: string, idName: string = 'id') {
    this.spreadsheetId = spreadsheetId;
    this.page = page;
    this.idCell = idName.toString();
  }

  async setup(keyFilePath: string): Promise<void> {
    const normalizedPath = path.normalize(keyFilePath);
    if (!path.isAbsolute(normalizedPath)) {
      throw new Error('Invalid key file path. Path must be absolute.');
    }
    if (!fs.existsSync(normalizedPath)) {
      throw new Error('Key file does not exist at path: ' + normalizedPath);
    }

    this.authManager = new google.auth.GoogleAuth({
      keyFile: normalizedPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.client = await this.authManager.getClient();
    this.sheets = google.sheets({
      version: 'v4',
      auth: this.authManager
    });
  }

  async findById(id: string): Promise<SheetData> {

    if (!this.sheets || !this.authManager) {
      throw new Error("Sheets API not initialized. Call setup() first.");
    }

    let res: SheetData = {};
    let rowLine: number = 0;
    let idLine: number = 0;

    const getRows = await this.sheets.spreadsheets.values.get({
      auth: this.authManager,
      spreadsheetId: this.spreadsheetId,
      range: this.page
    })
    const rawDataBase = getRows.data.values ?? [];
    const rowNames = rawDataBase[0];

    if (rowNames.length == 0) {
      throw "No rows found in the sheet.";
    }
    if (rowNames[0].toLowerCase() == this.idCell) {
      idLine = 0;
    } else {
      for (let i = 0; i < rowNames.length; i++) {
        if (rowNames[1].toLowerCase() == 'id') {
          idLine = i;
        }
      }
    }
    if (idLine == null) {
      throw "No row is named " + idLine;
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
    if (res !== null) {
      res['save'] = ConstructSave(this.sheets, this.page, this.spreadsheetId, rowLine, rowNames, res);
    }
    return res;
  }

  async create(data: SheetData): Promise<boolean> {
    data.save = undefined;
    const res: any[] = [];
    if (!this.sheets || !this.authManager) {
      throw new Error("Sheets API not initialized. Call setup() first.");
    }
    let getRows = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.page
    });

    const rowNames = getRows.data.values ? getRows.data.values[0] : [];
    for (let i = 0; i < rowNames.length; i++) {
      res.push(data[rowNames[i]]);
    }
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: this.page,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [res]
        }
      });
      return true;
    } catch (e) {
      throw e;
    }
  }

  async getAll() {
    let returnData: any[] = [];
    if (!this.sheets || !this.authManager) {
      throw new Error("Sheets API not initialized. Call setup() first.");
    }
    const getRows = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.page
    })
    const rawDataBase = getRows.data.values ?? [];
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

export default SheetDB;