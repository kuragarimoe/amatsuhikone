const { Console } = require("console");
const fs = require("fs");

class Osz2 {
    constructor(file) {
        /**
         * The buffer of the file.
         * @name Osz2#buffer
         * @type {Buffer}
         */
        if (file instanceof Buffer) {
            this.buffer = file;
        } else {
            // assume it's a string
            this.buffer = fs.readFileSync(file);
        }

        /**
         * The current internal read offset of the Osz2 buffer.
         * @type {number}
         * @readonly
         */
        this.offset = 0;

        // validate the magic number
        if (parseInt(this.read(3, 0).toString("hex"), 16) !== 0xEC484F) {
            throw new ReferenceError("This is not a valid ozs2 file.")
        }

        /**
         * The version of the osz2 file.
         * @type {number}
         */
        this.version = this.read(1)[0];

        // handle iv
        

        /**
         * The encrypted IV of the osz2 file.
         */
        this.encrypted_iv = this.read(16).toString("utf8");

        /**
         * The hash of the block of metadata.
         * @type {Buffer} 
         */
        this.metadata_hash = this.read(16);

        /**
         * The hash of the block of file information.
         * @type {Buffer} 
         */
        this.fileinfo_hash = this.read(16);

        /**
         * The hash of the block of files.
         * @type {Buffer} 
         */
        this.file_hash = this.read(16);
    }

    /**
     * Parses the osz2's buffer fully.
     * @returns {Osz2}
     */
    parse() {
        /// handle metadata block ///
        let metadataSize = this.read(4).readUInt32LE(0);
        let metadata = [];

        for (let i = 0; i < metadataSize; i++) {
            let type = this.read(2).readUInt16LE(0);
            let len = readULEB128(this.buffer.slice(this.offset))
            let string = this.read(len.value, this.offset + len.length);

            metadata.push({
                type: type,
                string: string.toString("utf8")
            });
        }

        /// handle file info block ///
        console.log(metadata)
        console.log(this.offset)
        let fileinfoLength = this.read(4).readUInt32LE(0);
        let fileInfoSize = this.read(4).readUInt32LE(0);

        console.log(fileinfoLength);
        console.log(fileInfoSize);

        return this;
    }

    /**
     * Reads a specific chain of bytes from the buffer.
     * @param {number} offset The offset to start at.
     * @param {number} length The amount of bytes to read.
     */
    read(length, offset = this.offset) {
        let ret = this.buffer.slice(offset, offset + length);

        this.offset = offset + (length);
        return ret
    }
}

function readULEB128(arr) {
    var total = 0;
    var shift = 0;
    var len = 0;

    while (true) {
        var byte = arr[len];
        len++;
        total |= ((byte & 0x7F) << shift);
        if ((byte & 0x80) === 0) break;
        shift += 7;
    }

    return {
        value: total,
        length: len
    };
}

module.exports = Osz2;