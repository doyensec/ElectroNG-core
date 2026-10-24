import AsyncNedb from 'nedb-async';
import path from 'path';
import crypto from 'crypto';

export default class DB {

  constructor(name) {
  	this.name = name;
  	this.path = this.normalizePath(this.name);
  	this.secret = "b02510a885768fd95ab354895be610eb";
  	this.algorithm = "aes-256-cbc";
	this.dataStore = {};
  }


  /**
   * Returns the absolute path of the db inside the ElectroNG-core. It's necessary to avoid wrong absolute path
   * when electroNG-core is used as a module.
   * @param {*} name the db name inside electroNG-core to append
   */
  normalizePath(name) {
    // usually process.env.APP_PATH = /Users/<user>/Desktop/ElectroNG/release/mac/ElectroNG.app/Contents/Resources/app.asar or
    //                              = /Applications/ElectroNG.app/Contents/Resources/app.asar or
    //                              = /Users/<user>/Applications/ElectroNG.app/Contents/Resources/app.asar  

    const paths = {
      "db": {
        "electron":{
          "prod": `../ElectroNG-core/db/${name}.db`,
          "dev":  `../ElectroNG-core/db/${name}.db`
        },
        "library":{
          "dev":  `../db/${name}.db`
        }
      }
    };  

    let normalizedPath = ''  

    if (process.env.APP_PATH) { // library is called as a dependency by electron
      if (process.env.NODE_ENV === 'prod') { // library is used in electron in prod (webpack'd inside .app)
        normalizedPath = path.resolve(process.env.APP_PATH, paths["db"].electron.prod);
      } else { // library is used in electron in dev (local fs)
        normalizedPath = path.resolve(process.env.APP_PATH, paths["db"].electron.dev);
      }
    } else { // library is called bare (for dev or tests)
        normalizedPath = path.resolve('ElectroNG-core' + path.sep + paths["db"].library.dev);
    }  

    return normalizedPath;  

  }


  async init() {
  	let secret = this.secret;
  	let algorithm = this.algorithm;
  	this.dataStore = await new AsyncNedb({
		filename: this.path,
		autoload: true,
		afterSerialization(plaintext) {
		  const iv = crypto.randomBytes(16)
		  const aes = crypto.createCipheriv(algorithm, secret, iv)
		  let ciphertext = aes.update(plaintext)
		  ciphertext = Buffer.concat([iv, ciphertext, aes.final()])
		  return ciphertext.toString('base64')
		},
		beforeDeserialization(ciphertext) {
		  const ciphertextBytes = Buffer.from(ciphertext, 'base64')
		  const iv = ciphertextBytes.slice(0, 16)
		  const data = ciphertextBytes.slice(16)
		  const aes = crypto.createDecipheriv(algorithm, secret, iv)
		  let plaintextBytes = Buffer.from(aes.update(data))
		  plaintextBytes = Buffer.concat([plaintextBytes, aes.final()])
		  return plaintextBytes.toString()
		}
	})
  }

  async getAll() {
  	let res = await this.dataStore.asyncFind({});
  	return res;
  }

}