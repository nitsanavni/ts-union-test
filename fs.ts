import { writeFile as fsWriteFile, unlink as fsUnlink } from "fs";
import { promisify } from "util";

export const [writeFile, unlink] = [fsWriteFile, fsUnlink].map(promisify);
