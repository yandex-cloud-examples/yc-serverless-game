import * as pako from 'pako';
import { ClientMessage, ServerMessage } from '../../common/ws/messages';
import { safeJsonParse } from '../../common/utils/safe-json-parse';

const textDecoder = new TextDecoder();

export const compressMessage = (message: ClientMessage) => {
    const stringified = JSON.stringify(message);

    return pako.gzip(stringified);
};

export const decompressMessage = async (data: Blob): Promise<ServerMessage | undefined> => {
    const buff = await data.arrayBuffer();
    const decompresssed = pako.ungzip(buff);

    return safeJsonParse(textDecoder.decode(decompresssed));
};
