
var fs = require('fs');
var BinaryFile = require('binary-file');

const myBinaryFile = new BinaryFile('dict_data/cdict-big5.idx', 'r');
var buf;

(async function () {
  try {
    await myBinaryFile.open();
    console.log('File opened');

    //const buffer = new ArrayBuffer(16)
    //const u8 = new UInt8Array(buffer)

    const size = await myBinaryFile.size();
    const data = await myBinaryFile.read(size);

    const index = await myBinaryFile.readUInt32();
    const length = await myBinaryFile.readUInt32();

    console.log(`File read: ${string}: ${index} ${length}`);
    await myBinaryFile.close();
    console.log('File closed');
  } catch (err) {
    console.log(`There was an error: ${err}`);
  }
})();
/*
myBinaryFile.open().then(function () {
  console.log('File opened');
  return myBinaryFile.size();
  
  //return myBinaryFile.readUInt32();
}).then(function (length) {
    console.log('File size:'+length);
    buf = new Buffer.alloc(size);
    return myBinaryFile.read(length, 0);
}).then(function (length) {
});
*/